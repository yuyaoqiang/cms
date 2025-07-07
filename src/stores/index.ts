import { getLocalStorage, setLocalStorage } from '@/utils/xLocalStorage'
import { create } from 'zustand'

export type State = {
    token: string
    userInfo: any
    firstPath: string
}

export type Store = {
    resetState: () => void
    setToken: (token: string) => void
    setUserInfo: (userInfo: any) => { firstPath: string }
}

export const INITIAL_STATE: State = {
    token: '',
    userInfo: {},
    firstPath: ''
}

export const useStore = create<State & Store>((set) => ({
    ...INITIAL_STATE,
    token: getLocalStorage('token') ?? INITIAL_STATE.token,
    userInfo: getLocalStorage('userInfo') ?? INITIAL_STATE.userInfo,
    resetState: () => set(INITIAL_STATE),
    setToken: (token: string) => {
        setLocalStorage('token', token)
        set({ token })
    },
    setUserInfo: (userInfo: any) => {
        setLocalStorage('userInfo', userInfo)
        set({ userInfo })
        setLocalStorage('firstPath', INITIAL_STATE.firstPath)
        return { firstPath: INITIAL_STATE.firstPath }
    }
}))
