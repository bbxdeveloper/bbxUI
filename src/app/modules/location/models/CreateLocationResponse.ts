import { Location } from "./Location";

export interface CreateLocationResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: Location
}