import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

// 抽离 token 为变量
const YABO_AUTH_TOKEN =
    'eyJ0eXAiOiJKc29uV2ViVG9rZW4iLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJpc3N1c2VyIiwiYXVkIjoiYXVkaWVuY2UiLCJyb2xlX25hbWUiOiJhZG1pbmlzdHJhdG9yIiwidXNlcl9pZCI6IjIiLCJyb2xlX2lkIjoiMSIsInVzZXJfbG9naW5fc2Vzc2lvbl9pZCI6IjQ4OGM2NGM4NTkyZTc4MGJhNmEyMGM3ZTU0ZTU2ODI3IiwidXNlcl9uYW1lIjoiYmlnZGF0YSIsImFjY2Vzc190b2tlbl92YWxpZGl0eSI6IjM2MDAiLCJ0b2tlbl90eXBlIjoiYWNjZXNzX3Rva2VuIiwiZGVwdF9pZCI6IjEiLCJhY2NvdW50IjoiYmlnZGF0YSIsInRlbmFudF9jb2RlIjoiMDAwMDAwIiwiY2xpZW50X2lkIjoiY2xpZW50dGVzdCIsImV4cCI6MTc1MjEyMzA4MCwibmJmIjoxNzUyMTE5NDgwfQ.VeXkbbp6Q9RB1SDJbLPk0xF3q115CV8oyDYiqrAUYd4'

// 设置 cookie 的工具函数
const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

// 获取 cookie 的工具函数
const getCookie = (name: string): string | null => {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}

// 将 token 设置到 cookie 中
setCookie('yabo-auth-token', YABO_AUTH_TOKEN)

const instance: AxiosInstance = axios.create({
    baseURL: '/',
    timeout: 10000
})

// 请求拦截器
instance.interceptors.request.use((config) => {
    // 从 cookie 中获取 token，如果没有则使用默认值
    const tokenFromCookie = getCookie('yabo-auth-token') || YABO_AUTH_TOKEN

    // 添加认证头
    config.headers = {
        ...config.headers,
        Authorization: 'Basic Y2xpZW50dGVzdDpNZmdjVWZVNXpPQWJ0ZXN0',
        'yabo-Auth': `bearer ` + tokenFromCookie,
        'Content-Type': 'application/json;charset=UTF-8'
    }
    return config
})

// 响应拦截器
instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

export type ApiResponse<T = any> = {
    msg: string
    result: T
    status: string
}

export const request = <T = any>(config: AxiosRequestConfig) =>
    instance.request<ApiResponse<T>>(config)

// 导出 token 相关工具函数，供其他模块使用
export const updateYaboAuthToken = (newToken: string) => {
    setCookie('yabo-auth-token', newToken)
}

export const getYaboAuthToken = () => {
    return getCookie('yabo-auth-token')
}

export default instance
