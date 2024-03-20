import { Invoice } from "./Invoice";

export interface GetInvoicesResponse {
    pageNumber: number,
    pageSize: number,
    recordsFiltered: number,
    recordsTotal: number,
    succeeded: boolean,
    message?: string,
    errors?: any[],
    data: Invoice[],
    summaryNet: number,
    summaryVat: number,
    summaryGross: number,
}
