import { request, type ApiResponse } from './request'

export { ApiResponse }

// 直接使用完整路径，不添加额外前缀
export const get = <T = any>(url: string, params?: any) =>
    request<T>({ url, method: 'GET', params })

export const post = <T = any>(url: string, data?: any) =>
    request<T>({ url, method: 'POST', data })

export const put = <T = any>(url: string, data?: any) =>
    request<T>({ url, method: 'PUT', data })

export const del = <T = any>(url: string, params?: any) =>
    request<T>({ url, method: 'DELETE', params })
