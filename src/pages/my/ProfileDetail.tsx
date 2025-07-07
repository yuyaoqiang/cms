import { userTags } from '@/constants/userTagOptions'
import { getLocalStorage } from '@/utils/xLocalStorage'
import { FC, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

const ProfileDetail: FC = () => {
    const { id } = useParams()
    const profiles =
        (getLocalStorage('profiles') as unknown as any[]) ?? []
    const profile = profiles.find((p) => p.id === id)
    if (!profile) return <div>画像不存在</div>

    // 统计不同类型的标签数量
    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        profile.tags.forEach((t: any) => {
            const def = userTags.find((d) => d.name === t.name)
            const type = def?.type || 'unknown'
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
                    {profile.tags.map((t: any) => {
                        const def = userTags.find((d) => d.name === t.name)
                        return (
                            <li key={t.name}>
                                {`${t.name}（${def?.definition ?? ''}）：${t.values.join('、')}`}
                            </li>
                        )
                    })}
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
