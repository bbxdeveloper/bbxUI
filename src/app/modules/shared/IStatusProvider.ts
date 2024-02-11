import { Status } from "./Status"

export interface IRowStatusProvider {
    getRowStatus(): Status
}

export function isIRowStatusProvider(obj: unknown): obj is IRowStatusProvider {
    return (obj as IRowStatusProvider).getRowStatus !== undefined
}
