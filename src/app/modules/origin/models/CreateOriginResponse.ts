import { Origin } from "./Origin";

export interface CreateOriginResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: Origin
}