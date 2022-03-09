import { Product } from "./Product";

export interface UpdateProductResponse {
    "succeeded": boolean;
    "message"?: string;
    "errors"?: string[];
    "data"?: Product;
}