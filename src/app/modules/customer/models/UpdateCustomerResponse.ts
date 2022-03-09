import { Customer } from "./Customer";

export interface UpdateCustomerResponse {
    "succeeded": boolean;
    "message"?: string;
    "errors"?: string[];
    "data"?: Customer;
}