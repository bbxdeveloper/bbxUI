import { ProductGroup } from "./ProductGroup";


export interface UpdateProductGroupResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: ProductGroup[]
}