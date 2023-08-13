import { Status } from "./Status"

export interface IStatusProvider {
    getStatus(): Status
}

export function isIStatusProvider(obj: unknown): obj is IStatusProvider {
    return (obj as IStatusProvider).getStatus !== undefined
}
