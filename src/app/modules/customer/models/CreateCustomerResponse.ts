import { Customer } from "./Customer";

export interface CreateCustomerResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data": Customer;
}
