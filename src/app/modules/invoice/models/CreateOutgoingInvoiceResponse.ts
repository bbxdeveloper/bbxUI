import { CreateOutgoingInvoiceResponseData } from "./CreateOutgoingInvoiceResponseData";

export interface CreateOutgoingInvoiceResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: any[],
    "data"?: CreateOutgoingInvoiceResponseData,
}