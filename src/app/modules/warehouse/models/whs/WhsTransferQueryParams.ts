export interface WhsTransferQueryParams {
    WhsTransferStatus?: string,
    FromWarehouseCode?: string,
    ToWarehouseCode?: string,
    TransferDateFrom?: string,
    TransferDateTo?: string,
    Deleted?: boolean,
    OrderBy?: string,
    ID?: number,
    PageSize?: number,
    PageNumber?: number
}