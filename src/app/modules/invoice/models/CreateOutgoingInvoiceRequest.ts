import { HelperFunctions } from "src/assets/util/HelperFunctions";
import { InvoiceLine, InvoiceLineForPost } from "./InvoiceLine";

export interface CreateOutgoingInvoiceRequest<T = InvoiceLine> {
    "warehouseCode": string, // 001 - string
    
    "invoiceIssueDate": any, // date
    "invoiceDeliveryDate": any, // date
    "paymentDate": any, // date
    
    "customerID": number,
    "customerInvoiceNumber"?: string,
    
    "paymentMethod": string,
    
    "notice": string,
    
    "invoiceLines": T[],
    
    "currencyCode"?: string,
    "exchangeRate"?: number,
    
    "incoming"?: boolean,
    "invoiceType"?: string,

    "invoiceDiscountPercent": number;
}

export interface OutGoingInvoiceFullData extends CreateOutgoingInvoiceRequest<InvoiceLine> {
    "invoiceNetAmount": number, // amount * price (sum invoicelines) - status row
    "invoiceVatAmount": number, // netamount * vat (sum invoicelines)
    "lineGrossAmount": number, // netamount + vatamount (sum invoicelines)
    "invoiceDiscountPercent": number;
}

export function OutGoingInvoiceFullDataToRequest(f: OutGoingInvoiceFullData): CreateOutgoingInvoiceRequest<InvoiceLineForPost> {
    let res = {
        customerID: f.customerID,
        invoiceDeliveryDate: f.invoiceDeliveryDate,
        invoiceIssueDate: f.invoiceIssueDate,
        invoiceLines: f.invoiceLines.map(x => x.GetPOSTData()),
        notice: f.notice,
        paymentDate: f.paymentDate,
        paymentMethod: f.paymentMethod,
        warehouseCode: f.warehouseCode,
        currencyCode: f.currencyCode,
        customerInvoiceNumber: f.customerInvoiceNumber,
        exchangeRate: f.exchangeRate,
        incoming: f.incoming,
        invoiceType: f.invoiceType,
        invoiceDiscountPercent: HelperFunctions.ToFloat(f.invoiceDiscountPercent)
    } as CreateOutgoingInvoiceRequest<InvoiceLineForPost>;
    return res;
}