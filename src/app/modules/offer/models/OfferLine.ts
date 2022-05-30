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
    "lineNetAmount": number = 1.0; // price * quant
    "lineVatAmount": number = 1.0; // netamount * vat - hidden
    
    "quantity": number = 0.0;
    "unitOfMeasure": string;

    // OfferLineFullData
    "id": number = -1;
    "offerID": number = -1;
    "productID": number = -1;
    "unitOfMeasureX": string = "";
    "vatRateID": number = -1;
    "vatPercentage": number = -1;

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
        
        var vat = this.lineVatAmount ?? 1.0;

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
        offerLine.unitVat = invoiceLine.lineVatAmount;
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
        offerLine.unitVat = product.vatPercentage ?? 0;

        offerLine.unitPrice = product.unitPrice1 ?? product.unitPrice2 ?? 0;

        offerLine.quantity = 0;

        offerLine.lineVatAmount = product.vatPercentage ?? 10;
        offerLine.lineNetAmount = 
            HelperFunctions.ToFloat(offerLine.quantity) * HelperFunctions.ToFloat(offerLine.unitPrice);
        offerLine.unitGross = offerLine.lineVatAmount * offerLine.lineNetAmount;

        offerLine.unitOfMeasure = product.unitOfMeasure;
        offerLine.unitOfMeasureX = product.unitOfMeasureX;

        console.log('FromProduct res: ', offerLine);

        return offerLine;
    }

    static FromOfferLineFullData(data: OfferLineFullData): OfferLine {
        let offerLine = new OfferLine();

        // Object.keys(this).forEach((x: string) => {
        //     offerLine[x as keyof OfferLine] = data[x];
        // });

        offerLine.lineNumber = data.lineNumber;
        offerLine.productCode = data.productCode;
        offerLine.lineDescription = data.lineDescription;
        offerLine.vatRateCode = data.vatRateCode;
        offerLine.unitPrice = data.unitPrice;
        offerLine.unitVat = data.unitVat;
        offerLine.unitGross = data.unitGross;
        offerLine.discount = data.discount;
        offerLine.showDiscount = data.showDiscount;
        offerLine.unitOfMeasure = data.unitOfMeasure;

        offerLine.lineNetAmount = 0;
        offerLine.lineVatAmount = 0;
        offerLine.quantity = 0;
        
        offerLine.id = data.id;
        offerLine.offerID = data.offerID;
        offerLine.productID = data.productID;
        offerLine.unitOfMeasureX = data.unitOfMeasureX;
        offerLine.vatRateID = data.vatRateID;
        offerLine.vatPercentage = data.vatPercentage;

        return offerLine;
    }
}