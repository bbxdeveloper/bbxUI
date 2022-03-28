import { Counter } from "./Counter";

export interface CreateCounterResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data": Counter;
}
