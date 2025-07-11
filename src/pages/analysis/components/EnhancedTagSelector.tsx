import { type ApiTagItem } from './TagSelector'
import { 
    SearchOutlined, 
    TagOutlined, 
    FilterOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    SortAscendingOutlined,
    CheckOutlined,
    PlusOutlined
} from '@ant-design/icons'
import { 
    Drawer, 
    Input, 
    Button, 
    Space, 
    Radio, 
    Badge, 
    Empty,
    Tooltip,
    Card,
    Divider,
    Collapse
} from 'antd'
import { FC, useState, useMemo } from 'react'

// 标签类型映射
const WIDGET_TYPE_MAP: Record<number, string> = {
    1: 'multi',
    2: 'single', 
    3: 'dateRange',
    4: 'numberRange',
    5: 'numberRange'
}

const TYPE_LABELS: Record<string, string> = {
    multi: '多选',
    single: '单选',
    dateRange: '日期范围',
    numberRange: '数值范围',
    text: '文本'
}

const TYPE_COLORS: Record<string, string> = {
    multi: '#52c41a',
    single: '#1890ff',
    dateRange: '#fa8c16',
    numberRange: '#722ed1',
    text: '#eb2f96'
}

interface EnhancedTagSelectorProps {
    open: boolean
    onClose: () => void
    onSelect: (tagName: string) => void
    selectedNames: string[]
    apiTags: ApiTagItem[]
}

const EnhancedTagSelector: FC<EnhancedTagSelectorProps> = ({
    open,
    onClose,
    onSelect,
    selectedNames,
    apiTags
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'category' | 'order'>('category')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    // 转换API数据为可用格式
    const processedTags = useMemo(() => {
        return apiTags
            .filter(tag => tag.status === 1)
            .map(tag => ({
                ...tag,
                type: WIDGET_TYPE_MAP[tag.widgetType] || 'text',
                isSelected: selectedNames.includes(tag.labelZhName)
            }))
    }, [apiTags, selectedNames])

    // 获取所有分类
    const categories = useMemo(() => {
        const cats = [...new Set(processedTags.map(tag => tag.typeZhName))]
        return cats.sort()
    }, [processedTags])

    // 过滤和排序标签
    const filteredAndSortedTags = useMemo(() => {
        let filtered = processedTags.filter(tag => {
            const matchesSearch = tag.labelZhName.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === 'all' || tag.typeZhName === selectedCategory
            return matchesSearch && matchesCategory
        })

        // 排序
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.labelZhName.localeCompare(b.labelZhName)
                case 'order':
                    return a.order - b.order
                case 'category':
                default:
                    return a.typeZhName.localeCompare(b.typeZhName) || a.order - b.order
            }
        })

        return filtered
    }, [processedTags, searchTerm, selectedCategory, sortBy])

    // 按分类分组
    const groupedTags = useMemo(() => {
        const groups: Record<string, typeof filteredAndSortedTags> = {}
        filteredAndSortedTags.forEach(tag => {
            if (!groups[tag.typeZhName]) {
                groups[tag.typeZhName] = []
            }
            groups[tag.typeZhName].push(tag)
        })
        return groups
    }, [filteredAndSortedTags])

    const handleTagSelect = (tagName: string) => {
        onSelect(tagName)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setSelectedCategory('all')
    }

    const TagCard: FC<{ tag: any; compact?: boolean }> = ({ tag, compact = false }) => (
        <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                tag.isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
            }`}
            bodyStyle={{ padding: compact ? '12px' : '16px' }}
            onClick={() => handleTagSelect(tag.labelZhName)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-${compact ? 'sm' : 'base'} font-medium text-gray-800`}>
                            {tag.labelZhName}
                        </span>
                        {tag.isSelected && (
                            <CheckOutlined className="text-blue-500 text-sm" />
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge
                            color={TYPE_COLORS[tag.type]}
                            text={TYPE_LABELS[tag.type]}
                        />
                        <span className="text-xs text-gray-500">
                            {tag.typeZhName}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    {!tag.isSelected && (
                        <PlusOutlined className="text-gray-400 text-sm" />
                    )}
                </div>
            </div>
        </Card>
    )

    const renderGridView = () => {
        // 按分类显示，确保每个分类都有自己的标签
        const displayGroups = selectedCategory === 'all' ? groupedTags : { [selectedCategory]: groupedTags[selectedCategory] || [] }
        
        // 准备Collapse的items
        const collapseItems = Object.entries(displayGroups).map(([category, tags]) => ({
            key: category,
            label: (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                        <TagOutlined className="text-blue-500" />
                        <span className="font-medium text-gray-800">{category}</span>
                    </div>
                    <Badge count={tags.length} showZero />
                </div>
            ),
            children: (
                <div className="p-2">
                    {tags.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tags.map(tag => (
                                <TagCard key={tag.id} tag={tag} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <TagOutlined className="text-2xl mb-2" />
                            <div>该分类暂无标签</div>
                        </div>
                    )}
                </div>
            )
        }))
        
        return (
            <Collapse
                items={collapseItems}
                defaultActiveKey={Object.keys(displayGroups)}
                ghost
                className="bg-transparent"
            />
        )
    }

    const renderListView = () => {
        // 按分类显示，确保每个分类都有自己的标签
        const displayGroups = selectedCategory === 'all' ? groupedTags : { [selectedCategory]: groupedTags[selectedCategory] || [] }
        
        // 准备Collapse的items
        const collapseItems = Object.entries(displayGroups).map(([category, tags]) => ({
            key: category,
            label: (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                        <TagOutlined className="text-blue-500" />
                        <span className="font-medium text-gray-800">{category}</span>
                    </div>
                    <Badge count={tags.length} showZero />
                </div>
            ),
            children: (
                <div className="p-2">
                    {tags.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {tags.map(tag => (
                                <div
                                    key={tag.id}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                                        tag.isSelected 
                                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                    onClick={() => handleTagSelect(tag.labelZhName)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                tag.isSelected ? 'bg-blue-500' : 'bg-gray-300'
                                            }`} />
                                            <div>
                                                <div className="font-medium text-gray-800 text-sm">
                                                    {tag.labelZhName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge
                                                color={TYPE_COLORS[tag.type]}
                                                text={TYPE_LABELS[tag.type]}
                                            />
                                            {tag.isSelected && (
                                                <CheckOutlined className="text-blue-500 text-sm" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <TagOutlined className="text-2xl mb-2" />
                            <div>该分类暂无标签</div>
                        </div>
                    )}
                </div>
            )
        }))
        
        return (
            <Collapse
                items={collapseItems}
                defaultActiveKey={Object.keys(displayGroups)}
                ghost
                className="bg-transparent"
            />
        )
    }

    return (
        <Drawer
            title={
                <div className="flex items-center space-x-2">
                    <TagOutlined className="text-blue-500" />
                    <span>选择分析标签</span>
                    <Badge count={selectedNames.length} className="ml-2" />
                </div>
            }
            open={open}
            onClose={onClose}
            width={720}
            placement="left"
            className="enhanced-tag-selector"
            bodyStyle={{ padding: 0 }}
        >
            <div className="h-full flex flex-col">
                {/* 搜索和过滤栏 */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <Space direction="vertical" size="middle" className="w-full">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="搜索标签名称..."
                                    prefix={<SearchOutlined className="text-gray-400" />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    allowClear
                                    size="large"
                                />
                            </div>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={handleClearSearch}
                                size="large"
                            >
                                清除
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700">分类筛选:</span>
                                    <Badge count={filteredAndSortedTags.length} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Tooltip title="排序方式">
                                        <Radio.Group
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            size="small"
                                        >
                                            <Radio.Button value="category">
                                                <SortAscendingOutlined />
                                            </Radio.Button>
                                            <Radio.Button value="name">名称</Radio.Button>
                                            <Radio.Button value="order">顺序</Radio.Button>
                                        </Radio.Group>
                                    </Tooltip>
                                    
                                    <Divider type="vertical" />
                                    
                                    <Tooltip title="视图模式">
                                        <Radio.Group
                                            value={viewMode}
                                            onChange={(e) => setViewMode(e.target.value)}
                                            size="small"
                                        >
                                            <Radio.Button value="grid">
                                                <AppstoreOutlined />
                                            </Radio.Button>
                                            <Radio.Button value="list">
                                                <UnorderedListOutlined />
                                            </Radio.Button>
                                        </Radio.Group>
                                    </Tooltip>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type={selectedCategory === 'all' ? 'primary' : 'default'}
                                    size="small"
                                    onClick={() => setSelectedCategory('all')}
                                    className="flex items-center"
                                >
                                    <span>全部</span>
                                    <Badge count={processedTags.length} size="small" className="ml-1" />
                                </Button>
                                {categories.map(cat => {
                                    const categoryCount = processedTags.filter(tag => tag.typeZhName === cat).length
                                    return (
                                        <Button
                                            key={cat}
                                            type={selectedCategory === cat ? 'primary' : 'default'}
                                            size="small"
                                            onClick={() => setSelectedCategory(cat)}
                                            className="flex items-center"
                                        >
                                            <span>{cat}</span>
                                            <Badge count={categoryCount} size="small" className="ml-1" />
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>
                    </Space>
                </div>

                {/* 标签内容区 */}
                <div className="flex-1 overflow-auto p-6">
                    {filteredAndSortedTags.length > 0 ? (
                        <div className="space-y-6">
                            {viewMode === 'grid' ? renderGridView() : renderListView()}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <Empty
                                description={
                                    <div className="text-center">
                                        <div className="text-gray-500 mb-2">
                                            {searchTerm ? '未找到匹配的标签' : '暂无可用标签'}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {searchTerm ? '尝试调整搜索条件' : '请联系管理员添加标签'}
                                        </div>
                                    </div>
                                }
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </div>
                    )}
                </div>

                {/* 底部操作栏 */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            已选择 <span className="font-medium text-blue-600">{selectedNames.length}</span> 个标签
                            {filteredAndSortedTags.length > 0 && (
                                <span className="ml-2">
                                    / 共 <span className="font-medium">{filteredAndSortedTags.length}</span> 个可用
                                </span>
                            )}
                        </div>
                        <Button type="primary" onClick={onClose} size="large">
                            确定
                        </Button>
                    </div>
                </div>
            </div>

            {/* 自定义样式 */}
            <style>{`
                .enhanced-tag-selector .ant-drawer-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-bottom: none;
                }
                
                .enhanced-tag-selector .ant-drawer-title {
                    color: white;
                }
                
                .enhanced-tag-selector .ant-drawer-close {
                    color: white;
                }
                
                .enhanced-tag-selector .ant-drawer-close:hover {
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .enhanced-tag-selector .ant-collapse-ghost > .ant-collapse-item {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                }
                
                .enhanced-tag-selector .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header {
                    background: #f8fafc;
                    border-radius: 8px 8px 0 0;
                }
                
                .enhanced-tag-selector .ant-collapse-ghost > .ant-collapse-item:not(.ant-collapse-item-active) > .ant-collapse-header {
                    border-radius: 8px;
                }
                
                /* 自定义Badge样式 */
                .enhanced-tag-selector .ant-badge-count {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: #667eea;
                    color: white;
                    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
                }
                
                .enhanced-tag-selector .ant-badge-count.ant-badge-multiple-words {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                
                .enhanced-tag-selector .ant-scroll-number {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: #667eea;
                    color: white;
                }
            `}</style>
        </Drawer>
    )
}

export default EnhancedTagSelector