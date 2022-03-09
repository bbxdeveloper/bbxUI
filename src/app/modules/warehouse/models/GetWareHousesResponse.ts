import { WareHouse } from "./WareHouse";

export interface GetWareHousesResponse {
    "pageNumber": number,
    "pageSize": number,
    "recordsFiltered": number,
    "recordsTotal": number,
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: WareHouse[]
}
