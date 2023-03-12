import { InvoiceLineUnitPriceChange } from "./InvoiceLineUnitPriceChange"

export interface PricePreviewRequest {
    id: number
    customerID: number
    invoiceLines: InvoiceLineUnitPriceChange[]
}
