import { InvoiceLine } from "./InvoiceLine";

export interface CreateOutgoingInvoiceRequest {
    "warehouseCode": number,
    "invoiceIssueDate": string, // date
    "invoiceDeliveryDate": string, // date
    "paymentDate": string, // date
    "customerID": number,
    "paymentMethod": string,
    "notice": string,
    "invoiceNetAmount": number,
    "invoiceVatAmount": number,
    "invoiceLines": InvoiceLine[]
}