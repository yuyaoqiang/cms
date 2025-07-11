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