import PieChart from './components/PieChart'
import TagSelector from './components/TagSelector'
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
import { Layout, Button, Tag, Table, message } from 'antd'
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

// 根据标签选项或自定义区间生成随机的模拟数据
const mockTagData: Record<string, Record<string, number>> = {}
userTags.forEach((tag) => {
    const opts = tag.options ?? customRanges[tag.key]
    if (opts) {
        const data: Record<string, number> = {}
        opts.forEach((opt) => {
            data[opt] = Math.floor(Math.random() * 900) + 100
        })
        mockTagData[tag.name] = data
    }
})

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

const ensureMockData = (def: UserTagDefinition) => {
    if (!mockTagData[def.name]) {
        const opts = def.options ??
            customRanges[def.key] ?? ['选项1', '选项2', '选项3']
        const data: Record<string, number> = {}
        opts.forEach((opt) => {
            data[opt] = Math.floor(Math.random() * 900) + 100
        })
        mockTagData[def.name] = data
    }
    return mockTagData[def.name]
}

const UserProfileAnalysis: FC = () => {
    const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([])
    const [leftOpen, setLeftOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [saveOpen, setSaveOpen] = useState(false)
    const [currentTagName, setCurrentTagName] = useState<string>()
    // 存储所有需要展示分析结果的标签
    const [analysisResults, setAnalysisResults] = useState<
        { name: string; data: Record<string, number> }[]
    >([])

    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

    useEffect(() => {
        setPortalContainer(document.getElementById('content-left-extra'))
    }, [])

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
        ensureMockData(def)
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
        setSelectedTags(list)
        setAnalysisResults((prev) => {
            const chartData = mockTagData[def.name] ?? {}
            const idx = prev.findIndex((r) => r.name === def.name)
            if (idx === -1)
                return [...prev, { name: def.name, data: chartData }]
            const result = [...prev]
            result[idx] = { name: def.name, data: chartData }
            return result
        })
        setEditOpen(false)
        return true
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
                        const def = userTags.find((d) => d.name === t.name)
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
                                // 使用空对象以避免 Object.entries 抛错
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
                onFinish={async (values: { name: string }) => {
                    const profiles: UserProfile[] =
                        (getLocalStorage(
                            'profiles'
                        ) as unknown as UserProfile[]) ?? []
                    const profile: UserProfile = {
                        id: String(Date.now()),
                        name: values.name,
                        tags: selectedTags,
                        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                        userCount: Math.floor(Math.random() * 9000) + 1000
                    }
                    setLocalStorage('profiles', [...profiles, profile])
                    message.success('保存成功')
                    return true
                }}
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
                drawerProps={{
                    destroyOnClose: true,
                    placement: 'right',
                    width: 400
                }}
                initialValues={{
                    value: currentSelected?.values,
                    min: currentSelected?.values[0],
                    max: currentSelected?.values[1]
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
