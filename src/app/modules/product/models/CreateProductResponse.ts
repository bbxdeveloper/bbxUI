import { Product } from "./Product";

export interface CreateProductResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data": Product;
}
