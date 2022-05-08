import { InvoiceLine } from "./InvoiceLine";

export interface CreateOutgoingInvoiceRequest {
    "warehouseCode": string, // 001 - string
    
    "invoiceIssueDate": any, // date
    "invoiceDeliveryDate": any, // date
    "paymentDate": any, // date
    
    "customerID": number,
    
    "paymentMethod": string,
    
    "notice": string,
    
    "invoiceNetAmount": number, // amount * price (sum invoicelines) - status row
    "invoiceVatAmount": number, // netamount * vat (sum invoicelines)
    "lineGrossAmount": number, // netamount + vatamount (sum invoicelines)
    
    "invoiceLines": InvoiceLine[],
    
    "currencyCode"?: string,
    "exchangeRate"?: number,
    
    "incoming"?: boolean,
    "invoiceType"?: string,
}