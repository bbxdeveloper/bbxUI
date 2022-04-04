import { InvoiceLine } from "./InvoiceLine";

export interface CreateOutgoingInvoiceRequest {
    "warehouseCode": number, // 001 - string
    "invoiceIssueDate": string, // date
    "invoiceDeliveryDate": string, // date
    "paymentDate": string, // date
    "customerID": number,
    "paymentMethod": string,
    "notice": string,
    "invoiceNetAmount": number, // amount * price (sum invoicelines) - status row
    "invoiceVatAmount": number, // netamount * vat (sum invoicelines)
    "lineGrossAmount": number, // netamount + vatamount (sum invoicelines)
    "invoiceLines": InvoiceLine[]
}