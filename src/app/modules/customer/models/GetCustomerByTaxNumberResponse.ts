import { Customer } from "./Customer";

export interface GetCustomerByTaxNumberResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: any[],
    "data"?: Customer
}