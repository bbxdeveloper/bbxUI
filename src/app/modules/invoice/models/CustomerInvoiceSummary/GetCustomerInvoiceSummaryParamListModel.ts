import { IQueryParamList } from "src/assets/model/IQueryParamList"

export interface GetCustomerInvoiceSummaryParamListModel extends IQueryParamList {
    Incoming: boolean
    InvoiceDeliveryDateFrom: string
    InvoiceDeliveryDateTo?: string
    CustomerID?: number
    WarehouseCode?: string
}