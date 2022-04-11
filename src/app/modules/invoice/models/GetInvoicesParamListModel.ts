export interface GetInvoicesParamListModel {
    Incoming?: boolean;
    WarehouseCode?: string;
    InvoiceNumber?: string;
    InvoiceIssueDateFrom?: string;
    InvoiceIssueDateTo?: string;
    InvoiceDeliveryDateFrom?: string;
    InvoiceDeliveryDateTo?: string;
    OrderBy?: string;
    PageSize?: number;
    PageNumber?: number;
}