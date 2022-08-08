import { Product } from "../../product/models/Product";
import { InvCtrlPeriod } from "./InvCtrlPeriod";

export interface InvCtrl {
    wareHouseId: number;
    invCtrlPeriodId: number;
    productId: number;
    invCtrlDate: string;
    oCalcQty: number;
    oRealQty: number;
    nCalcQty: number;
    nRealQty: number;
    avgCost: number;
    userId?: number;
    wareHouse: string;
    invCtrlPeriod: InvCtrlPeriod;
    product: Product
}