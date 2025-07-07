import { useStore } from '@/stores'
// @ts-ignore
import * as accounting from 'accounting-js'
import { message } from 'antd'
import dayjs from 'dayjs'
import eachDeep from 'deepdash/eachDeep'
import reduceDeep from 'deepdash/reduceDeep'
import { addListener, launch } from 'devtools-detector'
import { decode } from 'js-base64'
import {
    cloneDeep,
    compact,
    concat,
    difference,
    filter,
    find,
    findIndex,
    isArray,
    isNil,
    isObject,
    omitBy,
    reverse,
    uniq
} from 'lodash'
import { stringify } from 'qs'

// 忽略antd的findDOMNode报错，等antd修复了再去除
export const ignoreAntdFindDOMNodeErr = () => {
    const consoleError = console.error.bind(console)

    console.error = (errObj, ...args) => {
        if (args.includes('findDOMNode')) {
            return
        }

        consoleError(errObj, ...args)
    }
}
/**
 * 生产指定位数随机字符
 * @param {number} length 生成多少位的字符
 * @param {string} characters 目标字符集
 * @return {string} 随机字符
 */
export const generateString = (
    length = 1,
    characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
): string => {
    const charactersLength = characters.length
    let result = ''

    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }

    return result
}

/**
 * 去除对象中的空值键值对
 * @param obj {object} 源对象
 * @return 去除对象中的空键值
 */
export const removeEmptyPairs = (obj: any) => {
    if (isObject(obj)) {
        return omitBy(obj, (v) => isNil(v) || v === '' || v === '{}')
    } else {
        return obj
    }
}

// 禁用react的devtools插件
export const disableReactDevTools = (): void => {
    const noop = (): void => undefined
    const DEV_TOOLS = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__

    if (typeof DEV_TOOLS === 'object') {
        for (const [key, value] of Object.entries(DEV_TOOLS)) {
            DEV_TOOLS[key] = typeof value === 'function' ? noop : null
        }
    }
}

// 注入构建信息windonw变量
export const injectBuildVersion = () => {
    window._version = import.meta.env._version
}

// 清空本地cookie
export const deleteAllCookies = () => {
    const cookies = document.cookie.split(';')

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
}

// 清空本地数据
export const clearLocalData = () => {
    deleteAllCookies()

    localStorage.clear()
    sessionStorage.clear()

    useStore.getState().resetState()
}

/**
 * 获取所有上级的key
 * @param object
 * @param childID
 * @returns array
 */
export const getParentIDs = (object: any, childID: number | string) => {
    if (object.id === childID) {
        return []
    } else if (object.button || Array.isArray(object)) {
        const children = Array.isArray(object) ? object : object.button
        for (const child of children) {
            const result: any = getParentIDs(child, childID)
            if (result) {
                if (object.id) {
                    result.unshift(object.id)
                }
                return result
            }
        }
    }
}

/**
 * 获取指定key值的父元素的某项key值
 * @param {tree} tree
 * @param {string} key
 * @param {string} parentKey
 * @return {string} 父元素某项key值
 */
export const getParentSingleKey = (
    tree: any,
    key: string,
    parentKey: string
) => {
    let parent: any

    for (let i = 0; i < tree.length; i++) {
        const node = tree[i]
        if (node.button) {
            if (node.button.some((item: any) => item.id === key)) {
                parent = node[parentKey]
            } else if (getParentSingleKey(node.button, key, parentKey)) {
                parent = getParentSingleKey(node.button, key, parentKey)
            }
        }
    }

    return parent
}

/**
 *
 * @param object
 * @returns array
 */
export const getChildrenIDs = (object: any): string[] => {
    return reduceDeep(
        object,
        (acc, value, key) => {
            if (key === 'id') {
                acc.push(value)
            }
            return acc
        },
        []
    )
}

/**
 * 根据权限过滤tree
 * @param arr 树
 * @param permissions 权限树组
 * @returns
 */
export const filterByPermissions = (
    arr: any,
    permissions: any[],
    key?: string
) => {
    if (!isArray(arr) && isObject(arr)) {
        // 如果为对象类，先转换为数组
        arr = [arr]
    }

    return filter(cloneDeep(arr), (item) => {
        if (
            find(permissions, (o) => o[key || 'title'] === item.name) ||
            !item.path
        ) {
            if (item.children) {
                item.children = filterByPermissions(
                    item.children,
                    find(permissions, (o) => o.title === item.name)
                        ?.subpermission,
                    'name'
                )
            }
            return !item.path && item.children?.length === 0 ? false : true
        }
    })
}

export const getPermissionsArr = (arr: any[]) => {
    return reduceDeep(
        arr || [],
        (acc, value, key) => {
            if (key === 'module') {
                acc.push(value)
            }
            return acc
        },
        []
    )
}

/**
 * 根据权限标识检测是否有该权限
 * @param {string} id 权限标识
 * @returns {boolean} 是否有权限
 */
export const permission = (id: string) => {
    const buttonPermissions = useStore.getState().buttonPermissions
    return buttonPermissions.includes(id)
}

/**
 * 检测targetKey是否有父级
 * @param tree 树
 * @param targetKey 目标key
 */
export const hasParentOnTree = (
    tree: any,
    targetKey: any,
    targetKeyName = 'id'
) => {
    let result = false

    eachDeep(tree, (value, key) => {
        if (key === 'button' && isArray(value)) {
            if (findIndex(value, (o) => o[targetKeyName] === targetKey) > -1) {
                result = true
            }
        }
    })

    return result
}

/**
 * 检测targetKey是否有子级
 * @param tree 树
 * @param targetKey 目标key
 */
export const hasChildOnTree = (
    tree: any,
    targetKey: any,
    targetKeyName = 'id'
) => {
    let result = false

    eachDeep(tree, (value, key, parentValue) => {
        if (key === targetKeyName && value === targetKey) {
            if (isArray(parentValue.button) && parentValue.button.length > 0) {
                result = true
            }
        }
    })

    return result
}

export const getChildrenKeys = (tree: any, targetKey: any) => {
    let childrenKeys: any[] = []

    // 获取下级节点
    eachDeep(tree, (value, key, parentValue) => {
        if (key === 'id' && value === targetKey && parentValue.button) {
            childrenKeys = getChildrenIDs(parentValue.button)
        }
    })

    return childrenKeys
}

/**
 * 获取目标节点的父级节点的“空”，”半选“，”全选“三种状态
 * @param tree 树
 * @param targetKey 目标节点
 * @param halfCheckedKeys 整棵树上的半选
 * @param checkedKeys 整棵树上的全选
 * @param canParentSingleCheck 允许单选父级
 * @returns
 */
export const getParentsAllCheckedStatus = (
    tree: any,
    targetKey: number,
    halfCheckedKeys: any[],
    checkedKeys: any[],
    canParentSingleCheck: any
) => {
    const hasParent = hasParentOnTree(tree, targetKey)
    const parentKeys = hasParent ? reverse(getParentIDs(tree, targetKey)) : []
    const halfCheckedAndChecked = concat(halfCheckedKeys, checkedKeys)

    const getStatus = (type: 'halfChecked' | 'checked') =>
        filter(parentKeys, (n) => {
            let children: any[] = []
            eachDeep(tree, (value, key, parentValue) => {
                if (key === 'id' && value === n && parentValue.button) {
                    children = getChildrenIDs(parentValue.button)
                }
            })

            const differenceLength = difference(
                children,
                halfCheckedAndChecked
            ).length

            if (type === 'halfChecked') {
                if (canParentSingleCheck) {
                    // 允许父级元素单选
                    return (
                        differenceLength > 0 &&
                        differenceLength <= children.length
                    )
                } else {
                    // 不允许父级元素单选
                    return (
                        differenceLength > 0 &&
                        differenceLength < children.length
                    )
                }
            } else if (type === 'checked') {
                return differenceLength === 0
            }
        })

    const halfChecked = getStatus('halfChecked')
    const checked = getStatus('checked')

    return { halfChecked, checked }
}

/**
 * 通过targetKey的勾选状态来获取更新后的整棵树的"全选"和"半选"
 * @param tree 树
 * @param checkedKeys 老的“全选”
 * @param halfCheckedKeys 老的“半选”
 * @param targetKey 目录key
 * @param canParentSingleCheck 允许单选父级
 * @returns
 */
export const getNewStatusFromTree = (
    tree: any,
    checkedKeys: string[],
    halfCheckedKeys: string[],
    targetKey: any,
    canParentSingleCheck = true
) => {
    const isNone =
        !checkedKeys.includes(targetKey) && !halfCheckedKeys.includes(targetKey)
    const isHalfChecked = halfCheckedKeys.includes(targetKey)
    const isChekced = checkedKeys.includes(targetKey)
    const hasParent = hasParentOnTree(tree, targetKey)
    const hasChild = hasChildOnTree(tree, targetKey)
    const parentKeys = hasParent ? getParentIDs(tree, targetKey) : []
    const childrenKeys = hasChild ? getChildrenKeys(tree, targetKey) : []

    if (isNone && !hasChild) {
        // 没选中且没下级
        checkedKeys.push(targetKey) // 全选 + 自身
    } else if (isNone && hasChild) {
        // 没选中且有下级
        if (canParentSingleCheck) {
            // 允许单选父级
            halfCheckedKeys.push(targetKey) // 半选 + 自身
        } else {
            // 不允许单选父级
            checkedKeys = concat(checkedKeys, childrenKeys, [targetKey]) // 全选 + 下级 + 自身
        }
    } else if (isHalfChecked) {
        // 半选
        halfCheckedKeys = difference(halfCheckedKeys, childrenKeys, [targetKey]) // 半选 - 下级 - 自身
        checkedKeys = concat(checkedKeys, childrenKeys, [targetKey]) // 全选 + 下级 + 自身
    } else if (isChekced) {
        // 选中
        checkedKeys = difference(checkedKeys, childrenKeys, [targetKey]) // 全选 - 下级 - 自身
    }

    // 更新父级
    if (hasParent) {
        // 有父级：半选 + 父级半选，全选 + 父级全选
        const { halfChecked, checked } = getParentsAllCheckedStatus(
            tree,
            targetKey,
            halfCheckedKeys,
            checkedKeys,
            canParentSingleCheck
        )
        halfCheckedKeys = concat(
            difference(halfCheckedKeys, parentKeys),
            halfChecked
        ) // 半选 - 父级 + 父级半选
        checkedKeys = concat(difference(checkedKeys, parentKeys), checked) // 全选 - 父级 + 父级全选
    }

    const newHalfCheckedKeys = uniq(compact(halfCheckedKeys)) // 新的半选
    const newCheckedKeys = filter(
        uniq(compact(difference(checkedKeys, newHalfCheckedKeys))),
        (item) => !isNaN(Number(item))
    ) // 新的全选
    return { newCheckedKeys, newHalfCheckedKeys }
}

/**
 * 把选中状态分离成“半选”和“全选”
 * @param tree 树
 * @param status
 * @param canParentSingleCheck 允许单选父级
 * @returns { halfChecked, checked } { 半选,全选 }
 */
export const splitStatusOnTree = (
    tree: any,
    status: string[],
    allCheckedKeys: string[],
    canParentSingleCheck = true
) => {
    const getStatus = (type: 'halfChecked' | 'checked') =>
        filter(status, (n) => {
            let children: any[] = []
            eachDeep(tree, (value, key, parentValue) => {
                if (key === 'id' && value === n && parentValue.button) {
                    children = getChildrenIDs(parentValue.button)
                }
            })

            const differenceLength = difference(children, status).length

            if (type === 'halfChecked') {
                if (canParentSingleCheck) {
                    return (
                        differenceLength > 0 &&
                        differenceLength <= children.length &&
                        allCheckedKeys.includes(n)
                    )
                } else {
                    return (
                        differenceLength > 0 &&
                        differenceLength < children.length &&
                        allCheckedKeys.includes(n)
                    )
                }
            } else if (type === 'checked') {
                return differenceLength === 0 && allCheckedKeys.includes(n)
            }
        })

    const halfChecked: any[] = getStatus('halfChecked')
    const checked: any[] = getStatus('checked')

    return { halfChecked, checked }
}

/**
 *格式化时间
 *
 * @export
 * @param {*} time 需要格式化的时间
 * @param {string} [formate='YYYY-MM-DD HH:mm:ss'] 需要格式化化时间的格式
 * * @param {bool} isUnix 是否需要转换linux时间
 * @returns 返回标准时间 如：2018-11-11 00:00:00
 */
export function dateTimeForm(
    time: any,
    formate = 'YYYY-MM-DD HH:mm:ss',
    isUnix = true
) {
    if (String(time) !== '0' && String(time) !== '') {
        if (isUnix) {
            return dayjs.unix(time).format(formate)
        }
        return dayjs(time).format(formate)
    }
}

/**
 * 将金额格式话
 * for example formartMoney(12345678) -> ¥12,345,678.00
 * @param amount 金额
 * @param symbol 货币符号
 * @param precision 保留小数的进度
 * @returns 被格式化后的金额
 * @remark 默认不支持'¥'的货币单位，需要手动加上， 默认支持'$'
 */
export const formatMoney = (
    amount: React.ReactNode,
    symbol = '¥',
    precision = 2
): string => {
    if (symbol === '¥') {
        return (
            symbol +
            accounting
                .formatMoney(amount || 0, { symbol, precision, thousand: '' })
                .slice(1)
        )
    } else {
        return accounting.formatMoney(amount || 0, {
            symbol,
            precision,
            thousand: ''
        })
    }
}

/**
 * 封装ModalForm的onFinish的固定操作
 * @param actionRef ModalForm组件的ref
 * @param tips 成功提示
 * @returns 返回结果
 */
export const afterModalFormFinish = (
    actionRef?: any,
    tips?: null | string,
    returnBoolean: boolean = true
) => {
    if (tips) {
        message.success(
            ['success', 'succes'].includes(tips) ? '操作成功' : tips
        )
    }

    if (actionRef) {
        actionRef?.current?.reload()
    }

    return returnBoolean
}

// 防止debug调试代码
export const antiDebugging = () => {
    let timer: null | NodeJS.Timeout = null // 定时器id

    addListener((b: boolean) => {
        const _sessionStorage =
            window[decode('c2Vzc2lvblN0b3JhZ2U=') as 'sessionStorage']

        if (b) {
            // 打开了控制台
            timer = setInterval(() => eval('de' + 'bu' + 'gg' + 'er'), 1000)
            // 开启防调试功能
            if (_sessionStorage[decode('aG9zdA==')] !== '0') {
                _sessionStorage[decode('aG9zdA==')] = location.host // sessionStorage.host = location.host
            }
        } else {
            // 没打开控制台
            if (timer) {
                clearInterval(timer)
            }
            // 关闭防调试功能
            _sessionStorage[decode('aG9zdA==')] = '' // sessionStorage.host = ''
        }
    })

    launch()
}
