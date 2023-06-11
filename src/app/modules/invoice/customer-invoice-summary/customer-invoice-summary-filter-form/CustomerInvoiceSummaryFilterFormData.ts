import { HelperFunctions } from "src/assets/util/HelperFunctions"

export class CustomerInvoiceSummaryFilterFormData {
    Incoming: boolean = false
    InvoiceDeliveryDateFrom: string = ''
    InvoiceDeliveryDateTo?: string = ''
    CustomerID?: number = -1
    CustomerSearch?: string = ''
    CustomerName?: string = ''
    CustomerAddress?: string = ''
    CustomerTaxNumber?: string = ''
    WarehouseCode?: string = ''

    public static create(): CustomerInvoiceSummaryFilterFormData {
        return {
            Incoming: false,
            InvoiceDeliveryDateFrom: HelperFunctions.GetDateString(0, 0, 0)
        } as CustomerInvoiceSummaryFilterFormData
    }

    protected constructor() { }
}
