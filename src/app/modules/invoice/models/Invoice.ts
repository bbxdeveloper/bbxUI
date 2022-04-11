export interface Invoice {
    "InvoiceNumber"?: any,
    "CustomerName"?: string,
    "WarehouseName"?: string,
    "InvoiceDeliveryDate"?: string,
    "PaymentDate"?: string,
    "PaymentMethodX"?: string,
    "InvoiceNetAmount"?: number,
    "InvoiceVatAmount"?: number,
    "InvoiceGrossAmount"?: number,
    "Notice"?: string;
}