import EnhancedPieChart from './components/EnhancedPieChart'
import EnhancedTagSelector from './components/EnhancedTagSelector'
import { type ApiTagItem } from './components/TagSelector'
import { post } from '@/api'
import { getLocalStorage, setLocalStorage } from '@/utils/xLocalStorage'
import { 
    PlusOutlined, 
    SaveOutlined, 
    DashboardOutlined,
    TagOutlined,
    DeleteOutlined,
    SettingOutlined,
    BarChartOutlined,
    EyeOutlined
} from '@ant-design/icons'
import {
    ModalForm,
    DrawerForm,
    ProFormCheckbox,
    ProFormRadio,
    ProFormDateRangePicker,
    ProFormDigit,
    ProFormText
} from '@ant-design/pro-form'
import { 
    Button, 
    message, 
    Spin, 
    Row, 
    Col, 
    Card, 
    Statistic, 
    Empty, 
    Space,
    Tooltip,
    Badge
} from 'antd'
import dayjs from 'dayjs'
import { FC, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

// 标签类型定义
export type TagType = 'multi' | 'single' | 'dateRange' | 'numberRange' | 'text'

// API返回的标签值数据类型
interface ApiLabelValue {
    labelZhName: string
    labelId: number
    labelFieldName: string
    labelValueZhName: string
    labelValue: string
    id: number
    widgetTypeZhName: string
    type: number
    widgetType: number
    order: number
}

export interface UserTagDefinition {
    key: string
    category: string
    name: string
    type: TagType
    definition?: string
    apiData: ApiTagItem
    dynamicOptions?: { label: string; value: string }[]
}

interface SelectedTag {
    name: string
    values: string[]
}

interface UserProfile {
    id: string
    name: string
    tags: SelectedTag[]
    updateTime: string
    userCount: number
}

interface TagAnalysisData {
    [tagName: string]: Record<string, number>
}

// widgetType 到 TagType 的映射
const WIDGET_TYPE_MAP: Record<number, TagType> = {
    1: 'multi',
    2: 'single',
    3: 'dateRange',
    4: 'numberRange',
    5: 'numberRange'
}

// 根据字段名生成标签定义说明
const getTagDefinition = (fieldName: string, labelName: string): string => {
    const definitionMap: Record<string, string> = {
        member_source: '「直客」定义=无上级，「代理」定义=有上级',
        created_at: '会员注册时间',
        reg7pay: '会员注册后大于7日没有存款记录',
        age: '用户真实身份证年龄',
        sex: '用户真实身份证性别',
        active_address: '近1个月通过用户最近登录IP拆解明确登陆地区（市区）',
        site_type: '会员所属站点对应的业务类型 S\\K',
        site_id: '会员所属站点',
        member_grade: '会员当下等级',
        is_bankcard: '会员是否已绑定提款账号',
        wallet_balance: '会员当下钱包余额 = 中心钱包 + 虚拟币钱包 + 场馆钱包',
        yeb_available_amount: '会员当下"余额宝"余额',
        gold_coin_money: '会员当下金币余额',
        '30_day_gold_coin': '会员近 30 日打赏的金币总额',
        member_tags: '会员标签管理中业务大的标签类型',
        is_7_active: '会员近7日有过登陆即为活跃',
        device_infos: '会员近30日登陆设备枚举（系统版本）',
        warn_count: '过往1年风控预警次数',
        is_black: '该账号手机号或设备与黑名单重合即为黑名单用户',
        is_grey: '该账号手机号或设备与灰名单重合即为灰名单用户'
    }
    return definitionMap[fieldName] || `${labelName}相关配置`
}

// 将API数据转换为组件需要的格式
const convertApiDataToTags = (apiTags: ApiTagItem[]): UserTagDefinition[] => {
    return apiTags
        .filter((tag) => tag.status === 1)
        .sort((a, b) => a.order - b.order)
        .map((tag) => {
            const type = WIDGET_TYPE_MAP[tag.widgetType] || 'text'
            return {
                key: tag.labelFieldName,
                category: tag.typeZhName,
                name: tag.labelZhName,
                type,
                definition: getTagDefinition(tag.labelFieldName, tag.labelZhName),
                apiData: tag
            }
        })
}

const EnhancedAnalysisPage: FC = () => {
    // 原有的状态管理
    const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([])
    const [leftOpen, setLeftOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [saveOpen, setSaveOpen] = useState(false)
    const [currentTagName, setCurrentTagName] = useState<string>()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [apiTags, setApiTags] = useState<ApiTagItem[]>([])
    const [labelValuesLoading, setLabelValuesLoading] = useState(false)
    const [analysisResults, setAnalysisResults] = useState<{ name: string; data: Record<string, number> }[]>([])
    const [tagAnalysisData, setTagAnalysisData] = useState<TagAnalysisData>({})
    const [labelValuesCache, setLabelValuesCache] = useState<Record<number, { label: string; value: string }[]>>({})
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
    
    // 新增状态 - 分析进程和洞察
    
    const hasLoadedRef = useRef(false)

    // 转换后的用户标签定义
    const userTags = useMemo(() => convertApiDataToTags(apiTags), [apiTags])
    
    // 增强的统计数据
    const enhancedStats = useMemo(() => {
        const totalUsers = analysisResults.reduce((sum, result) => 
            sum + Object.values(result.data).reduce((a, b) => a + b, 0), 0)
        
        const categoryStats: Record<string, number> = {}
        userTags.forEach(tag => {
            categoryStats[tag.category] = (categoryStats[tag.category] || 0) + 1
        })
        
        const completeness = selectedTags.length > 0 ? 
            Math.min(Math.round((selectedTags.length / Math.max(userTags.length * 0.3, 1)) * 100), 100) : 0
        
        return {
            totalTags: userTags.length,
            selectedTags: selectedTags.length,
            totalUsers,
            categoryStats,
            completeness,
            analysisCount: analysisResults.length
        }
    }, [userTags, selectedTags, analysisResults])

    // 页面加载时获取数据
    useEffect(() => {
        const initPageData = async () => {
            if (hasLoadedRef.current) return
            hasLoadedRef.current = true

            try {
                setPageLoading(true)
                
                // 模拟API调用
                const response = await post('reportApi/userprofile/api/labels')
                if (response?.records?.data) {
                    setApiTags(response.records.data)
                    message.success(`加载成功，共获取${response.records.data.length}个标签`)
                }
            } catch (error) {
                console.error('获取页面数据失败:', error)
                message.error('获取数据失败，请检查网络连接')
            } finally {
                setPageLoading(false)
            }
        }

        if (apiTags.length === 0) {
            initPageData()
        }
    }, [apiTags.length])

    useEffect(() => {
        setPortalContainer(document.getElementById('content-left-extra'))
    }, [])

    // 获取标签的动态选项值（保持原有逻辑）
    const fetchLabelValues = useCallback(async (labelId: number): Promise<{ label: string; value: string }[]> => {
        if (labelValuesCache[labelId]) {
            return labelValuesCache[labelId]
        }

        try {
            setLabelValuesLoading(true)
            const response = await post(`reportApi/userprofile/api/label_values?lid=${labelId}`)
            
            let apiData = null
            if ((response as any)?.records?.data && Array.isArray((response as any).records.data)) {
                apiData = (response as any).records.data
            } else if (Array.isArray(response)) {
                apiData = response
            } else if ((response as any)?.data && Array.isArray((response as any).data)) {
                apiData = (response as any).data
            }

            if (apiData && Array.isArray(apiData)) {
                const options = apiData
                    .sort((a: ApiLabelValue, b: ApiLabelValue) => a.order - b.order)
                    .map((item: ApiLabelValue) => ({
                        label: item.labelValueZhName,
                        value: item.labelValue
                    }))

                setLabelValuesCache(prev => ({
                    ...prev,
                    [labelId]: options
                }))

                return options
            }

            return []
        } catch (error) {
            console.error('获取标签值失败:', error)
            message.error('获取标签选项失败')
            return []
        } finally {
            setLabelValuesLoading(false)
        }
    }, [labelValuesCache])

    // 根据标签选项生成分析数据
    const generateAnalysisData = useCallback((options: { label: string; value: string }[]): Record<string, number> => {
        const data: Record<string, number> = {}
        options.forEach(opt => {
            data[opt.label] = Math.floor(Math.random() * 900) + 100
        })
        return data
    }, [])

    // 获取标签分析数据
    const getTagData = useCallback(async (tagName: string): Promise<Record<string, number>> => {
        if (tagAnalysisData[tagName]) {
            return tagAnalysisData[tagName]
        }

        const def = userTags.find(t => t.name === tagName)
        if (!def) return {}

        let data: Record<string, number> = {}

        if (def.type === 'multi' || def.type === 'single') {
            try {
                const options = await fetchLabelValues(def.apiData.labelId)
                data = generateAnalysisData(options)
            } catch (error) {
                console.error('获取标签选项失败:', error)
                data = { 选项1: 100, 选项2: 200, 选项3: 150 }
            }
        } else if (def.type === 'dateRange') {
            data = {
                近7天: Math.floor(Math.random() * 500) + 100,
                近30天: Math.floor(Math.random() * 800) + 200,
                近90天: Math.floor(Math.random() * 600) + 150,
                更早: Math.floor(Math.random() * 300) + 50
            }
        } else if (def.type === 'numberRange') {
            data = {
                '0-100': Math.floor(Math.random() * 400) + 100,
                '100-500': Math.floor(Math.random() * 600) + 200,
                '500-1000': Math.floor(Math.random() * 300) + 100,
                '1000+': Math.floor(Math.random() * 200) + 50
            }
        } else {
            data = { 数据: Math.floor(Math.random() * 500) + 100 }
        }

        setTagAnalysisData(prev => ({ ...prev, [tagName]: data }))
        return data
    }, [tagAnalysisData, userTags, fetchLabelValues, generateAnalysisData])

    // 处理操作函数
    const openAddDrawer = () => setLeftOpen(true)
    const cancelAddTags = () => setLeftOpen(false)

    const openEditDrawer = async (name: string) => {
        const tagDef = userTags.find(t => t.name === name)
        if (!tagDef?.apiData?.labelId) {
            message.error('无法获取标签信息')
            return
        }

        setCurrentTagName(name)
        setEditOpen(true)

        if (tagDef.type === 'multi' || tagDef.type === 'single') {
            try {
                await fetchLabelValues(tagDef.apiData.labelId)
            } catch (error) {
                console.error('获取标签选项失败:', error)
                message.error('获取标签选项失败，请重试')
            }
        }
    }

    const removeTag = (name: string) => {
        setSelectedTags(prev => prev.filter(t => t.name !== name))
        setAnalysisResults(prev => prev.filter(r => r.name !== name))
    }


    // 原有的表单处理逻辑
    const currentDef: UserTagDefinition | undefined = userTags.find(t => t.name === currentTagName)
    const getDrawerWidth = () => {
        if (!currentDef) return 420
        switch (currentDef.type) {
            case 'dateRange': return 640  // 确保日期范围组件及其弹出层能正常显示
            case 'numberRange': return 420
            case 'multi':
            case 'single': return 480
            case 'text': return 420
            default: return 420
        }
    }

    const currentSelected = selectedTags.find(t => t.name === currentTagName)

    const handleFinish = async (values: any) => {
        const def = userTags.find(t => t.name === currentTagName)
        if (!def) return true

        try {
            setLoading(true)
            const list = [...selectedTags]
            const index = list.findIndex(t => t.name === def.name)
            const data: SelectedTag = { name: def.name, values: [] }

            switch (def.type) {
                case 'multi':
                    data.values = values.value || []
                    break
                case 'single':
                case 'text':
                    data.values = values.value ? [values.value] : []
                    break
                case 'dateRange':
                    data.values = values.value || []
                    break
                case 'numberRange':
                    data.values = [String(values.min || 0), String(values.max || 0)]
                    break
            }

            if (index === -1) list.push(data)
            else list[index] = data

            const chartData = await getTagData(def.name)
            setSelectedTags(list)
            setAnalysisResults(prev => {
                const idx = prev.findIndex(r => r.name === def.name)
                if (idx === -1) return [...prev, { name: def.name, data: chartData }]
                const result = [...prev]
                result[idx] = { name: def.name, data: chartData }
                return result
            })

            setEditOpen(false)
            message.success('标签分析完成')
        } catch (error) {
            console.error('标签分析失败:', error)
            message.error('分析失败，请重试')
        } finally {
            setLoading(false)
        }

        return true
    }

    const handleSaveProfile = async (values: { name: string }) => {
        try {
            const profile: UserProfile = {
                id: String(Date.now()),
                name: values.name,
                tags: selectedTags,
                updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                userCount: Math.floor(Math.random() * 9000) + 1000
            }

            const profiles: UserProfile[] = (getLocalStorage('profiles') as unknown as UserProfile[]) ?? []
            setLocalStorage('profiles', [...profiles, profile])

            message.success('保存成功')
            return true
        } catch (error) {
            console.error('保存失败:', error)
            message.error('保存失败，请重试')
            return false
        }
    }

    const getCurrentTagOptions = () => {
        if (!currentDef?.apiData?.labelId) return []
        const cachedOptions = labelValuesCache[currentDef.apiData.labelId]
        return cachedOptions || []
    }

    if (pageLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="text-center">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600">正在加载用户画像分析平台...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Portal 容器 */}
            {portalContainer && createPortal(
                <Tooltip title="添加标签">
                    <div 
                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        onClick={openAddDrawer}
                    >
                        <PlusOutlined className="text-white text-lg" />
                    </div>
                </Tooltip>,
                portalContainer
            )}

            {/* 页面头部 */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <DashboardOutlined className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    用户画像分析平台
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    已选择 {selectedTags.length} 个标签 / 共 {userTags.length} 个可用标签
                                </p>
                            </div>
                        </div>
                        <Space size="middle">
                            <Button
                                icon={<SaveOutlined />}
                                onClick={() => setSaveOpen(true)}
                                disabled={!selectedTags.length}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                                保存画像
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openAddDrawer}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 border-none shadow-lg hover:shadow-xl"
                            >
                                添加标签
                            </Button>
                        </Space>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* 统计面板 */}
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <Statistic
                                title="可用标签"
                                value={enhancedStats.totalTags}
                                prefix={<TagOutlined className="text-blue-500" />}
                                suffix="个"
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <Statistic
                                title="已选标签"
                                value={enhancedStats.selectedTags}
                                prefix={<EyeOutlined className="text-green-500" />}
                                suffix="个"
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>


                {/* 已选择标签 - 紧凑展示 */}
                {selectedTags.length > 0 && (
                    <Card 
                        className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                        title={
                            <div className="flex items-center space-x-2">
                                <TagOutlined className="text-blue-500" />
                                <span>已选择标签</span>
                                <Badge count={selectedTags.length} className="ml-2" />
                            </div>
                        }
                        bodyStyle={{ padding: '16px' }}
                    >
                        <div className="flex flex-wrap gap-2">
                            {selectedTags.map((tag, index) => {
                                const tagDef = userTags.find(def => def.name === tag.name)
                                const typeLabel = tagDef ? {
                                    multi: '多选',
                                    single: '单选',
                                    dateRange: '日期',
                                    numberRange: '数值',
                                    text: '文本'
                                }[tagDef.type] : ''

                                return (
                                    <div 
                                        key={tag.name} 
                                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-3 hover:border-blue-300 transition-all duration-300 flex-shrink-0"
                                        style={{
                                            animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                                            minWidth: '200px'
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-800 text-sm">{tag.name}</span>
                                                <Badge color="blue" text={typeLabel} />
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Tooltip title="编辑标签">
                                                    <Button 
                                                        type="text" 
                                                        size="small"
                                                        icon={<SettingOutlined />}
                                                        onClick={() => openEditDrawer(tag.name)}
                                                        className="text-blue-600 hover:bg-blue-100"
                                                    />
                                                </Tooltip>
                                                <Tooltip title="删除标签">
                                                    <Button 
                                                        type="text" 
                                                        size="small"
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => removeTag(tag.name)}
                                                        className="text-red-600 hover:bg-red-100"
                                                    />
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {tag.values.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {tag.values.length <= 2 ? (
                                                        tag.values.map((value, idx) => (
                                                            <span key={idx} className="inline-block bg-white text-gray-700 px-2 py-1 rounded text-xs">
                                                                {value}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <>
                                                            {tag.values.slice(0, 2).map((value, idx) => (
                                                                <span key={idx} className="inline-block bg-white text-gray-700 px-2 py-1 rounded text-xs">
                                                                    {value}
                                                                </span>
                                                            ))}
                                                            <Tooltip title={tag.values.slice(2).join(', ')}>
                                                                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                                                    +{tag.values.length - 2}
                                                                </span>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">暂无配置</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                )}

                {/* 分析结果 - 主要内容区域 */}
                <Card 
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                    title={
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <BarChartOutlined className="text-purple-500" />
                                <span>分析结果</span>
                            </div>
                            {selectedTags.length === 0 && (
                                <Button 
                                    type="primary" 
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={openAddDrawer}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
                                >
                                    开始分析
                                </Button>
                            )}
                        </div>
                    }
                >
                    {analysisResults.length > 0 ? (
                        <div className="space-y-8">
                            {analysisResults.map((result, _index) => (
                                <div key={result.name} className="bg-gray-50 rounded-lg p-6">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            {result.name}
                                        </h3>
                                        <div className="text-sm text-gray-600">
                                            数据总计: {Object.values(result.data).reduce((a, b) => a + b, 0).toLocaleString()} 个数据点
                                        </div>
                                    </div>
                                    
                                    <Row gutter={[32, 32]}>
                                        {/* 饼图展示 */}
                                        <Col xs={24} lg={12}>
                                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                                <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                                                    数据分布图
                                                </h4>
                                                <div className="flex justify-center">
                                                    <EnhancedPieChart
                                                        data={result.data}
                                                        size={280}
                                                        showLegend={true}
                                                        showValues={true}
                                                        animated={true}
                                                        colorScheme="gradient"
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                        
                                        {/* 数据列表 */}
                                        <Col xs={24} lg={12}>
                                            <div className="bg-white rounded-lg p-6 shadow-sm h-full">
                                                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                                                    数据详情
                                                </h4>
                                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                                    {Object.entries(result.data)
                                                        .sort(([,a], [,b]) => b - a)
                                                        .map(([key, value], _idx) => {
                                                            const total = Object.values(result.data).reduce((a, b) => a + b, 0)
                                                            const percentage = ((value / total) * 100).toFixed(1)
                                                            
                                                            return (
                                                                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                                                                        <span className="font-medium text-gray-800">{key}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-semibold text-gray-800">
                                                                            {value.toLocaleString()}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {percentage}%
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty 
                            description="暂无分析结果"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <p className="text-gray-500 mb-4">
                                请选择标签并配置参数开始数据分析
                            </p>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={openAddDrawer}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
                            >
                                立即开始分析
                            </Button>
                        </Empty>
                    )}
                </Card>
            </div>

            {/* 标签选择器 */}
            <EnhancedTagSelector
                open={leftOpen}
                onClose={cancelAddTags}
                onSelect={openEditDrawer}
                selectedNames={selectedTags.map(t => t.name)}
                apiTags={apiTags}
            />

            {/* 保存画像对话框 */}
            <ModalForm
                title="保存用户画像"
                open={saveOpen}
                onOpenChange={setSaveOpen}
                onFinish={handleSaveProfile}
                modalProps={{ 
                    destroyOnClose: true,
                    className: 'save-profile-modal',
                    width: 480
                }}
            >
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-20 flex-shrink-0">
                            画像名称
                        </label>
                        <div className="flex-1">
                            <ProFormText
                                name="name"
                                style={{marginBottom: 0}}
                                placeholder="请输入画像名称，如：高价值用户群体"
                                rules={[{ required: true, message: '请输入画像名称' }]}
                                className="enhanced-input"
                                fieldProps={{
                                    className: 'w-full'
                                }}
                            />
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <div className="mb-2">
                            当前画像包含 {selectedTags.length} 个标签
                        </div>
                        {selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedTags.map((tag, index) => (
                                    <span 
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ModalForm>

            {/* 标签编辑抽屉 */}
            <DrawerForm
                title={`配置标签：${currentTagName}`}
                open={editOpen}
                onOpenChange={setEditOpen}
                onFinish={handleFinish}
                loading={loading || labelValuesLoading}
                drawerProps={{
                    destroyOnClose: true,
                    placement: 'right',
                    width: getDrawerWidth(),
                    className: 'enhanced-drawer'
                }}
                initialValues={{
                    value: currentSelected?.values,
                    min: currentSelected?.values?.[0],
                    max: currentSelected?.values?.[1]
                }}
            >
                {currentDef && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <div className="text-sm text-gray-600 mb-2">
                                <strong>标签说明：</strong>
                                {currentDef.definition}
                            </div>
                            <div className="text-sm text-gray-600">
                                <strong>标签分类：</strong>
                                {currentDef.category}
                            </div>
                        </div>

                        {(() => {
                            const options = getCurrentTagOptions()

                            switch (currentDef.type) {
                                case 'multi':
                                    if (labelValuesLoading) {
                                        return (
                                            <div className="text-center py-8">
                                                <Spin tip="正在加载标签选项..." />
                                            </div>
                                        )
                                    }
                                    if (options.length === 0) {
                                        return (
                                            <div className="text-center py-8 text-orange-500">
                                                该标签暂无可选项数据
                                            </div>
                                        )
                                    }
                                    return (
                                        <ProFormCheckbox.Group
                                            name="value"
                                            label={`请选择${currentDef.name}`}
                                            options={options}
                                            rules={[{ required: true, message: '请至少选择一个选项' }]}
                                        />
                                    )
                                case 'single':
                                    if (labelValuesLoading) {
                                        return (
                                            <div className="text-center py-8">
                                                <Spin tip="正在加载标签选项..." />
                                            </div>
                                        )
                                    }
                                    if (options.length === 0) {
                                        return (
                                            <div className="text-center py-8 text-orange-500">
                                                该标签暂无可选项数据
                                            </div>
                                        )
                                    }
                                    return (
                                        <ProFormRadio.Group
                                            name="value"
                                            label={`请选择${currentDef.name}`}
                                            options={options}
                                            rules={[{ required: true, message: '请选择一个选项' }]}
                                        />
                                    )
                                case 'dateRange':
                                    return (
                                        <ProFormDateRangePicker
                                            name="value"
                                            label={`请选择${currentDef.name}范围`}
                                            rules={[{ required: true, message: '请选择日期范围' }]}
                                        />
                                    )
                                case 'numberRange':
                                    return (
                                        <div className="space-y-4">
                                            <div className="text-sm font-medium text-gray-700">
                                                请输入{currentDef.name}范围
                                            </div>
                                            <div className="flex items-end space-x-3">
                                                <ProFormDigit
                                                    name="min"
                                                    label="最小值"
                                                    placeholder="最小值"
                                                    rules={[{ required: true, message: '请输入最小值' }]}
                                                />
                                                <div className="text-gray-400 font-medium pb-6">至</div>
                                                <ProFormDigit
                                                    name="max"
                                                    label="最大值"
                                                    placeholder="最大值"
                                                    rules={[
                                                        { required: true, message: '请输入最大值' },
                                                        ({ getFieldValue }) => ({
                                                            validator(_, value) {
                                                                const min = getFieldValue('min')
                                                                if (!value || !min || value >= min) {
                                                                    return Promise.resolve()
                                                                }
                                                                return Promise.reject(new Error('最大值必须大于等于最小值'))
                                                            }
                                                        })
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    )
                                case 'text':
                                    return (
                                        <ProFormText
                                            name="value"
                                            label={`请输入${currentDef.name}`}
                                            placeholder="请输入内容"
                                            rules={[{ required: true, message: '请输入内容' }]}
                                        />
                                    )
                                default:
                                    return (
                                        <div className="text-center py-8 text-gray-500">
                                            暂不支持此类型的标签配置
                                        </div>
                                    )
                            }
                        })()}
                    </div>
                )}
            </DrawerForm>

            {/* 添加样式 */}
            <style>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

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

                .enhanced-drawer .ant-drawer-content {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }

                .enhanced-drawer .ant-drawer-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-bottom: none;
                }

                .enhanced-drawer .ant-drawer-title {
                    color: white;
                }

                .enhanced-drawer .ant-drawer-close {
                    color: white;
                }
            `}</style>
        </div>
    )
}

export default EnhancedAnalysisPage