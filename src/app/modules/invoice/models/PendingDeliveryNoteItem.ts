export interface PendingDeliveryNote {
    warehouseID: number,
    invoiceID: number,
    invoiceNumber: string,
    invoiceDeliveryDate: string,
    customerID: number,
    customer: string,
    fullAddress: string,
    sumNetAmount: number,
    sumNetAmountDiscounted: number,
    priceReview: boolean
}
