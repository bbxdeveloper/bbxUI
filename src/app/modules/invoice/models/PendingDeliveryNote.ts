export interface PendingDeliveryNote {
    invoiceNumber: string,
    RelDeliveryDate: string,
    productCode: string,
    lineDescription: string,
    quantity: number,
    unitOfMeasureX: number,
    unitPrice: number,
    lineNetAmount: number,

    invoiceLineID: number,
    warehouseID: number,
    customerID: number,
    customer: string,
    invoiceDeliveryDate: string,
    lineNumber: number,
    relDeliveryNoteInvoiceLineID: number,
    relDeliveryDate: string,
    vatRateID: number,
    vatRateCode: string,
    vatPercentage: number,
    unitOfMeasure: string,
    workNumber: string,
    exchangeRate: number,
}