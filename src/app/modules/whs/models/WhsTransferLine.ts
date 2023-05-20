import { IBaseEntity } from "src/assets/model/IBaseEntity"

export class WhsTransferLine {
    whsTransferLineNumber: number = 0
    productCode?: string
    quantity: number = 0
    unitOfMeasure?: string
    currAvgCost: number = 0
}

export class WhsTransferLineFull extends WhsTransferLine implements IBaseEntity<number> {
    id: number = 0
    whsTransferID?: number
    productID?: number
    product?: string
    unitOfMeasureX?: string
    itemAmount?: number
}