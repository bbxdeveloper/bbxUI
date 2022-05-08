export interface GetInvoicesParamListModel {
    Incoming?: boolean;
    WarehouseCode?: string;
    InvoiceNumber?: string;
    InvoiceIssueDateFrom?: any;
    InvoiceIssueDateTo?: any;
    InvoiceDeliveryDateFrom?: any;
    InvoiceDeliveryDateTo?: any;
    OrderBy?: string;
    PageSize?: number;
    PageNumber?: number;
}