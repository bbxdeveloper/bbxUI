export interface PendingDeliveryInvoiceSummary {
    warehouseID: number,
    customerID: number,
    customer: string,
    fullAddress: string,
    sumNetAmount: number,
    priceReview: boolean,
}