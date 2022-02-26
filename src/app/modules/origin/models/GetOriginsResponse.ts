import { Origin } from "./Origin";

export interface GetOriginsResponse {
    "pageNumber": number,
    "pageSize": number,
    "recordsFiltered": number,
    "recordsTotal": number,
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: Origin[]
}
