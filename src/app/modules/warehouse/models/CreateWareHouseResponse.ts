import { WareHouse } from "./WareHouse";

export interface CreateWareHouseResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: WareHouse
}