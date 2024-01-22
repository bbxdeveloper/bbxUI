export interface GetInvoicesParamListModel {
    WarehouseCode?: string;
    InvoiceType: string
    InvoiceNumber?: string;
    InvoiceIssueDateFrom?: any;
    InvoiceIssueDateTo?: any;
    InvoiceDeliveryDateFrom?: any;
    InvoiceDeliveryDateTo?: any;
    OrderBy?: string;
    PageSize?: number;
    PageNumber?: number;
    CustomerID?: number;
}