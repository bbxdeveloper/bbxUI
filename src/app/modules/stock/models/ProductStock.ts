export interface ProductStock {
    id: number,
    warehouseID: number,
    warehouse: string,
    warehouseCode: string,
    productID: number,
    productCode: string,
    product: string,
    realQty: number,
    avgCost: number,
    latestIn: string,
    latestOut: string,
    locationID: number|null,
    location: string
}
