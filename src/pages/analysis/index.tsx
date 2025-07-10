import PieChart from './components/PieChart'
import TagSelector, { type ApiTagItem } from './components/TagSelector'
import { get, post } from '@/api'
import { getLocalStorage, setLocalStorage } from '@/utils/xLocalStorage'
import { CloseOutlined, DoubleRightOutlined } from '@ant-design/icons'
import {
    ModalForm,
    DrawerForm,
    ProFormCheckbox,
    ProFormRadio,
    ProFormDateRangePicker,
    ProFormDigit,
    ProFormText
} from '@ant-design/pro-form'
import { Layout, Button, Tag, Table, message, Spin } from 'antd'
import dayjs from 'dayjs'
import { FC, useState, useEffect, useMemo } from 'react'
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
    options?: string[]
    apiData?: ApiTagItem
    dynamicOptions?: { label: string; value: string }[] // 动态获取的选项
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
    1: 'multi', // 多选
    2: 'single', // 单选
    3: 'dateRange', // 日期范围
    4: 'numberRange', // 数值范围
    5: 'numberRange' // 数值范围
}

// 为不同类型的标签提供默认选项（当API无数据时的兜底）
const getDefaultOptions = (type: TagType, fieldName: string): string[] => {
    switch (type) {
        case 'single':
            if (fieldName.includes('sex') || fieldName.includes('gender')) {
                return ['男', '女']
            }
            if (
                fieldName.includes('black') ||
                fieldName.includes('grey') ||
                fieldName.includes('active') ||
                fieldName.includes('reg7pay')
            ) {
                return ['是', '否']
            }
            return ['选项1', '选项2']

        case 'multi':
            if (fieldName.includes('source')) {
                return ['直客', '代理']
            }
            if (fieldName.includes('site_type')) {
                return ['S', 'K']
            }
            if (fieldName.includes('device')) {
                return ['iOS', 'Android', 'Windows']
            }
            return ['选项1', '选项2', '选项3']

        default:
            return []
    }
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
        device_infos: '会员近30日登陆设备枚举（系统版本）'
    }

    return definitionMap[fieldName] || `${labelName}相关配置`
}

// 将API数据转换为组件需要的格式
const convertApiDataToTags = (apiTags: ApiTagItem[]): UserTagDefinition[] => {
    return apiTags
        .filter((tag) => tag.status === 1) // 只显示启用的标签
        .sort((a, b) => a.order - b.order) // 按order排序
        .map((tag) => {
            const type = WIDGET_TYPE_MAP[tag.widgetType] || 'text'
            const options =
                type === 'dateRange' || type === 'numberRange'
                    ? undefined
                    : getDefaultOptions(type, tag.labelFieldName)

            return {
                key: tag.labelFieldName,
                category: tag.typeZhName,
                name: tag.labelZhName,
                type,
                definition: getTagDefinition(
                    tag.labelFieldName,
                    tag.labelZhName
                ),
                options,
                apiData: tag
            }
        })
}

const UserProfileAnalysis: FC = () => {
    const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([])
    const [leftOpen, setLeftOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [saveOpen, setSaveOpen] = useState(false)
    const [currentTagName, setCurrentTagName] = useState<string>()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [apiTags, setApiTags] = useState<ApiTagItem[]>([])
    const [labelValuesLoading, setLabelValuesLoading] = useState(false)

    // 存储所有需要展示分析结果的标签
    const [analysisResults, setAnalysisResults] = useState<
        { name: string; data: Record<string, number> }[]
    >([])

    // 存储从API获取的标签分析数据
    const [tagAnalysisData, setTagAnalysisData] = useState<TagAnalysisData>({})

    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
        null
    )

    // 转换后的用户标签定义
    const userTags = useMemo(() => {
        return convertApiDataToTags(apiTags)
    }, [apiTags])

    // 页面加载时获取数据
    useEffect(() => {
        const initPageData = async () => {
            try {
                setPageLoading(true)

                // 获取用户标签数据
                const response = await post('reportApi/userprofile/api/labels')
                console.log('API响应数据:', response)

                if (response?.records?.data) {
                    setApiTags(response.records.data)
                    message.success(
                        `加载成功，共获取${response.records.data.length}个标签`
                    )

                    // 生成初始的分析数据
                    const processedData = generateInitialAnalysisData(
                        response.records.data
                    )
                    setTagAnalysisData(processedData)
                } else {
                    throw new Error('API返回数据格式不正确')
                }
            } catch (error) {
                console.error('获取页面数据失败:', error)
                message.error('获取数据失败，请检查网络连接')

                // 失败时使用空数据
                setApiTags([])
            } finally {
                setPageLoading(false)
            }
        }

        initPageData()
    }, [])

    // 生成初始分析数据
    const generateInitialAnalysisData = (
        apiData: ApiTagItem[]
    ): TagAnalysisData => {
        const analysisData: TagAnalysisData = {}

        apiData.forEach((tag) => {
            const type = WIDGET_TYPE_MAP[tag.widgetType] || 'text'
            const options = getDefaultOptions(type, tag.labelFieldName)

            if (options.length > 0) {
                const data: Record<string, number> = {}
                options.forEach((opt) => {
                    data[opt] = Math.floor(Math.random() * 900) + 100
                })
                analysisData[tag.labelZhName] = data
            }
        })

        return analysisData
    }

    useEffect(() => {
        setPortalContainer(document.getElementById('content-left-extra'))
    }, [])

    // 获取标签的动态选项值
    const fetchLabelValues = async (
        labelId: number
    ): Promise<{ label: string; value: string }[]> => {
        try {
            setLabelValuesLoading(true)
            const response = await post(
                `reportApi/userprofile/api/label_values?lid=${labelId}`
            )

            console.log('标签值API响应:', response)

            if (
                response?.records?.data &&
                Array.isArray(response.records.data)
            ) {
                // 转换API返回的标签值为选项格式
                return response.records.data
                    .sort(
                        (a: ApiLabelValue, b: ApiLabelValue) =>
                            a.order - b.order
                    )
                    .map((item: ApiLabelValue) => ({
                        label: item.labelValueZhName,
                        value: item.labelValue
                    }))
            }

            return []
        } catch (error) {
            console.error('获取标签值失败:', error)
            message.error('获取标签选项失败')
            return []
        } finally {
            setLabelValuesLoading(false)
        }
    }

    // 获取标签分析数据
    const getTagData = (tagName: string): Record<string, number> => {
        // 优先使用API数据，如果没有则生成模拟数据
        if (tagAnalysisData[tagName]) {
            return tagAnalysisData[tagName]
        }

        const def = userTags.find((t) => t.name === tagName)
        if (!def) return {}

        const opts = def.dynamicOptions?.map((opt) => opt.label) ||
            def.options || ['选项1', '选项2', '选项3']
        const data: Record<string, number> = {}
        opts.forEach((opt) => {
            data[opt] = Math.floor(Math.random() * 900) + 100
        })

        // 缓存生成的数据
        setTagAnalysisData((prev) => ({ ...prev, [tagName]: data }))
        return data
    }

    const openAddDrawer = () => {
        setLeftOpen(true)
    }

    const cancelAddTags = () => {
        setLeftOpen(false)
    }

    const openEditDrawer = async (name: string) => {
        const tagDef = userTags.find((t) => t.name === name)
        if (!tagDef?.apiData?.labelId) {
            message.error('无法获取标签信息')
            return
        }

        setCurrentTagName(name)

        // 如果是需要动态选项的标签类型，获取标签值
        if (tagDef.type === 'multi' || tagDef.type === 'single') {
            try {
                const dynamicOptions = await fetchLabelValues(
                    tagDef.apiData.labelId
                )

                // 更新标签定义中的动态选项
                const updatedUserTags = userTags.map((tag) =>
                    tag.name === name ? { ...tag, dynamicOptions } : tag
                )

                // 这里我们需要更新 apiTags 来触发 userTags 的重新计算
                setApiTags((prev) =>
                    prev.map((tag) =>
                        tag.labelId === tagDef.apiData.labelId
                            ? { ...tag, dynamicOptions }
                            : tag
                    )
                )
            } catch (error) {
                console.error('获取标签选项失败:', error)
            }
        }

        setEditOpen(true)
    }

    // 根据标签名移除，避免因索引更新导致的删除错误
    const removeTag = (name: string) => {
        setSelectedTags((prev) => prev.filter((t) => t.name !== name))
        // 同时移除对应的分析图表
        setAnalysisResults((prev) => prev.filter((r) => r.name !== name))
    }

    const currentDef: UserTagDefinition | undefined = userTags.find(
        (t) => t.name === currentTagName
    )

    const currentSelected = selectedTags.find((t) => t.name === currentTagName)

    const handleFinish = async (values: any) => {
        const def = userTags.find((t) => t.name === currentTagName)
        if (!def) return true

        try {
            setLoading(true)

            const list = [...selectedTags]
            const index = list.findIndex((t) => t.name === def.name)
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
                    data.values = [
                        String(values.min || 0),
                        String(values.max || 0)
                    ]
                    break
            }

            if (index === -1) list.push(data)
            else list[index] = data

            let chartData = getTagData(def.name)

            setSelectedTags(list)
            setAnalysisResults((prev) => {
                const idx = prev.findIndex((r) => r.name === def.name)
                if (idx === -1)
                    return [...prev, { name: def.name, data: chartData }]
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

    // 保存用户画像
    const handleSaveProfile = async (values: { name: string }) => {
        try {
            const profile: UserProfile = {
                id: String(Date.now()),
                name: values.name,
                tags: selectedTags,
                updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                userCount: Math.floor(Math.random() * 9000) + 1000
            }

            // 保存到本地
            const profiles: UserProfile[] =
                (getLocalStorage('profiles') as unknown as UserProfile[]) ?? []
            setLocalStorage('profiles', [...profiles, profile])

            message.success('保存成功')
            return true
        } catch (error) {
            console.error('保存失败:', error)
            message.error('保存失败，请重试')
            return false
        }
    }

    // 获取当前标签的选项（优先使用动态选项）
    const getCurrentTagOptions = () => {
        if (!currentDef) return []

        // 优先使用动态获取的选项
        if (currentDef.dynamicOptions && currentDef.dynamicOptions.length > 0) {
            return currentDef.dynamicOptions
        }

        // 其次使用静态配置的选项
        if (currentDef.options && currentDef.options.length > 0) {
            return currentDef.options.map((opt) => ({ label: opt, value: opt }))
        }

        return []
    }

    if (pageLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spin size="large" tip="正在加载标签数据..." />
            </div>
        )
    }

    return (
        <Layout className="h-screen">
            {portalContainer &&
                createPortal(
                    <DoubleRightOutlined
                        className="cursor-pointer text-xl p-2 bg-white rounded-full shadow"
                        onClick={openAddDrawer}
                    />,
                    portalContainer
                )}
            <Layout.Header className="bg-white p-3 shadow flex items-center justify-between">
                <div>
                    <div className="mb-1">
                        已选中标签个数：{selectedTags.length} / 总可用标签：
                        {userTags.length}
                    </div>
                </div>
                <div className="space-x-2 flex items-center">
                    <Button
                        onClick={() => setSaveOpen(true)}
                        disabled={!selectedTags.length}
                    >
                        保存画像
                    </Button>
                    <Button type="primary" onClick={openAddDrawer}>
                        新增标签
                    </Button>
                </div>
            </Layout.Header>
            <Layout.Content className="bg-gray-100 p-4 space-y-6">
                <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTags.map((t) => {
                        const tagDef = userTags.find(
                            (def) => def.name === t.name
                        )
                        const typeLabel = tagDef
                            ? {
                                  multi: '多选',
                                  single: '单选',
                                  dateRange: '日期',
                                  numberRange: '数值',
                                  text: '文本'
                              }[tagDef.type]
                            : ''

                        return (
                            <Tag
                                key={t.name}
                                closeIcon={
                                    <CloseOutlined className="!text-[16px]" />
                                }
                                closable
                                onClose={(e) => {
                                    e.stopPropagation()
                                    removeTag(t.name)
                                }}
                                onClick={() => openEditDrawer(t.name)}
                                className="cursor-pointer text-base"
                                color="blue"
                            >
                                {`${t.name} [${typeLabel}]：${t.values.join('、')}`}
                            </Tag>
                        )
                    })}
                </div>

                {/* 分析结果展示 */}
                {analysisResults.map((r) => (
                    <div key={r.name} className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-bold mb-2 flex items-center">
                            {r.name}
                            <span className="ml-2 text-sm text-gray-500 font-normal">
                                (数据总计:{' '}
                                {Object.values(r.data).reduce(
                                    (a, b) => a + b,
                                    0
                                )}
                                )
                            </span>
                        </h3>
                        <div className="flex">
                            <PieChart data={r.data} />
                            <Table
                                pagination={false}
                                dataSource={Object.entries(r.data ?? {}).map(
                                    ([key, value]) => ({
                                        key,
                                        name: key,
                                        value,
                                        percentage: (
                                            (value /
                                                Object.values(r.data).reduce(
                                                    (a, b) => a + b,
                                                    0
                                                )) *
                                            100
                                        ).toFixed(1)
                                    })
                                )}
                                columns={[
                                    {
                                        title: '标签值',
                                        dataIndex: 'name',
                                        width: 120
                                    },
                                    {
                                        title: '数量',
                                        dataIndex: 'value',
                                        width: 80
                                    },
                                    {
                                        title: '占比',
                                        dataIndex: 'percentage',
                                        width: 80,
                                        render: (text) => `${text}%`
                                    }
                                ]}
                                className="flex-1"
                                size="small"
                            />
                        </div>
                    </div>
                ))}

                {/* 空状态提示 */}
                {analysisResults.length === 0 && (
                    <div className="bg-white p-8 rounded shadow text-center">
                        <div className="text-gray-400 mb-4">
                            <DoubleRightOutlined className="text-4xl" />
                        </div>
                        <h3 className="text-lg text-gray-600 mb-2">
                            暂无分析结果
                        </h3>
                        <p className="text-gray-500 mb-4">
                            请点击左侧按钮或右上角"新增标签"按钮选择要分析的用户标签
                        </p>
                        <Button type="primary" onClick={openAddDrawer}>
                            立即选择标签
                        </Button>
                    </div>
                )}
            </Layout.Content>

            {/* 标签选择器 */}
            <TagSelector
                open={leftOpen}
                onClose={cancelAddTags}
                onSelect={openEditDrawer}
                selectedNames={selectedTags.map((t) => t.name)}
                apiTags={apiTags}
            />

            {/* 保存画像对话框 */}
            <ModalForm
                title="保存用户画像"
                open={saveOpen}
                onOpenChange={setSaveOpen}
                onFinish={handleSaveProfile}
                modalProps={{ destroyOnClose: true }}
            >
                <ProFormText
                    name="name"
                    label="画像名称"
                    placeholder="请输入画像名称，如：高价值用户群体"
                    rules={[{ required: true, message: '请输入画像名称' }]}
                />
                <div className="text-sm text-gray-500 mt-2">
                    当前画像包含 {selectedTags.length} 个标签，预估用户数量：
                    {Math.floor(Math.random() * 9000) + 1000} 人
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
                    width: 400
                }}
                initialValues={{
                    value: currentSelected?.values,
                    min: currentSelected?.values?.[0],
                    max: currentSelected?.values?.[1]
                }}
            >
                {currentDef && (
                    <div className="mt-4">
                        {/* 显示标签基本信息 */}
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                            <div className="text-sm text-gray-600 mb-1">
                                <strong>标签说明：</strong>
                                {currentDef.definition}
                            </div>
                            <div className="text-sm text-gray-600">
                                <strong>字段名：</strong>
                                {currentDef.key}
                            </div>
                            <div className="text-sm text-gray-600">
                                <strong>分类：</strong>
                                {currentDef.category}
                            </div>
                        </div>

                        {labelValuesLoading && (
                            <div className="text-center py-4">
                                <Spin tip="正在加载标签选项..." />
                            </div>
                        )}

                        {/* 根据标签类型渲染不同的表单组件 */}
                        {!labelValuesLoading &&
                            (() => {
                                const options = getCurrentTagOptions()

                                switch (currentDef.type) {
                                    case 'multi':
                                        return (
                                            <ProFormCheckbox.Group
                                                name="value"
                                                label={`请选择${currentDef.name}`}
                                                options={options}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            '请至少选择一个选项'
                                                    }
                                                ]}
                                            />
                                        )
                                    case 'single':
                                        return (
                                            <ProFormRadio.Group
                                                name="value"
                                                label={`请选择${currentDef.name}`}
                                                options={options}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            '请选择一个选项'
                                                    }
                                                ]}
                                            />
                                        )
                                    case 'dateRange':
                                        return (
                                            <ProFormDateRangePicker
                                                name="value"
                                                label={`请选择${currentDef.name}范围`}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            '请选择日期范围'
                                                    }
                                                ]}
                                            />
                                        )
                                    case 'numberRange':
                                        return (
                                            <>
                                                <ProFormDigit
                                                    name="min"
                                                    label="最小值"
                                                    placeholder="请输入最小值"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                '请输入最小值'
                                                        }
                                                    ]}
                                                />
                                                <ProFormDigit
                                                    name="max"
                                                    label="最大值"
                                                    placeholder="请输入最大值"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                '请输入最大值'
                                                        },
                                                        ({
                                                            getFieldValue
                                                        }) => ({
                                                            validator(
                                                                _,
                                                                value
                                                            ) {
                                                                const min =
                                                                    getFieldValue(
                                                                        'min'
                                                                    )
                                                                if (
                                                                    !value ||
                                                                    !min ||
                                                                    value >= min
                                                                ) {
                                                                    return Promise.resolve()
                                                                }
                                                                return Promise.reject(
                                                                    new Error(
                                                                        '最大值必须大于等于最小值'
                                                                    )
                                                                )
                                                            }
                                                        })
                                                    ]}
                                                />
                                            </>
                                        )
                                    case 'text':
                                        return (
                                            <ProFormText
                                                name="value"
                                                label={`请输入${currentDef.name}`}
                                                placeholder="请输入内容"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: '请输入内容'
                                                    }
                                                ]}
                                            />
                                        )
                                    default:
                                        return (
                                            <div className="text-center py-4 text-gray-500">
                                                暂不支持此类型的标签配置
                                            </div>
                                        )
                                }
                            })()}
                    </div>
                )}
            </DrawerForm>
        </Layout>
    )
}

export default UserProfileAnalysis
