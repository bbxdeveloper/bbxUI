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

export class OfferLine implements IEditable, OfferLineForPost {
    "lineNumber": number = 0;
    "productCode": string;
    "lineDescription": string;
    "vatRateCode": string;
    "unitPrice": number = 0;
    "unitVat": number = 0;
    "unitGross": number = 0;
    "discount": number = 0;
    "showDiscount": boolean = true;
    
    "lineNetAmount": number = 1.0; // price * quant
    "lineVatAmount": number = 1.0; // netamount * vat - hidden
    
    "quantity": number = 0.0;
    "unitOfMeasure": string;
    "unitOfMeasureX"?: string;

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

        return vat * priceWithDiscount * this.quantity;
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
}