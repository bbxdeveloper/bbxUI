import { Poc } from "./Poc";

export interface GetPocsResponse {
    "pageNumber": number,
    "pageSize": number,
    "recordsFiltered": number,
    "recordsTotal": number,
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: Poc[]
}
