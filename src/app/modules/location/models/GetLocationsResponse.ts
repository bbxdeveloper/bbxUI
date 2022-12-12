import { Location } from "./Location";

export interface GetLocationsResponse {
    "pageNumber": number,
    "pageSize": number,
    "recordsFiltered": number,
    "recordsTotal": number,
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: Location[]
}
