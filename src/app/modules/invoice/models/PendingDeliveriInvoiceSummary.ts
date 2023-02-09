export interface PendingDeliveriInvoiceSummary {
    warehouseID: number,
    customerID: number,
    customer: string,
    fullAddress: string,
    sumNetAmount: number,
    priceReview: boolean,
}