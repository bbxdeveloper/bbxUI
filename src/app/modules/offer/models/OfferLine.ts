import { TouchBarScrubber } from "electron";
import { IEditable } from "src/assets/model/IEditable";
import { HelperFunctions } from "src/assets/util/HelperFunctions";
import { environment } from "src/environments/environment";
import { InvoiceLine } from "../../invoice/models/InvoiceLine";
import { Product } from "../../product/models/Product";
import { CurrencyCodes } from "../../system/models/CurrencyCode";

export interface OfferLineForPost {
    "lineNumber": number;
    "productCode": string;
    "lineDescription": string;
    "vatRateCode": string;
    "unitPrice": number;
    "unitGross": number;
    "discount": number;
    "unitOfMeasure": string;
    "showDiscount": boolean;
    "quantity": number;
}

export interface OfferLineFullData extends OfferLineForPost {
    "id": number;
    "offerID": number;
    "productID": number;
    "unitOfMeasureX": string;
    "vatRateID": number;
    "vatPercentage": number;
    "quantity": number;
}

export class OfferLine implements IEditable, OfferLineFullData {
    // OfferLineForPost
    "lineNumber": number = 0;
    "productCode": string;
    "productGroup": string;
    "lineDescription": string;
    "originalUnitPrice": number = 0; // readonly
    "discount": number = 0;
    "unitPrice": number = 0;
    "vatRateCode": string;
    "unitVat": number = 0; // unitPrice * vatRate // hidden
    "unitGross": number = 0; // unitPrice + unitVat
    "showDiscount": boolean = true;
    "quantity": number = 0;

    "originalUnitPrice1": number = 0; // L = false
    "originalUnitPrice2": number = 0; // E = true
    "unitPriceSwitch": boolean = true;
    get UnitPriceSwitch(): boolean {
        return this.unitPriceSwitch;
    }
    set UnitPriceSwitch(value: boolean) {
        this.ReCalc(false);
        this.unitPriceSwitch = value;
    }

    get exchangedOriginalUnitPrice(): number {
        return HelperFunctions.Round2(this.originalUnitPrice / this.exchangeRate, 2);
    }
    get exchangedUnitPrice(): number {
        return HelperFunctions.Round2(this.unitPrice / this.exchangeRate, 2);   
    }
    
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

    // Quantity
    get Quantity(): number {
        return this.quantity;
    }
    set Quantity(val: any) {
        this.quantity = val;
    }

    // UnitPriceVal
    get UnitPriceVal(): number {
        return HelperFunctions.Round2(HelperFunctions.ToFloat(this.UnitPrice) * HelperFunctions.ToFloat(this.quantity === 0 ? 1 : this.quantity), 1);
    }

    // UnitGrossVal
    get UnitGrossVal(): number {
        return HelperFunctions.Round(HelperFunctions.ToFloat(this.unitGross) * HelperFunctions.ToFloat(this.quantity === 0 ? 1 : this.quantity) / this.exchangeRate);
    }

    // Discount get set
    set Discount(val: any) {
        if (environment.getterSetterLogs) {
            console.log(`[SETTER Discount]: ${val}`);
        }

        this.discount = val; // HelperFunctions.ToFloat(val.replace(' ', ''))

        let d = (HelperFunctions.ToFloat(this.DiscountForCalc) === 0.0) ? 0.0 : HelperFunctions.ToFloat(this.DiscountForCalc / 100.0);
        let priceWithDiscount = this.originalUnitPrice;
        priceWithDiscount -= this.originalUnitPrice * d;
        this.unitPrice = HelperFunctions.ToFloat(priceWithDiscount);
        this.UnitVat = HelperFunctions.ToFloat(this.unitPrice) * this.vatRate;
    }
    get Discount() {
        // console.log(`[GETTER Discount]: ${this.discount}`);
        return this.discount;
    }
    get DiscountForCalc() {
        // console.log(`[GETTER Discount]: ${this.discount}`);
        return HelperFunctions.ToFloat((this.discount + '').replace(' ', ''));
    }

    // UnitPrice - with applied discount - get set
    set OriginalUnitPrice(val: number) {
        this.originalUnitPrice = val
        this.unitPrice = val
        this.UnitVat = this.UnitPriceForCalc * this.vatRate;
    }
    set UnitPrice(val: number) {
        if (environment.getterSetterLogs) {
            console.log(`[SETTER UnitPrice]: ${val}`);
        }

        this.discount = 0.0;
        this.unitPrice = val;
        this.UnitVat = this.UnitPriceForCalc * this.vatRate;
    }
    get UnitPrice() {
        return this.unitPrice;
    }
    get UnitPriceForCalc() {
        return HelperFunctions.ToFloat((this.unitPrice + '').replace(' ', ''));
    }

    // UnitVat
    set UnitVat(val: number) {
        this.unitVat = val;
        if (environment.getterSetterLogs) {
            console.log(
                `[SETTER UnitVat] Set unitGross, old val: ${this.unitGross}, new val: 
                ${this.unitPrice + this.unitVat}, new unit price: ${this.unitPrice}, calc result: ${this.UnitPriceForCalc + this.unitVat}`);
        }
        this.unitGross = this.UnitPriceForCalc + this.unitVat;
    }
    get UnitVat() {
        return this.unitVat / this.exchangeRate;
    }

    public Round(): void {
        // this.unitVat = HelperFunctions.Round(this.unitVat);
        // this.originalUnitPrice = HelperFunctions.Round(this.originalUnitPrice);
        // this.unitPrice = HelperFunctions.Round(this.unitPrice);
        // this.unitGross = HelperFunctions.Round(this.unitGross);
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
        offerLine.unitPrice = invoiceLine.unitPrice;

        offerLine.quantity = HelperFunctions.ToFloat(invoiceLine.quantity ?? 0);

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

    previousUnitPrice: number = 0;

    currencyCode: string = CurrencyCodes.HUF;
    exchangeRate: number = 1;
    public ReCalc(unitPriceWasUpdated: boolean, currencyCode?: string, exchangeRate?: number): void {
        if (currencyCode === undefined) {
            currencyCode = this.currencyCode;
        } else {
            this.currencyCode = currencyCode;
        }
        if (exchangeRate === undefined) {
            exchangeRate = this.exchangeRate;
        } else {
            this.exchangeRate = exchangeRate;
        }

        switch (currencyCode) {
            case CurrencyCodes.EUR:
            case CurrencyCodes.USD:
                break;
            case CurrencyCodes.HUF:
            default:
                exchangeRate = 1;
                break;
        }

        this.originalUnitPrice = this.unitPriceSwitch ?
            HelperFunctions.Round2(this.originalUnitPrice2 ?? 0, 2) : HelperFunctions.Round2(this.originalUnitPrice1 ?? 0, 2);

        let discountForCalc = (HelperFunctions.ToFloat(this.DiscountForCalc) === 0.0) ? 0.0 : HelperFunctions.ToFloat(this.DiscountForCalc / 100.0);

        let priceWithDiscountExchanged = this.exchangedOriginalUnitPrice;
        priceWithDiscountExchanged -= HelperFunctions.Round2(this.exchangedOriginalUnitPrice * discountForCalc, 2);

        let priceWithDiscount = this.originalUnitPrice;
        priceWithDiscount -= HelperFunctions.Round2(this.originalUnitPrice * discountForCalc, 2);

        console.log(`BEFORE [ReCalc] previousUnitPrice ${this.previousUnitPrice}, exchangeRate ${exchangeRate}, unitPriceWasUpdated = ${unitPriceWasUpdated}, priceWithDiscount ${priceWithDiscountExchanged}, HelperFunctions.Round(priceWithDiscount) ${HelperFunctions.Round(priceWithDiscountExchanged)}, unitPrice ${this.unitPrice}`);
        
        if (unitPriceWasUpdated && priceWithDiscountExchanged !== this.unitPrice) {
            this.unitPrice = HelperFunctions.Round2(this.unitPrice / this.exchangeRate, 2);
            this.discount = 0.0;
        } else {
            this.unitPrice = HelperFunctions.Round2(priceWithDiscountExchanged, 2);
        }

        this.unitVat = HelperFunctions.Round(HelperFunctions.ToFloat(this.unitPrice) * this.vatRate);
        this.unitGross = HelperFunctions.Round2(this.UnitPriceForCalc + this.unitVat, 1);

        this.previousUnitPrice = this.unitPrice;

        console.log(`AFTER [ReCalc] previousUnitPrice ${this.previousUnitPrice}, exchangeRate ${exchangeRate}, unitPriceWasUpdated = ${unitPriceWasUpdated}, priceWithDiscount ${priceWithDiscountExchanged}, HelperFunctions.Round(priceWithDiscount) ${HelperFunctions.Round(priceWithDiscountExchanged)}, unitPrice ${this.unitPrice}`);
    }

    static FromProduct(product: Product, offerId: number = 0, vatRateId: number = 0, unitPriceWasUpdated: boolean, currencyCode: string, exchangeRate: number): OfferLine {
        let offerLine = new OfferLine();

        offerLine.lineDescription = product.description ?? '';
        offerLine.productCode = product.productCode;

        offerLine.vatRateCode = product.vatRateCode;

        offerLine.vatPercentage = HelperFunctions.ToFloat(product.vatPercentage ?? 0.0);
        offerLine.vatRate = product.vatPercentage ?? 10;

        offerLine.UnitVat = product.vatPercentage ?? 0;

        offerLine.originalUnitPrice1 = HelperFunctions.Round2(product.unitPrice1 ?? 0, 2);
        offerLine.originalUnitPrice2 = HelperFunctions.Round2(product.unitPrice2 ?? 0, 2);
        offerLine.OriginalUnitPrice = offerLine.unitPriceSwitch ?
            HelperFunctions.Round2(product.unitPrice2 ?? 0, 2) : HelperFunctions.Round2(product.unitPrice1 ?? 0, 2);

        offerLine.unitOfMeasure = product.unitOfMeasure;
        offerLine.unitOfMeasureX = product.unitOfMeasureX;

        offerLine.id = 0;
        offerLine.offerID = offerId;
        offerLine.productID = product.id;
        offerLine.vatRateID = vatRateId;

        offerLine.productGroup = product.productGroup;

        offerLine.Discount = 0.0;

        offerLine.ReCalc(unitPriceWasUpdated, currencyCode, exchangeRate);

        return offerLine;
    }

    static FromOfferLineFullData(data: OfferLineFullData): OfferLine {
        let offerLine = new OfferLine();

        offerLine.lineNumber = data.lineNumber;
        offerLine.productCode = data.productCode;
        offerLine.lineDescription = data.lineDescription;
        offerLine.vatRateCode = data.vatRateCode;
        offerLine.OriginalUnitPrice = data.unitPrice;
        offerLine.originalUnitPrice1 = data.unitPrice;
        offerLine.originalUnitPrice2 = data.unitPrice;
        offerLine.unitGross = data.unitGross;
        offerLine.Discount = data.discount;
        offerLine.showDiscount = data.showDiscount;
        offerLine.unitOfMeasure = data.unitOfMeasure;

        offerLine.quantity = HelperFunctions.ToFloat(data.quantity ?? 0);

        offerLine.vatRate = 0;
        
        offerLine.id = data.id;
        offerLine.offerID = data.offerID;
        offerLine.productID = data.productID;
        offerLine.unitOfMeasureX = data.unitOfMeasureX;
        offerLine.vatRateID = data.vatRateID;
        offerLine.vatPercentage = data.vatPercentage;

        console.log("[FromOfferLineFullData]: ", offerLine);

        return offerLine;
    }

    public toString(): string {
        return this.productCode;
    }
}