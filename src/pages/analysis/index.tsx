import PieChart from './components/PieChart'
import TagSelector from './components/TagSelector'
import { get, post } from '@/api'
import { userTags, type UserTagDefinition } from '@/constants/userTagOptions'
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
import { FC, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

// 自定义数值/时间区间，用于生成无选项标签的模拟数据
const customRanges: Record<string, string[]> = {
    age: ['18岁以下', '18-25岁', '26-35岁', '36-45岁', '46岁以上'],
    registerTime: ['最近一周', '最近一月', '最近三月', '最近半年', '半年以上'],
    walletBalance: ['0-100', '100-500', '500-1000', '1000以上'],
    yuebaoBalance: ['0-100', '100-500', '500-1000', '1000以上'],
    coinBalance: ['0-100', '100-500', '500-1000', '1000以上'],
    coin30Days: ['0-100', '100-500', '500-1000', '1000以上']
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

const UserProfileAnalysis: FC = () => {
    const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([])
    const [leftOpen, setLeftOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [saveOpen, setSaveOpen] = useState(false)
    const [currentTagName, setCurrentTagName] = useState<string>()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)

    // 存储所有需要展示分析结果的标签
    const [analysisResults, setAnalysisResults] = useState<
        { name: string; data: Record<string, number> }[]
    >([])

    // 存储从API获取的标签分析数据
    const [tagAnalysisData, setTagAnalysisData] = useState<TagAnalysisData>({})

    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
        null
    )

    // 页面加载时获取数据
    useEffect(() => {
        const initPageData = async () => {
            try {
                setPageLoading(true)

                // 获取用户标签数据
                const response = await post('reportApi/userprofile/api/labels')
                console.log('API响应数据:', response)

                if (response) {
                    // 处理API返回的数据，转换为页面需要的格式
                    const processedData = processApiData(response)
                    setTagAnalysisData(processedData)
                    message.success('数据加载成功')
                } else {
                    throw new Error('API返回数据为空')
                }
            } catch (error) {
                console.error('获取页面数据失败:', error)
                message.error('获取数据失败，使用模拟数据')

                // 失败时使用本地数据兜底
                loadLocalData()
            } finally {
                setPageLoading(false)
            }
        }

        initPageData()
    }, [])

    // 处理API返回的数据
    const processApiData = (apiData: any): TagAnalysisData => {
        const processedData: TagAnalysisData = {}

        try {
            // 根据API返回的数据结构进行处理
            // 这里需要根据实际API返回的数据格式进行调整
            console.log('处理API数据:', apiData)

            // 示例处理逻辑，需要根据实际API数据结构调整
            if (Array.isArray(apiData)) {
                // 如果返回的是数组格式
                apiData.forEach((item: any) => {
                    if (item.tagName && item.data) {
                        processedData[item.tagName] = item.data
                    }
                })
            } else if (apiData && typeof apiData === 'object') {
                // 如果返回的是对象格式
                Object.keys(apiData).forEach((key) => {
                    if (apiData[key] && typeof apiData[key] === 'object') {
                        processedData[key] = apiData[key]
                    }
                })
            }

            // 如果处理后的数据为空，生成一些示例数据用于展示
            if (Object.keys(processedData).length === 0) {
                console.log('API数据为空，生成示例数据')
                userTags.slice(0, 3).forEach((tag) => {
                    const opts = tag.options ??
                        customRanges[tag.key] ?? [
                            '示例选项1',
                            '示例选项2',
                            '示例选项3'
                        ]
                    const data: Record<string, number> = {}
                    opts.forEach((opt) => {
                        data[opt] = Math.floor(Math.random() * 900) + 100
                    })
                    processedData[tag.name] = data
                })
            }
        } catch (error) {
            console.error('处理API数据失败:', error)
        }

        return processedData
    }

    // 加载本地数据作为兜底
    const loadLocalData = () => {
        // 生成模拟数据
        const mockData: TagAnalysisData = {}
        userTags.forEach((tag) => {
            const opts = tag.options ?? customRanges[tag.key]
            if (opts) {
                const data: Record<string, number> = {}
                opts.forEach((opt) => {
                    data[opt] = Math.floor(Math.random() * 900) + 100
                })
                mockData[tag.name] = data
            }
        })
        setTagAnalysisData(mockData)
    }

    useEffect(() => {
        setPortalContainer(document.getElementById('content-left-extra'))
    }, [])

    // 获取标签分析数据
    const getTagData = (tagName: string): Record<string, number> => {
        // 优先使用API数据，如果没有则生成模拟数据
        if (tagAnalysisData[tagName]) {
            return tagAnalysisData[tagName]
        }

        const def = userTags.find((t) => t.name === tagName)
        if (!def) return {}

        const opts = def.options ??
            customRanges[def.key] ?? ['选项1', '选项2', '选项3']
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

    const openEditDrawer = (name: string) => {
        setCurrentTagName(name)
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
                    data.values = values.value
                    break
                case 'single':
                case 'text':
                    data.values = [values.value]
                    break
                case 'dateRange':
                    data.values = values.value
                    break
                case 'numberRange':
                    data.values = [String(values.min), String(values.max)]
                    break
            }

            if (index === -1) list.push(data)
            else list[index] = data

            // 发送标签分析请求（可选，如果需要基于选择的标签重新分析）
            // const analysisResponse = await post('http://172.31.152.17/reportApi/userprofile/api/analysis', {
            //     tagName: def.name,
            //     tagValues: data.values,
            //     tagType: def.type
            // })

            let chartData = getTagData(def.name)
            // if (analysisResponse?.result) {
            //     chartData = analysisResponse.result
            // }

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

            // 保存到服务器（可选，如果有保存接口）
            // await post('http://172.31.152.17/reportApi/userprofile/api/save-profile', profile)

            // 同时保存到本地作为备份
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

    if (pageLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spin size="large" tip="加载中..." />
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
                        已选中标签个数：{selectedTags.length}
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
                            >
                                {`${t.name}：${t.values.join('、')}`}
                            </Tag>
                        )
                    })}
                </div>
                {analysisResults.map((r) => (
                    <div key={r.name} className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-bold mb-2">{r.name}</h3>
                        <div className="flex">
                            <PieChart data={r.data} />
                            <Table
                                pagination={false}
                                dataSource={Object.entries(r.data ?? {}).map(
                                    ([key, value]) => ({
                                        key,
                                        name: key,
                                        value
                                    })
                                )}
                                columns={[
                                    { title: '标签值', dataIndex: 'name' },
                                    { title: '数量', dataIndex: 'value' }
                                ]}
                                className="flex-1"
                            />
                        </div>
                    </div>
                ))}
            </Layout.Content>

            <TagSelector
                open={leftOpen}
                onClose={cancelAddTags}
                onSelect={openEditDrawer}
                selectedNames={selectedTags.map((t) => t.name)}
            />

            <ModalForm
                title="保存画像"
                open={saveOpen}
                onOpenChange={setSaveOpen}
                onFinish={handleSaveProfile}
                modalProps={{ destroyOnClose: true }}
            >
                <ProFormText
                    name="name"
                    label="画像名称"
                    rules={[{ required: true, message: '请输入画像名称' }]}
                />
            </ModalForm>

            <DrawerForm
                title={`编辑：${currentTagName}`}
                open={editOpen}
                onOpenChange={setEditOpen}
                onFinish={handleFinish}
                loading={loading}
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
                        {(() => {
                            switch (currentDef.type) {
                                case 'multi':
                                    return (
                                        <ProFormCheckbox.Group
                                            name="value"
                                            label={`${currentDef.name}（${currentDef.definition ?? ''}）`}
                                            options={currentDef.options}
                                        />
                                    )
                                case 'single':
                                    return (
                                        <ProFormRadio.Group
                                            name="value"
                                            label={`${currentDef.name}（${currentDef.definition ?? ''}）`}
                                            options={currentDef.options}
                                        />
                                    )
                                case 'dateRange':
                                    return (
                                        <ProFormDateRangePicker
                                            name="value"
                                            label={`${currentDef.name}（${currentDef.definition ?? ''}）`}
                                        />
                                    )
                                case 'numberRange':
                                    return (
                                        <>
                                            <ProFormDigit
                                                name="min"
                                                label="最小值"
                                            />
                                            <ProFormDigit
                                                name="max"
                                                label="最大值"
                                            />
                                        </>
                                    )
                                case 'text':
                                    return (
                                        <ProFormText
                                            name="value"
                                            label={`${currentDef.name}（${currentDef.definition ?? ''}）`}
                                        />
                                    )
                                default:
                                    return null
                            }
                        })()}
                    </div>
                )}
            </DrawerForm>
        </Layout>
    )
}

export default UserProfileAnalysis
