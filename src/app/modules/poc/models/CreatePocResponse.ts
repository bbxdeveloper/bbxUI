import { Poc } from "./Poc";

export interface CreatePocResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data": Poc;
}
