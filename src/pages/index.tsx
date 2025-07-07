import { useStore } from '@/stores'
import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Index: FC = () => {
    const navigate = useNavigate()
    const { setToken } = useStore()

    // 组件加载时从 URL 获取 token，然后进入主页面
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        if (token) {
            setToken(token)
        }
    }, [navigate, setToken])

    return null
}

export default Index
