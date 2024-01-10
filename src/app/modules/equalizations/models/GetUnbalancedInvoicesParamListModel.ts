export interface GetUnbalancedInvoicesParamListModel {
    InvoiceNumber?: string;
    CustomerInvoiceNumber?: string;
    CustomerID?: number;
    Incoming: boolean;
    InvoiceDeliveryDateFrom?: any;
    InvoiceDeliveryDateTo?: any;
    InvoiceIssueDateFrom?: any;
    InvoiceIssueDateTo?: any;
    PaymentDateFrom?: any;
    PaymentDateTo?: any;
    Expired?: boolean;
    OrderBy?: string;
    ID?: number;
    PageSize?: number;
    PageNumber?: number;
}