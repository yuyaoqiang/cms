import { Collapse, Drawer, Input, Tooltip, Button } from 'antd'
import { FC, useState, useMemo } from 'react'

// API返回的标签数据类型
interface ApiTagItem {
    labelZhName: string // 标签中文名
    labelFieldName: string // 字段名
    typeZhName: string // 标签分类中文名
    widgetType: number // 控件类型
    id: number
    labelId: number
    status: number
    order: number
    createdAt: number
    updatedAt: number
}

// 转换后的标签类型
export type TagType = 'multi' | 'single' | 'dateRange' | 'numberRange' | 'text'

export interface UserTagDefinition {
    key: string
    category: string
    name: string
    type: TagType
    definition?: string
    apiData: ApiTagItem // 保存原始API数据
}

interface TagSelectorProps {
    open: boolean
    selectedNames: string[]
    onClose: () => void
    onSelect: (name: string) => void
    apiTags: ApiTagItem[] // 从API获取的标签数据
}

// widgetType 到 TagType 的映射
const WIDGET_TYPE_MAP: Record<number, TagType> = {
    1: 'multi', // 多选
    2: 'single', // 单选
    3: 'dateRange', // 日期范围
    4: 'numberRange', // 数值范围(正整数)
    5: 'numberRange' // 数值范围(正负整数)
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
        wallet_balance:
            '会员当下钱包余额 = 中心钱包 + 虚拟币钱包 + 场馆钱包（U 按汇率转换成 R）',
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
        .filter((tag) => tag.status === 1) // 只显示启用的标签
        .sort((a, b) => a.order - b.order) // 按order排序
        .map((tag) => {
            const type = WIDGET_TYPE_MAP[tag.widgetType] || 'text'

            return {
                key: tag.labelFieldName,
                category: tag.typeZhName,
                name: tag.labelZhName,
                type,
                definition: getTagDefinition(
                    tag.labelFieldName,
                    tag.labelZhName
                ),
                apiData: tag
            }
        })
}

const TagSelector: FC<TagSelectorProps> = ({
    open,
    selectedNames,
    onClose,
    onSelect,
    apiTags = []
}) => {
    const [search, setSearch] = useState('')

    // 转换API数据为组件需要的格式
    const userTags = useMemo(() => {
        return convertApiDataToTags(apiTags)
    }, [apiTags])

    // 获取所有分类
    const categories = useMemo(() => {
        return Array.from(new Set(userTags.map((t) => t.category)))
    }, [userTags])

    // 过滤标签
    const filteredTags = useMemo(() => {
        if (!search) return userTags

        return userTags.filter(
            (t) =>
                t.name.includes(search) ||
                t.definition?.includes(search) ||
                t.key.includes(search)
        )
    }, [userTags, search])

    // 如果没有API数据，显示空状态
    if (apiTags.length === 0) {
        return (
            <Drawer
                title="选择标签"
                placement="left"
                open={open}
                onClose={onClose}
                width={450}
            >
                <div className="text-center py-8">
                    <div className="text-gray-400 text-lg mb-4">
                        暂无可用标签
                    </div>
                    <div className="text-gray-500 text-sm">
                        请检查网络连接或联系管理员
                    </div>
                </div>
            </Drawer>
        )
    }

    return (
        <Drawer
            title={`选择标签 (共${userTags.length}个可用标签)`}
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
                    placeholder="搜索标签名称、定义或字段名"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <div className="text-xs text-gray-500 mt-1">
                        找到 {filteredTags.length} 个匹配的标签
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-2">
                <Collapse bordered={false} className="bg-white">
                    {categories.map((cat) => {
                        const categoryTags = filteredTags.filter(
                            (t) => t.category === cat
                        )
                        if (categoryTags.length === 0) return null

                        return (
                            <Collapse.Panel
                                header={`${cat} (${categoryTags.length})`}
                                key={cat}
                                className="!m-0"
                            >
                                {categoryTags.map((t) => {
                                    const disabled = selectedNames.includes(
                                        t.name
                                    )
                                    const typeLabel =
                                        {
                                            multi: '多选',
                                            single: '单选',
                                            dateRange: '日期',
                                            numberRange: '数值',
                                            text: '文本'
                                        }[t.type] || t.type

                                    return (
                                        <Tooltip
                                            key={t.key}
                                            title={
                                                <div>
                                                    <div className="font-medium mb-1">
                                                        {t.definition}
                                                    </div>
                                                    <div className="text-xs opacity-75">
                                                        分类: {t.category}
                                                    </div>
                                                </div>
                                            }
                                            placement="topLeft"
                                        >
                                            <div
                                                className={`
                                                    group relative mx-1 my-1 px-3 py-2.5 rounded-lg border transition-all duration-200
                                                    ${
                                                        disabled
                                                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                                            : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer transform hover:-translate-y-0.5'
                                                    }
                                                `}
                                                onClick={() => {
                                                    if (!disabled)
                                                        onSelect(t.name)
                                                }}
                                            >
                                                {/* 选中状态指示器 */}
                                                {disabled && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                        <svg
                                                            className="w-2.5 h-2.5 text-white"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* 主要内容 - 单行显示 */}
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center flex-1 min-w-0">
                                                        {/* 标签名称 */}
                                                        <span
                                                            className={`
                                                            text-base font-medium truncate mr-3
                                                            ${disabled ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-600'}
                                                        `}
                                                        >
                                                            {t.name}
                                                        </span>

                                                        {/* 类型标签 */}
                                                        <span
                                                            className={`
                                                            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0
                                                            ${
                                                                disabled
                                                                    ? 'bg-gray-100 text-gray-400'
                                                                    : 'bg-blue-100 text-blue-800 group-hover:bg-blue-200'
                                                            }
                                                        `}
                                                        >
                                                            {typeLabel}
                                                        </span>
                                                    </div>

                                                    {/* 右侧状态 */}
                                                    <div className="flex items-center ml-2">
                                                        {disabled ? (
                                                            <span className="text-xs text-green-600 font-medium">
                                                                已选
                                                            </span>
                                                        ) : (
                                                            <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors duration-200"></div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 悬浮时显示的详细信息 */}
                                                {!disabled && (
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {t.definition}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Tooltip>
                                    )
                                })}
                            </Collapse.Panel>
                        )
                    })}
                </Collapse>

                {/* 搜索无结果提示 */}
                {search && filteredTags.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-gray-400 text-base mb-2">
                            未找到匹配的标签
                        </div>
                        <div className="text-gray-500 text-sm">
                            请尝试其他关键词搜索
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                <span className="text-sm text-gray-600">
                    已选择{' '}
                    <span className="font-semibold text-blue-600">
                        {selectedNames.length}
                    </span>{' '}
                    个标签
                </span>
                <Button type="primary" onClick={onClose} size="large">
                    关闭
                </Button>
            </div>
        </Drawer>
    )
}

export default TagSelector
export type { ApiTagItem }
