import { IEditable } from "src/assets/model/IEditable";
import { HelperFunctions } from "src/assets/util/HelperFunctions";
import { Product } from "../../product/models/Product";

export interface InvCtrlItemForPost {
    "warehouseID": number;
    "invCtlPeriodID": number;
    "productID": number;
    "invCtrlDate": string;
    "nRealQty": number;
    "userID": number;
}

export interface InvCtrlItemForGet {
    "invCtrlType": string;
    "invCtrlTypeX": string;
    "id": number;
    "warehouseID": number;
    "warehouse": string;
    "invCtlPeriodID": number;
    "invCtlPeriod"?: any;
    "productID": number;
    "productCode": string;
    "product": string;
    "invCtrlDate": string;
    "oCalcQty": number;
    "oRealQty": number;
    "nCalcQty": number;
    "nRealQty": number;
    "avgCost": number;
    "userID": number;
}

export class InvCtrlItemLine implements IEditable, InvCtrlItemForPost {
    // OfferLineForPost
    "lineNumber": number = 0;
    "productCode": string;
    "lineDescription": string;
    "originalUnitPrice": number = 0; // readonly
    "discount": number = 0;
    "unitPrice": number = 0;
    "vatRateCode": string;
    "unitVat": number = 0; // unitPrice * vatRate // hidden
    "unitGross": number = 0; // unitPrice + unitVat
    "showDiscount": boolean = true;

    // Custom
    "vatRate": number = 1.0;

    "unitOfMeasure": string;

    // OfferLineFullData
    "id": number = -1;
    "offerID": number = -1;
    "unitOfMeasureX": string = "";
    "vatRateID": number = -1;
    "vatPercentage": number = -1;






    "warehouseID": number = 0;
    "invCtlPeriodID": number = 0;
    "productID": number = 0;
    "invCtrlDate": string = "";
    "realQty": number = 0;
    "nRealQty": number = 0;
    "userID": number = 0;

    get NRealQty(): number {
        return this.realQty ?? 0;
    }

    get RealQty(): number {
        return this.nRealQty ?? 0;
    }

    get difference(): number {
        return Math.abs(this.NRealQty - this.RealQty);
    }

    static FromProduct(product: Product, offerId: number = 0, vatRateId: number = 0, price: number = 0): InvCtrlItemLine {
        let offerLine = new InvCtrlItemLine();

        offerLine.lineDescription = product.description ?? '';
        offerLine.productCode = product.productCode;

        offerLine.vatRateCode = product.vatRateCode;
        //offerLine.UnitVat = product.vatPercentage ?? 0;

        //offerLine.OriginalUnitPrice = product.unitPrice1 ?? product.unitPrice2 ?? 0;
        offerLine.originalUnitPrice = price;
        offerLine.unitPrice = price;

        offerLine.vatRate = product.vatPercentage ?? 10;

        offerLine.unitOfMeasure = product.unitOfMeasure;
        offerLine.unitOfMeasureX = product.unitOfMeasureX;

        offerLine.id = 0;
        offerLine.offerID = offerId;
        offerLine.productID = product.id;
        offerLine.vatRateID = vatRateId;
        offerLine.vatPercentage = HelperFunctions.ToFloat(product.vatPercentage ?? 0.0);

        console.log('FromProduct res: ', offerLine);

        return offerLine;
    }

    IsUnfinished(): boolean {
        return this.warehouseID === undefined || this.invCtlPeriodID === undefined || this.productID === undefined
            || this.invCtrlDate === undefined || this.nRealQty === undefined || this.userID === undefined;
    }

    public Round(): void {
        this.unitVat = HelperFunctions.Round(this.unitVat);
        this.originalUnitPrice = HelperFunctions.Round(this.originalUnitPrice);
        this.unitPrice = HelperFunctions.Round(this.unitPrice);
        this.unitGross = HelperFunctions.Round(this.unitGross);
    }
}