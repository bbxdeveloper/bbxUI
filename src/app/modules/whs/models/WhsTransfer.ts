import { WhsTransferLineFull } from "./WhsTransferLine"
import { IBaseEntity } from "src/assets/model/IBaseEntity"
import { WhsTransferLine } from "./WhsTransferLine"

export class WhsTransferBase {
    fromWarehouseCode?: string
    toWarehouseCode?: string
    transferDate?: string
    notice?: string
    userID?: number
    whsTransferLines: WhsTransferLine[] = []
}

export class WhsTransferUpdate extends WhsTransferBase implements IBaseEntity<number> {
    id: number = 0
}

export class WhsTransferFull implements IBaseEntity<number> {
    id: number = 0
    whsTransferNumber?: string
    fromWarehouseID?: number
    toWarehouseID?: number
    transferDate?: string
    notice?: string
    copies: number = 0
    userID?: number
    whsTransferStatus?: string
    whsTransferStatusX?: string
    fromWarehouse?: string // eg. 001-Raktár
    toWarehouse?: string // eg. 002-Külső raktár
    user?: any
    whsTransferLines: WhsTransferLineFull[] = []
}