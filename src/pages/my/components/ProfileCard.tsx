import ProfileHistory from '../ProfileHistory'
import { userTags } from '@/constants/userTagOptions'
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

/**
 * 用户画像卡片组件
 */
const ProfileCard: FC<{ profile: Profile }> = ({ profile }) => {
    const [historyOpen, setHistoryOpen] = useState(false)

    // 计算不同分类的标签数量
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        profile.tags.forEach((t) => {
            const def = userTags.find((d) => d.name === t.name)
            const cat = def?.category ?? '未分类'
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
