import { Status } from "./Status";

export interface ICellStatusProvider {
    getCellStatus(cell: string): Status
}

export function isICellStatusProvider(obj: unknown): obj is ICellStatusProvider {
    return (obj as ICellStatusProvider).getCellStatus !== undefined
}
