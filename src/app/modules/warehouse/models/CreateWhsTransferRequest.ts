import { WhsTransferLine } from "./WhsTransferLine"

export interface CreateWhsTransferRequest {
    fromWarehouseCode: string,
    toWarehouseCode: string,
    transferDate: string,
    notice: string,
    userID: number,
    whsTransferLines: WhsTransferLine[]
}
