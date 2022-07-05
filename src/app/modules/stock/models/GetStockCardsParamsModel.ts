export interface GetStockCardsParamsModel {
    WarehouseID?: number,
    OrderBy: string,
    PageSize: number,
    PageNumber: number,
    StockCardDateFrom?: string;
    StockCardDateTo?: string;
    InvoiceNumber?: string;
    ProductID?: number
}