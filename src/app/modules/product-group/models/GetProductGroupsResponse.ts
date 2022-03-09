import { ProductGroup } from "./ProductGroup";

export interface GetProductGroupsResponse {
    "pageNumber": number,
    "pageSize": number,
    "recordsFiltered": number,
    "recordsTotal": number,
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: ProductGroup[]
}
