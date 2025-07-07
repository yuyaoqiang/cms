import { isArray, isObject } from 'lodash'
import { compress, decompress } from 'lz-string'

/**
 * 将key和value加密并存到localStorage
 * @param key 存到localStorage的key
 * @param value 存到localStorage的value
 * @returns
 */
export const setLocalStorage = (
    key: string,
    value: string | object | [any]
) => {
    if (isArray(value) || isObject(value)) {
        value = JSON.stringify(value)
    }

    localStorage[compress(key)] = compress(value)
}

/**
 * 从localStorage获取加密的key
 * @param key 要获取的key
 * @returns
 */
export const getLocalStorage = (key: string) => {
    const value = decompress(localStorage[compress(key)])
    if (!value) return undefined

    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}
