import { HelperFunctions } from "src/assets/util/HelperFunctions";

export interface InvCtrlPeriod {
    "id": number;
    "warehouseID": any;
    "warehouse": string;
    "dateFrom": string;
    "dateTo": string;
    "closed": boolean;
}

export function BlankInvCtrlPeriod(): InvCtrlPeriod {
    return {
        id: 0,
        warehouseID: '',
        warehouse: '',
        dateFrom: HelperFunctions.GetDateString(0,0,0),
        dateTo: HelperFunctions.GetDateString(1, 0, 0),
        closed: false
    } as InvCtrlPeriod
}