import { ProductGroup } from "./ProductGroup";

export interface CreateProductGroupResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: ProductGroup[]
}