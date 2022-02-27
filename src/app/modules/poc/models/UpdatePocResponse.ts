import { Poc } from "./Poc";

export interface UpdatePocResponse {
    "succeeded": boolean;
    "message"?: string;
    "errors"?: string[];
    "data"?: Poc;
}