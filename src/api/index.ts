import { request, type ApiResponse } from './request'

export { ApiResponse }

export const get = <T = any>(url: string, params?: any) =>
    request<T>({ url, method: 'GET', params })

export const post = <T = any>(url: string, data?: any) =>
    request<T>({ url, method: 'POST', data })
