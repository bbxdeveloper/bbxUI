import { Offer } from "./Offer"

export interface GetOffersResponse {
    "pageNumber": number,
    "pageSize": number,
    "recordsFiltered": number,
    "recordsTotal": number,
    "succeeded": boolean,
    "message"?: string,
    "errors"?: any[],
    "data"?: Offer[]
}