import { FC } from 'react'
import { useParams } from 'react-router-dom'

interface Props {
    id?: string
}
// 历史版本列表，可在页面或弹窗中使用
const ProfileHistory: FC<Props> = ({ id }) => {
    const params = useParams()
    const profileId = id ?? params.id
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">
                画像 {profileId} 的版本历史
            </h2>
            <p>TODO: 展示具体的版本历史数据。</p>
        </div>
    )
}

export default ProfileHistory
