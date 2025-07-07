import { FC, useState } from 'react'
import { Collapse, Drawer, Input, Tooltip, Button } from 'antd'
import { userTags } from '@/constants/userTagOptions'

interface TagSelectorProps {
    open: boolean
    selectedNames: string[]
    onClose: () => void
    onSelect: (name: string) => void
}

const TagSelector: FC<TagSelectorProps> = ({
    open,
    selectedNames,
    onClose,
    onSelect
}) => {
    const [search, setSearch] = useState('')
    const categories = Array.from(new Set(userTags.map((t) => t.category)))

    return (
        <Drawer
            title="选择标签"
            placement="left"
            open={open}
            onClose={onClose}
            width={450}
            bodyStyle={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <div className="p-2">
                <Input
                    allowClear
                    placeholder="搜索标签"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex-1 overflow-y-auto px-2">
                <Collapse bordered={false} className="bg-white">
                    {categories.map((cat) => (
                        <Collapse.Panel header={cat} key={cat} className="!m-0">
                            {userTags
                                .filter((t) => t.category === cat)
                                .filter((t) =>
                                    search
                                        ? t.name.includes(search) ||
                                          t.definition?.includes(search)
                                        : true
                                )
                                .map((t) => {
                                    const disabled = selectedNames.includes(t.name)
                                    return (
                                        <div
                                            key={t.key}
                                            className={`p-2 flex items-center ${disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}`}
                                            onClick={() => {
                                                if (!disabled) onSelect(t.name)
                                            }}
                                        >
                                            <Tooltip
                                                className="w-full flex items-center"
                                                title={t.definition ?? ''}
                                            >
                                                <div className="text-base whitespace-nowrap">
                                                    {t.name}
                                                </div>
                                                <div className="ml-1 flex-1 text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    （{t.definition}）
                                                </div>
                                            </Tooltip>
                                        </div>
                                    )
                                })}
                        </Collapse.Panel>
                    ))}
                </Collapse>
            </div>
            <div className="flex justify-end p-2 border-t">
                <Button type="primary" onClick={onClose}>
                    关闭
                </Button>
            </div>
        </Drawer>
    )
}

export default TagSelector
