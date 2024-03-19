import { IResponse } from "src/assets/model/IResponse";
import { CustomerInvoiceSummary } from "./CustomerInvoiceSummary";

export interface GetCustomerInvoiceSummariesResponse extends IResponse<CustomerInvoiceSummary> {
    summaryNet: number
    summaryVat: number
    summaryGross: number
}