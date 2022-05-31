import { IEditable } from "src/assets/model/IEditable";
import { HelperFunctions } from "src/assets/util/HelperFunctions";
import { InvoiceLine } from "../../invoice/models/InvoiceLine";
import { Product } from "../../product/models/Product";

export interface OfferLineForPost {
    "lineNumber": number;
    "productCode": string;
    "lineDescription": string;
    "vatRateCode": string;
    "unitPrice": number;
    "unitVat": number;
    "unitGross": number;
    "discount": number;
    "unitOfMeasure": string;
    "showDiscount": boolean;
}

export interface OfferLineFullData extends OfferLineForPost {
    "id": number;
    "offerID": number;
    "productID": number;
    "unitOfMeasureX": string;
    "vatRateID": number;
    "vatPercentage": number;
}

export class OfferLine implements IEditable, OfferLineFullData {
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
    "productID": number = -1;
    "unitOfMeasureX": string = "";
    "vatRateID": number = -1;
    "vatPercentage": number = -1;

    // Discount get set
    set Discount(val: number) {
        this.discount = val;

        let d = this.discount === 0 ? 0.0 : this.discount / 100.0;
        let priceWithDiscount = this.originalUnitPrice;
        priceWithDiscount -= this.originalUnitPrice * d;
        this.unitPrice += priceWithDiscount;
    }
    get Discount() {
        return this.discount;
    }

    // UnitPrice - with applied discount - get set
    set OriginalUnitPrice(val: number) {
        this.originalUnitPrice = val
        this.unitPrice = val
    }
    set UnitPrice(val: number) {
        this.discount = 0.0;
        this.unitPrice = val;
        this.UnitVat = this.unitPrice * this.vatRate;
    }
    get UnitPrice() {
        return this.unitPrice;
    }

    // UnitVat
    set UnitVat(val: number) {
        this.unitVat = val;
        this.unitGross = this.unitPrice + this.unitVat;
    }
    get UnitVat() {
        return this.unitVat;
    }

    get unitPriceWithDiscount(): number {
        let discount = this.discount === 0 ? 0.0 : this.discount / 100.0;
        let priceWithDiscount = this.unitPrice;
        priceWithDiscount -= this.unitPrice * discount;
        return priceWithDiscount;
    }

    get unitGrossWithDiscount(): number {
        let discount = this.discount === 0 ? 0.0 : this.discount / 100.0;
        
        let priceWithDiscount = this.unitPrice;
        priceWithDiscount -= this.unitPrice * discount;
        priceWithDiscount = priceWithDiscount === 0 ? 1 : priceWithDiscount;
        
        var vat = this.vatRate ?? 1.0;

        return priceWithDiscount + (vat * priceWithDiscount);
    }

    IsUnfinished(): boolean {
        return this.productCode === undefined || this.productCode?.length === 0 || this.lineDescription?.length === 0;
    }

    static IsInterfaceUnfinished(o: OfferLineForPost): boolean {
        return o.productCode === undefined || o.productCode?.length === 0 || o.lineDescription?.length === 0;
    }

    static FromInvoiceLine(invoiceLine: InvoiceLine): OfferLine {
        let offerLine = new OfferLine();

        offerLine.lineDescription = invoiceLine.productDescription;
        offerLine.productCode = invoiceLine.productCode;

        offerLine.unitGross = invoiceLine.lineGrossAmount;
        offerLine.vatRateCode = invoiceLine.vatRateCode;
        offerLine.UnitVat = invoiceLine.lineVatAmount;
        offerLine.unitPrice = invoiceLine.price;

        /*
        productCode: x.data.productCode,
        lineDescription: x.data.productDescription,
        vatRateCode: x.data.vatRateCode,
        unitPrice: this.ToFloat(x.data.price),
        unitVat: this.ToFloat(x.data.lineVatAmount),
        unitGross: this.ToFloat(x.data.quantity * x.data.price)
        */

        return offerLine;
    }

    static FromProduct(product: Product): OfferLine {
        let offerLine = new OfferLine();

        offerLine.lineDescription = product.description ?? '';
        offerLine.productCode = product.productCode;

        offerLine.vatRateCode = product.vatRateCode;
        offerLine.UnitVat = product.vatPercentage ?? 0;

        offerLine.OriginalUnitPrice = product.unitPrice1 ?? product.unitPrice2 ?? 0;

        offerLine.vatRate = product.vatPercentage ?? 10;

        offerLine.unitOfMeasure = product.unitOfMeasure;
        offerLine.unitOfMeasureX = product.unitOfMeasureX;

        console.log('FromProduct res: ', offerLine);

        return offerLine;
    }

    static FromOfferLineFullData(data: OfferLineFullData): OfferLine {
        let offerLine = new OfferLine();

        offerLine.lineNumber = data.lineNumber;
        offerLine.productCode = data.productCode;
        offerLine.lineDescription = data.lineDescription;
        offerLine.vatRateCode = data.vatRateCode;
        offerLine.UnitPrice = data.unitPrice;
        offerLine.UnitVat = data.unitVat;
        offerLine.unitGross = data.unitGross;
        offerLine.Discount = data.discount;
        offerLine.showDiscount = data.showDiscount;
        offerLine.unitOfMeasure = data.unitOfMeasure;

        offerLine.vatRate = 0;
        
        offerLine.id = data.id;
        offerLine.offerID = data.offerID;
        offerLine.productID = data.productID;
        offerLine.unitOfMeasureX = data.unitOfMeasureX;
        offerLine.vatRateID = data.vatRateID;
        offerLine.vatPercentage = data.vatPercentage;

        return offerLine;
    }
}