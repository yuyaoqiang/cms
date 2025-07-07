export const IS_PROD = import.meta.env.MODE === 'production'

export type ObjType = Record<string | number, any>

export const INPUT_TRIM = {
    getValueFromEvent: (e: { target: { value: string } }) =>
        e.target.value.trim()
}

export enum ResCode {
    SUCCESS = '6000',
    ERR_TO_LOGIN = '6001'
}
