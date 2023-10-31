import { JsonIgnore } from "src/assets/model/navigation/DynamicObject";
import { HelperFunctions } from "src/assets/util/HelperFunctions";

export class InvCtrlAbsent {
    "id": number = -1;
    "warehouseID": number = -1;
    "Warehouse": string = "";
    "productID": number = -1;
    "productCode": string = "";
    "product": string;
    "calcQty": number = 0;
    "realQty": number = 0;
    @JsonIgnore
    public get realQtyValue(): number {
        return HelperFunctions.Round2(this.realQty * this.avgCost, 1)
    }
    "outQty": number = 0;
    "avgCost": number = 0;
    "latestIn": string = "";
    "LatestOut": string = "";
}