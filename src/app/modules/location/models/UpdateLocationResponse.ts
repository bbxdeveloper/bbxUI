import { Location } from "./Location";

export interface UpdateLocationResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: Location
}