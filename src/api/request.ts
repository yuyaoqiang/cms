import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const instance: AxiosInstance = axios.create({
    baseURL: '/',
    timeout: 10000
})

// 请求拦截器
instance.interceptors.request.use((config) => {
    // 添加认证头
    config.headers = {
        ...config.headers,
        Authorization: 'Basic Y2xpZW50dGVzdDpNZmdjVWZVNXpPQWJ0ZXN0',
        'yabo-Auth':
            'bearer eyJ0eXAiOiJKc29uV2ViVG9rZW4iLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJpc3N1c2VyIiwiYXVkIjoiYXVkaWVuY2UiLCJyb2xlX25hbWUiOiJhZG1pbmlzdHJhdG9yIiwidXNlcl9pZCI6IjIiLCJyb2xlX2lkIjoiMSIsInVzZXJfbG9naW5fc2Vzc2lvbl9pZCI6IjQ4OGM2NGM4NTkyZTc4MGJhNmEyMGM3ZTU0ZTU2ODI3IiwidXNlcl9uYW1lIjoiYmlnZGF0YSIsImFjY2Vzc190b2tlbl92YWxpZGl0eSI6IjM2MDAiLCJ0b2tlbl90eXBlIjoiYWNjZXNzX3Rva2VuIiwiZGVwdF9pZCI6IjEiLCJhY2NvdW50IjoiYmlnZGF0YSIsInRlbmFudF9jb2RlIjoiMDAwMDAwIiwiY2xpZW50X2lkIjoiY2xpZW50dGVzdCIsImV4cCI6MTc1MjEyMzA4MCwibmJmIjoxNzUyMTE5NDgwfQ.VeXkbbp6Q9RB1SDJbLPk0xF3q115CV8oyDYiqrAUYd4',
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

export default instance
