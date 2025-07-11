import EnhancedProfileHistory from './EnhancedProfileHistory'
import { 
    HistoryOutlined, 
    UserOutlined, 
    TagOutlined, 
    ClockCircleOutlined,
    EyeOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    ShareAltOutlined
} from '@ant-design/icons'
import { Modal, Dropdown, Menu, Badge, Progress, Tooltip } from 'antd'
import { FC, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SelectedTag {
    name: string
    values: string[]
}

interface Profile {
    id: string
    name: string
    tags: SelectedTag[]
    updateTime: string
    userCount: number
}

// 从标签名推断分类的辅助函数
const inferCategoryFromTagName = (tagName: string): string => {
    const categoryMap: Record<string, string> = {
        '用户来源': '用户基础标签',
        '注册时间': '用户基础标签',
        '年龄': '用户基础标签',
        '性别': '用户基础标签',
        'VIP等级': '用户业务基础标签',
        'vip等级': '用户业务基础标签',
        '钱包余额': '用户业务基础标签',
        '余额宝': '用户业务基础标签',
        '金币余额': '用户业务基础标签',
        '是否近7日活跃': '用户业务行为标签',
        '近30日存款': '用户业务行为标签',
        '近30日提款': '用户业务行为标签',
        '近7日投注': '用户业务行为标签',
        '频道浏览': '用户浏览行为标签',
        '场馆浏览': '用户浏览行为标签',
        '存款占比': '用户财务通道标签',
        '提款被拒': '用户风控标签',
        '预警次数': '用户风控标签',
        '黑名单': '用户风控标签',
        '灰名单': '用户风控标签',
        '活跃时间': '用户行为喜好标签'
    }

    // 尝试精确匹配
    if (categoryMap[tagName]) {
        return categoryMap[tagName]
    }

    // 模糊匹配
    for (const [key, category] of Object.entries(categoryMap)) {
        if (tagName.includes(key) || key.includes(tagName)) {
            return category
        }
    }

    return '其他标签'
}

// 获取分类对应的颜色
const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
        '用户基础标签': '#1890ff',
        '用户业务基础标签': '#52c41a',
        '用户业务行为标签': '#fa8c16',
        '用户浏览行为标签': '#722ed1',
        '用户财务通道标签': '#eb2f96',
        '用户风控标签': '#f5222d',
        '用户行为喜好标签': '#13c2c2',
        '其他标签': '#8c8c8c'
    }
    return colorMap[category] || '#8c8c8c'
}

/**
 * 增强版用户画像卡片组件
 */
const EnhancedProfileCard: FC<{ profile: Profile }> = ({ profile }) => {
    const navigate = useNavigate()
    const [historyOpen, setHistoryOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    // 计算不同分类的标签数量
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {}
        profile.tags.forEach((t) => {
            const cat = inferCategoryFromTagName(t.name)
            counts[cat] = (counts[cat] ?? 0) + 1
        })
        
        return Object.entries(counts).map(([name, count]) => ({
            name,
            count,
            color: getCategoryColor(name),
            percentage: Math.round((count / profile.tags.length) * 100)
        }))
    }, [profile.tags])

    // 计算活跃度（基于用户数量）
    const activityLevel = useMemo(() => {
        if (profile.userCount > 5000) return { level: 'high', label: '高活跃', color: '#52c41a' }
        if (profile.userCount > 1000) return { level: 'medium', label: '中活跃', color: '#fa8c16' }
        return { level: 'low', label: '低活跃', color: '#ff4d4f' }
    }, [profile.userCount])

    // 计算标签完整度
    const completeness = Math.min(Math.round((profile.tags.length / 10) * 100), 100)

    const handleCardClick = () => {
        navigate(`/my/${profile.id}`)
    }

    const handleMenuClick = (e: any) => {
        e.domEvent.stopPropagation()
        const { key } = e
        
        switch (key) {
            case 'edit':
                navigate(`/analysis`) // 可以传递参数来编辑现有画像
                break
            case 'history':
                setHistoryOpen(true)
                break
            case 'share':
                // TODO: 实现分享功能
                break
            case 'delete':
                // TODO: 实现删除功能
                break
        }
    }

    const menu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="edit" icon={<EditOutlined />}>
                编辑画像
            </Menu.Item>
            <Menu.Item key="history" icon={<HistoryOutlined />}>
                历史版本
            </Menu.Item>
            <Menu.Item key="share" icon={<ShareAltOutlined />}>
                分享画像
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                删除画像
            </Menu.Item>
        </Menu>
    )

    return (
        <>
            <div 
                className={`
                    relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg 
                    transition-all duration-300 cursor-pointer overflow-hidden
                    ${isHovered ? 'shadow-2xl transform -translate-y-1' : ''}
                `}
                onClick={handleCardClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* 背景渐变效果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
                
                {/* 卡片头部 */}
                <div className="relative p-6 pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                                    {profile.name}
                                </h3>
                                <Badge 
                                    color={activityLevel.color} 
                                    text={activityLevel.label}
                                    className="text-xs"
                                />
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <TagOutlined className="mr-1" />
                                    {profile.tags.length} 个标签
                                </span>
                                <span className="flex items-center">
                                    <UserOutlined className="mr-1" />
                                    {profile.userCount.toLocaleString()} 用户
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Tooltip title="查看详情">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                                    <EyeOutlined className="text-blue-600 text-sm" />
                                </div>
                            </Tooltip>
                            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
                                <div 
                                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreOutlined className="text-gray-600 text-sm" />
                                </div>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* 标签分类统计 */}
                <div className="relative px-6 pb-4">
                    <div className="space-y-2">
                        {categoryData.slice(0, 3).map((category) => (
                            <div key={category.name} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span className="text-sm text-gray-700 truncate">
                                        {category.name}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-800">
                                        {category.count}
                                    </span>
                                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{ 
                                                width: `${category.percentage}%`,
                                                backgroundColor: category.color
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {categoryData.length > 3 && (
                            <div className="text-xs text-gray-500 pt-1">
                                还有 {categoryData.length - 3} 个分类...
                            </div>
                        )}
                    </div>
                </div>

                {/* 完整度指标 */}
                <div className="relative px-6 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">画像完整度</span>
                        <span className="text-sm font-medium text-gray-800">{completeness}%</span>
                    </div>
                    <Progress 
                        percent={completeness} 
                        showInfo={false} 
                        strokeColor={{
                            from: '#1890ff',
                            to: '#722ed1'
                        }}
                        className="mb-2"
                    />
                </div>

                {/* 底部信息 */}
                <div className="relative px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <ClockCircleOutlined />
                            <span>更新于 {new Date(profile.updateTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-500">应用场景</div>
                            <div className="px-2 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-700">
                                0 个
                            </div>
                        </div>
                    </div>
                </div>

                {/* 悬停效果边框 */}
                <div className={`
                    absolute inset-0 border-2 border-transparent rounded-xl 
                    transition-all duration-300 pointer-events-none
                    ${isHovered ? 'border-blue-200 shadow-lg' : ''}
                `}></div>
            </div>

            {/* 历史版本模态框 */}
            <Modal
                title={
                    <div className="flex items-center space-x-2">
                        <HistoryOutlined className="text-blue-600" />
                        <span>历史版本 - {profile.name}</span>
                    </div>
                }
                open={historyOpen}
                footer={null}
                onCancel={() => setHistoryOpen(false)}
                width={800}
                className="enhanced-modal"
            >
                <EnhancedProfileHistory id={profile.id} />
            </Modal>

            {/* 添加样式 */}
            <style>{`
                .enhanced-modal .ant-modal-content {
                    border-radius: 16px;
                    overflow: hidden;
                }
                
                .enhanced-modal .ant-modal-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-bottom: none;
                }
                
                .enhanced-modal .ant-modal-title {
                    color: white;
                }
                
                .enhanced-modal .ant-modal-close {
                    color: white;
                }
                
                .enhanced-modal .ant-modal-close:hover {
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </>
    )
}

export default EnhancedProfileCard