export class CustomerInvoiceSummary {
    incoming: boolean = false
    customerID: number = 0
    customerName: string = ''
    customerFullAddress: string = ''
    invoiceCount: number = 0
    invoiceDiscountSum: number = 0
    invoiceDiscountHUFSum: number = 0
    invoiceNetAmountSum: number = 0
    invoiceNetAmountHUFSum: number = 0
    invoiceVatAmountSum: number = 0
    invoiceVatAmountHUFSum: number = 0
    invoiceGrossAmountSum: number = 0
    invoiceGrossAmountHUFSum: number = 0
}