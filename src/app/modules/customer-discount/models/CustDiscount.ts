import { IEditable } from "src/assets/model/IEditable";
import { MementoObject } from "src/assets/model/MementoObject";
import { HelperFunctions } from "src/assets/util/HelperFunctions";

export interface CustDiscountForPost {
    customerID: number;
    items: CustDiscountForPostItem[];
}

export interface CustDiscountForPostItem {
    productGroupID: number;
    discount: number;
}

export interface CustDiscountForGet {
    "customerID": number,
    "customer": string,
    "productGroupID": number,
    "productGroupCode": string,
    "productGroup": string,
    "discount": number
}

export class CustDiscount extends MementoObject implements IEditable, CustDiscountForPostItem, CustDiscountForGet {
    public override DeafultFieldList: string[] = ['productGroupCode'];

    "customerID": number = -1;
    "productGroupID": number = -1;
    "productGroupCode": string;
    "discount": number = 0;
    "customer": any;
    "productGroup": string;
    "id": number = 0;
    "createTime": string = "";
    "updateTime": string = "";
    "deleted": boolean = false;

    get Discount(): number {
        return this.discount === Number.MIN_SAFE_INTEGER ? 0 : this.discount;
    }
    set Discount(val: number) {
        this.discount = val;
    }

    get ProductGroup(): string {
        return this.productGroup;
    }
    set ProductGroup(val: string) {
        this.productGroup = val;
    }

    get ProductGroupCode(): string {
        return this.productGroupCode;
    }
    set ProductGroupCode(val: string) {
        this.productGroupCode = val;
    }

    constructor() {
        super();
        this.SaveDefault();
    }

    Round() {
        this.discount = HelperFunctions.Round(this.discount);
    }

    IsUnfinished(): boolean {
        return !HelperFunctions.IsStringValid(this.productGroupCode);
    }

    ToCustDiscountForPostItem(): CustDiscountForPostItem {
        return {
            discount: HelperFunctions.ToFloat(this.Discount),
            productGroupID: HelperFunctions.ToInt(this.productGroupID)
        } as CustDiscountForPostItem;
    }

    public override toString(): string {
        return this.productGroupCode;
    }
}

export function CustDiscountFromCustDiscountForGet(item: CustDiscountForGet): CustDiscount {
    let res = new CustDiscount();

    res.customerID = item.customerID;
    res.customer = item.customer;
    res.productGroupID = item.productGroupID;
    res.productGroupCode = item.productGroupCode;
    res.productGroup = item.productGroup;
    res.discount = item.discount;

    return res;
}

export function CustDiscountFromCustDiscountForPostItem(item: CustDiscountForPostItem, customerId: number): CustDiscount {
    let res = new CustDiscount();

    res.customerID = customerId;
    res.productGroupID = item.productGroupID;
    res.discount = item.discount;

    return res;
}