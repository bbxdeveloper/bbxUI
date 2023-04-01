export interface PendingDeliveryNote {
    customer: string
    customerID: number
    fullAddress: string
    invoiceDeliveryDate: string
    invoiceID: number
    invoiceNumber: string
    priceReview: boolean
    sumNetAmount: number
    sumNetAmountDiscounted: number
    warehouseID: number
}
