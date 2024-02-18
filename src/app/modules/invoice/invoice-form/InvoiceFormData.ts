import { CurrencyCodes } from "../../system/models/CurrencyCode";

export interface InvoiceFormData {
    paymentMethod: string,
    invoiceDeliveryDate: string,
    invoiceIssueDate: string,
    paymentDate: string,
    invoiceOrdinal: string, // in post response
    notice: string,
    customerInvoiceNumber: string,
    currency: CurrencyCodes,
    exchangeRate: number,
}
