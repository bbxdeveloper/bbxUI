export interface InvoiceLine {
    "lineNumber": number,
    "productCode": string,
    "vatRateCode": string,
    "quantity": number,
    "price": number,
    "lineNetAmount": number,
    "lineVatAmount": number
}