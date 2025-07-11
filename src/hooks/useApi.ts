import type { ApiResponse } from '@/api/request'
import { message } from 'antd'
import { useState, useCallback, useRef, useEffect } from 'react'

interface UseApiOptions {
    immediate?: boolean // 是否立即执行
    onSuccess?: (data: any) => void
    onError?: (error: Error) => void
    showLoading?: boolean
    showError?: boolean
}

interface UseApiResult<T> {
    data: T | null
    loading: boolean
    error: Error | null
    execute: (...args: any[]) => Promise<T | null>
    reset: () => void
}

/**
 * 通用 API 调用 Hook
 * @param apiFunction API 函数
 * @param options 配置选项
 */
export function useApi<T = any>(
    apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
    options: UseApiOptions = {}
): UseApiResult<T> {
    const {
        immediate = false,
        onSuccess,
        onError,
        showLoading = false,
        showError = true
    } = options

    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const loadingRef = useRef(false)
    const hideLoadingMessage = useRef<(() => void) | null>(null)

    const execute = useCallback(
        async (...args: any[]): Promise<T | null> => {
            if (loadingRef.current) return null

            try {
                setLoading(true)
                setError(null)
                loadingRef.current = true

                // 显示加载提示
                if (showLoading) {
                    hideLoadingMessage.current = message.loading('加载中...', 0)
                }

                const response = await apiFunction(...args)
                const result = response.result

                setData(result)
                onSuccess?.(result)

                return result
            } catch (err) {
                const error = err as Error
                setError(error)

                if (showError) {
                    message.error(error.message || '请求失败')
                }

                onError?.(error)
                return null
            } finally {
                setLoading(false)
                loadingRef.current = false

                // 隐藏加载提示
                if (hideLoadingMessage.current) {
                    hideLoadingMessage.current()
                    hideLoadingMessage.current = null
                }
            }
        },
        [apiFunction, onSuccess, onError, showLoading, showError]
    )

    const reset = useCallback(() => {
        setData(null)
        setError(null)
        setLoading(false)
        loadingRef.current = false

        if (hideLoadingMessage.current) {
            hideLoadingMessage.current()
            hideLoadingMessage.current = null
        }
    }, [])

    // 立即执行
    useEffect(() => {
        if (immediate) {
            execute()
        }
    }, [immediate, execute])

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            if (hideLoadingMessage.current) {
                hideLoadingMessage.current()
            }
        }
    }, [])

    return {
        data,
        loading,
        error,
        execute,
        reset
    }
}

/**
 * 分页 API Hook
 */
export function usePaginationApi<T = any>(
    apiFunction: (params: any) => Promise<
        ApiResponse<{
            list: T[]
            total: number
            pageNum: number
            pageSize: number
        }>
    >,
    options: UseApiOptions = {}
) {
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    })

    const { data, loading, error, execute, reset } = useApi(apiFunction, {
        ...options,
        immediate: false
    })

    const fetchData = useCallback(
        async (params: any = {}) => {
            const result = await execute({
                pageNum: pagination.current,
                pageSize: pagination.pageSize,
                ...params
            })

            if (result) {
                setPagination((prev) => ({
                    ...prev,
                    total: result.total
                }))
            }

            return result
        },
        [execute, pagination.current, pagination.pageSize]
    )

    const handlePageChange = useCallback((page: number, size?: number) => {
        setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: size || prev.pageSize
        }))
    }, [])

    const resetPagination = useCallback(() => {
        setPagination({
            current: 1,
            pageSize: 10,
            total: 0
        })
        reset()
    }, [reset])

    // 当分页参数改变时重新请求
    useEffect(() => {
        if (options.immediate !== false) {
            fetchData()
        }
    }, [pagination.current, pagination.pageSize])

    return {
        data: data?.list || [],
        loading,
        error,
        pagination,
        fetchData,
        handlePageChange,
        reset: resetPagination
    }
}

/**
 * 表单提交 Hook
 */
export function useSubmit<T = any>(
    apiFunction: (data: any) => Promise<ApiResponse<T>>,
    options: UseApiOptions & {
        onSubmitSuccess?: (data: T) => void
    } = {}
) {
    const { onSubmitSuccess, ...apiOptions } = options

    const { loading, error, execute } = useApi(apiFunction, {
        ...apiOptions,
        showLoading: true,
        onSuccess: (data) => {
            message.success('操作成功')
            onSubmitSuccess?.(data)
            apiOptions.onSuccess?.(data)
        }
    })

    const submit = useCallback(
        async (formData: any) => {
            return await execute(formData)
        },
        [execute]
    )

    return {
        loading,
        error,
        submit
    }
}
