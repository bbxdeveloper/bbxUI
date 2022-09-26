import { Product } from "../../product/models/Product";
import { InvCtrlPeriod } from "./InvCtrlPeriod";
export interface InvCtrl {
    "invCtrlType": string,
    "warehouseID": number,
    "invCtlPeriodID": number,
    "productID": number,
    "invCtrlDate": string,
    "oCalcQty": number,
    "oRealQty": number,
    "nCalcQty": number,
    "nRealQty": number,
    "avgCost": number,
    "userID": number,
    "warehouse": string,
    "invCtrlPeriod": InvCtrlPeriod,
    "product": string,
    "id": number,
    "createTime": string,
    "updateTime": string,
    "deleted": boolean
}