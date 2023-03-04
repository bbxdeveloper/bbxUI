import { InvoiceCategory } from "./InvoiceCategory";
import { InvoiceTypes } from "./InvoiceTypes";

export class SummaryInvoiceMode {
    public invoiceCategory!: InvoiceCategory
    public invoiceType!: InvoiceTypes
    public correction!: boolean
    public incoming!: boolean
    public paymentMethod: string = ''
}
