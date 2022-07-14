export interface GetStockCardsParamsModel {
    WarehouseID?: number,
    OrderBy: string,
    PageSize: number,
    PageNumber: number,
    StockCardDateFrom?: string;
    StockCardDateTo?: string;
    XRel?: string;
    ProductID?: number
}