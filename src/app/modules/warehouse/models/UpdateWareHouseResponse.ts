import { WareHouse } from "./WareHouse";


export interface UpdateWareHouseResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: WareHouse
}