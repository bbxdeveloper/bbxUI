import { HelperFunctions } from "src/assets/util/HelperFunctions";

export interface InvCtrlPeriodPost {
    "id": number;
    "warehouseID": any;
    "warehouse": string;
    "dateFrom": string;
    "dateTo": string;
    "closed": boolean;
}

export class InvCtrlPeriod implements InvCtrlPeriodPost {
    id: number = -1;
    warehouseID: any = '0';
    _warehouseID: any = '0';
    warehouse: string = "";
    dateFrom: string = "";
    dateTo: string = "";
    closed: boolean = false;

    public ConvertForPost(): InvCtrlPeriodPost {
        let res = {} as InvCtrlPeriodPost;

        res.id = this.id;
        res.warehouseID = this._warehouseID;
        res.warehouse = this.warehouse;
        res.dateFrom = this.dateFrom;
        res.dateTo = this.dateTo;
        res.closed = this.closed;

        return res;
    }
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