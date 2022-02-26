import { Origin } from "./Origin";

export interface UpdateOriginResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: Origin
}