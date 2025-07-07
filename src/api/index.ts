import axios from 'axios'

const instance = axios.create({ baseURL: '/api' })

export type ApiResponse<T = any> = {
    msg: string
    result: T
    status: string
}

export const get = <T = any>(url: string, params?: any) =>
    instance.get<ApiResponse<T>>(url, { params })

export const post = <T = any>(url: string, data?: any) =>
    instance.post<ApiResponse<T>>(url, data)
