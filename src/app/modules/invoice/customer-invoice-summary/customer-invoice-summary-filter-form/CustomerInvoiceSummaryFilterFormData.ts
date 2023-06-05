export interface CustomerInvoiceSummaryFilterFormData {
    Incoming: boolean
    InvoiceDeliveryDateFrom: string
    InvoiceDeliveryDateTo?: string
    CustomerID?: number
    WarehouseCode?: string
}
