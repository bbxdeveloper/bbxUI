export interface StockRecord {
    "warehouseID": number,
    "productID": number,
    "realQty": number,
    "avgCost": number,
    "latestIn": string,
    "latestOut": string,
    "warehouse": string,
    "product": string,
    "invCtrlItems": any,
    "id": number,
    "createTime": string,
    "updateTime": string,
    "deleted": boolean
}