import ProfileCard from './components/ProfileCard'
import { getLocalStorage } from '@/utils/xLocalStorage'
import { FC } from 'react'

const MyUserProfiles: FC = () => {
    const profiles =
        (getLocalStorage('profiles') as unknown as any[]) ?? []
    return (
        <div className="space-y-2">
            <h2 className="text-xl font-bold">我的用户画像人群</h2>
            {profiles.length ? (
                <div className="grid grid-cols-3 gap-4">
                    {profiles.map((p) => (
                        <ProfileCard key={p.id} profile={p} />
                    ))}
                </div>
            ) : (
                <div>暂无画像</div>
            )}
        </div>
    )
}

export default MyUserProfiles
