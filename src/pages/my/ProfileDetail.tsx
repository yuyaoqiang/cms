// src/pages/my/ProfileDetail.tsx - 更新后的ProfileDetail组件
import { getLocalStorage } from '@/utils/xLocalStorage'
import { FC, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

// 由于移除了静态配置，我们需要从保存的标签数据中推断类型
const getTagTypeFromValue = (values: string[]): string => {
    if (values.length === 0) return 'unknown'
    
    // 根据值的格式推断类型
    if (values.length > 1) return 'multi' // 多个值通常是多选
    
    const value = values[0]
    
    // 日期格式检测
    if (value.includes('-') && (value.includes('年') || value.includes('月') || value.includes('日'))) {
        return 'dateRange'
    }
    
    // 数值范围检测
    if (/^\d+$/.test(value) || value.includes('~') || value.includes('-')) {
        return 'numberRange'
    }
    
    // 布尔值检测
    if (['是', '否', 'true', 'false'].includes(value)) {
        return 'single'
    }
    
    return 'text'
}

const ProfileDetail: FC = () => {
    const { id } = useParams()
    const profiles = (getLocalStorage('profiles') as unknown as any[]) ?? []
    const profile = profiles.find((p) => p.id === id)
    
    if (!profile) return <div>画像不存在</div>

    // 统计不同类型的标签数量
    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        profile.tags.forEach((t: any) => {
            const type = getTagTypeFromValue(t.values)
            counts[type] = (counts[type] || 0) + 1
        })
        return counts
    }, [profile])

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <div className="bg-white p-4 rounded shadow space-y-2">
                <div>
                    不同类型的标签数量：
                    {Object.entries(typeCounts)
                        .map(([k, v]) => `${k}:${v}`)
                        .join('、')}
                </div>
                <div>用户数量 {profile.userCount} 个</div>
                <div>应用场景 0 个</div>
                <div>最新更新时间：{profile.updateTime}</div>
                <ul className="list-disc pl-4 space-y-1">
                    {profile.tags.map((t: any) => (
                        <li key={t.name}>
                            {`${t.name}：${t.values.join('、')}`}
                        </li>
                    ))}
                </ul>
            </div>
            <Link
                to={`/my/${id}/history`}
                className="text-blue-500 hover:underline"
            >
                查看版本历史
            </Link>
        </div>
    )
}

export default ProfileDetail

// ===========================================

// src/pages/my/components/ProfileCard.tsx - 更新后的ProfileCard组件
import ProfileHistory from '../ProfileHistory'
import { HistoryOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import { FC, useMemo, useState } from 'react'

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

/**
 * 用户画像卡片组件
 */
const ProfileCard: FC<{ profile: Profile }> = ({ profile }) => {
    const [historyOpen, setHistoryOpen] = useState(false)

    // 计算不同分类的标签数量
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        profile.tags.forEach((t) => {
            const cat = inferCategoryFromTagName(t.name)
            counts[cat] = (counts[cat] ?? 0) + 1
        })
        return counts
    }, [profile.tags])

    return (
        <>
            <div className="bg-white py-4 rounded shadow flex flex-col h-full">
                <div className="font-bold text-center text-[18px] mb-4">
                    {profile.name}
                </div>
                {/* 标签个数 */}
                <div className="text-[16px] font-bold px-4">
                    标签个数：{profile.tags.length} 个
                </div>
                {/* 各分类标签数量 */}
                <div className="w-full text-[14px] mt-[16px] flex flex-wrap justify-between mb-[16px] px-4">
                    {Object.entries(categoryCounts).map(([k, v]) => (
                        <div className="w-1/2" key={k}>
                            {k}:&nbsp;&nbsp;{v}个
                        </div>
                    ))}
                </div>
                {/* 底部信息 */}
                <div className="mt-auto">
                    {/* 用户数量及应用场景 */}
                    <div className="text-[16px] font-bold flex justify-between px-4">
                        <span>用户数量 {profile.userCount} 个</span>
                        <span>应用场景 0 个</span>
                    </div>
                    <div className="text-xs text-gray-400 flex justify-between pt-[12px] mt-[12px] border-t border-solid border-gray-500 px-4">
                        <span
                            className="text-blue-500 cursor-pointer flex items-center"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setHistoryOpen(true)
                            }}
                        >
                            <HistoryOutlined className="mr-1" />
                            历史版本
                        </span>
                        <span>更新时间 {profile.updateTime}</span>
                    </div>
                </div>
            </div>
            <Modal
                title="历史版本"
                open={historyOpen}
                footer={null}
                onCancel={() => setHistoryOpen(false)}
            >
                <ProfileHistory id={profile.id} />
            </Modal>
        </>
    )
}

export default ProfileCard