import { IQueryParamList } from "src/assets/model/IQueryParamList";

export interface WhsTransferQueryParams extends IQueryParamList {
    WhsTransferStatus: string,
    FromWarehouseCode?: string,
    ToWarehouseCode?: string,
    TransferDateFrom?: string,
    TransferDateTo?: string,
    Deleted?: boolean
}