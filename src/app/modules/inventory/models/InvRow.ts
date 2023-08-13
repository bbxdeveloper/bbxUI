import { IStatusProvider } from "../../shared/IStatusProvider";
import { Status } from "../../shared/Status";
import { InvCtrlItemForGet } from "./InvCtrlItem";

export class InvRow implements IStatusProvider {
    public static fromInvCtrlItemForGet(value: InvCtrlItemForGet): InvRow {
        const res = new InvRow();

        res.productCode = value.productCode
        res.product = value.product;
        res.nRealQty = value.nRealQty;
        res.oRealQty = value.oRealQty;
        res.oRealAmount = value.oRealAmount
        res.nRealAmount = value.nRealAmount

        return res;
    }

    productCode: string = "";
    product: string = "";
    oRealQty: number = 0;
    nRealQty: number = 0;
    oRealAmount: number = 0;
    nRealAmount: number = 0;

    getStatus(): Status {
        if (this.oRealQty < this.nRealQty) {
            return Status.Success
        }

        if (this.oRealQty > this.nRealQty) {
            return Status.Warning
        }

        return Status.None
    }
}