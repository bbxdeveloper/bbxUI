import { WhsTransferLineFull } from "./WhsTransferLine"
import { IBaseEntity } from "src/assets/model/IBaseEntity"
import { WhsTransferLine } from "./WhsTransferLine"
import { JsonIgnore } from "src/assets/model/navigation/DynamicObject"

export class WhsTransferBase {
    fromWarehouseCode?: string
    toWarehouseCode?: string
    transferDate?: string
    transferDateIn?: string
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
    transferDateIn?: string
    notice?: string
    copies: number = 0
    userID?: number
    whsTransferStatus?: string
    whsTransferStatusX?: string
    fromWarehouse?: string
    toWarehouse?: string
    user?: any
    @JsonIgnore
    whsTransferAmount: number = 0
    whsTransferLines: WhsTransferLineFull[] = []
}