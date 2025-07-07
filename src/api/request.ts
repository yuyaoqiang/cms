import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { useStore } from '@/stores'

const instance: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000
})

instance.interceptors.request.use((config) => {
    const { token } = useStore.getState()
    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
        }
    }
    return config
})

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const msg = error.response?.data?.msg ?? '网络异常'
        message.error(msg)
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
