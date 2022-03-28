import { Counter } from "./Counter";

export interface UpdateCounterResponse {
    "succeeded": boolean;
    "message"?: string;
    "errors"?: string[];
    "data"?: Counter;
}