import { IEditable } from "src/assets/model/IEditable";
import { MementoObject } from "src/assets/model/MementoObject";
import { HelperFunctions } from "src/assets/util/HelperFunctions";
import { environment } from "src/environments/environment";
import { InvoiceLine } from "../../invoice/models/InvoiceLine";
import { Product } from "../../product/models/Product";
import { CurrencyCodes } from "../../system/models/CurrencyCode";
import { UnitPriceTypes } from "../../customer/models/UnitPriceType";

export interface OfferLineForPost {
    lineNumber: number;
    productCode: string;
    lineDescription: string;
    vatRateCode: string;
    unitPrice: number;
    unitGross: number;
    discount: number;
    unitOfMeasure: string;
    showDiscount: boolean;
    quantity: number;
    originalUnitPrice: number;
    unitPriceSwitch: boolean;
}

export interface OfferLineFullData extends OfferLineForPost {
    id: number;
    offerID: number;
    productID: number;
    unitOfMeasureX: string;
    vatRateID: number;
    vatPercentage: number;
    quantity: number;
    originalUnitPrice: number;
    unitPriceSwitch: boolean;
    unitPrice1: number;
    unitPrice2: number;
}

export class OfferLine extends MementoObject implements IEditable, OfferLineFullData {
    public override DeafultFieldList: string[] = ['productCode'];
    public requiredFields?: string[]

    // OfferLineForPost
    lineNumber: number = 0;
    productCode: string = '';
    productGroup: string = '';
    lineDescription: string = '';
    originalUnitPrice: number = 0; // readonly
    discount: number = 0;
    unitPrice: number = 0;
    vatRateCode: string = '';
    unitVat: number = 0; // unitPrice * vatRate // hidden
    unitGross: number = 0; // unitPrice + unitVat
    showDiscount: boolean = false;
    quantity: number = 0;

    unitPrice1: number = 0;
    unitPrice2: number = 0;

    originalUnitPrice1: number = 0; // L = false
    originalUnitPrice2: number = 0; // E = true
    unitPriceSwitch: boolean = true;

    get UnitPriceSwitch(): boolean {
        return this.unitPriceSwitch;
    }
    set UnitPriceSwitch(value: boolean) {
        if (environment.offerLineLog) console.log("switch: ", value, ", label: ", value ? "E" : "L");
        this.ReCalc(true);
        this.unitPriceSwitch = value;
    }

    get exchangedOriginalUnitPrice(): number {
        return HelperFunctions.Round2(this.originalUnitPrice / this.exchangeRate, 1);
    }

    // Custom
    vatRate: number = 1.0;

    unitOfMeasure: string = '';

    // OfferLineFullData
    id: number = -1;
    offerID: number = -1;
    productID: number = -1;
    unitOfMeasureX: string = "";
    vatRateID: number = -1;
    vatPercentage: number = -1;

    currencyCode: string = CurrencyCodes.HUF;
    exchangeRate: number = 1;

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
        return HelperFunctions.Round(this.UnitPriceVal * (1 + this.vatPercentage));
    }

    // Discount get set
    set Discount(val: any) {
        if (environment.offerLineLog) {
            console.log(`[SETTER Discount]: ${val}`);
        }

        this.discount = val; // HelperFunctions.ToFloat(val.replace(' ', ''))

        let d = (HelperFunctions.ToFloat(this.DiscountForCalc) === 0.0) ? 0.0 : HelperFunctions.ToFloat(this.DiscountForCalc / 100.0);
        let priceWithDiscount = this.originalUnitPrice;
        priceWithDiscount -= this.originalUnitPrice * d;
        this.unitPrice = HelperFunctions.ToFloat(priceWithDiscount);
        this.UnitVat = HelperFunctions.ToFloat(this.unitPrice) * this.vatRate;
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
        if (environment.offerLineLog) {
            console.log(
                `[SETTER UnitVat] Set unitGross, old val: ${this.unitGross}, new val:
                ${this.unitPrice + this.unitVat}, new unit price: ${this.unitPrice}, calc result: ${this.UnitPriceForCalc + this.unitVat}`);
        }
        this.unitGross = this.UnitPriceForCalc + this.unitVat;
    }
    get UnitVat() {
        return this.unitVat / this.exchangeRate;
    }

    constructor(requiredFields?: string[]) {
        super();
        this.SaveDefault();
        if (requiredFields) {
            this.requiredFields = requiredFields;
        }
    }

    IsUnfinished(): boolean {
        if (this.requiredFields) {
            const x = this as any;
            return this.requiredFields.findIndex(fieldName => {
                if (typeof x[fieldName] === 'string') {
                    return HelperFunctions.isEmptyOrSpaces(x[fieldName])
                }
                return x[fieldName] === undefined
            }) > -1
        }
        return HelperFunctions.isEmptyOrSpaces(this.productCode);
    }

    static IsInterfaceUnfinished(o: OfferLineForPost): boolean {
        return HelperFunctions.isEmptyOrSpaces(o.productCode);
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

    private log(message?: any, ...optionalParams: any[]) {
        console.log(message, optionalParams);
    }

    public ReCalc(unitPriceWasUpdated: boolean, currencyCode?: string, exchangeRate?: number): void {
        if (environment.offerLineLog) {
            console.log("....................................................");
            console.log("....................................................");
            console.log("ReCalc");
        }

        if (currencyCode !== undefined) {
            this.currencyCode = this.currencyCode;
        }
        if (exchangeRate !== undefined) {
            this.exchangeRate = HelperFunctions.ToFloat(exchangeRate);
        }

        if (environment.offerLineLog) {
            console.log("currencyCode: ", this.currencyCode);
            console.log("exchangeRate: ", this.exchangeRate);
        }

        this.originalUnitPrice = this.unitPriceSwitch ?
            HelperFunctions.Round2(this.originalUnitPrice2 ?? 0, 2) : HelperFunctions.Round2(this.originalUnitPrice1 ?? 0, 2);

        if (environment.offerLineLog)
            console.log("originalUnitPrice: ", this.originalUnitPrice);

        let discountForCalc = (HelperFunctions.ToFloat(this.DiscountForCalc) === 0.0) ? 0.0 : HelperFunctions.ToFloat(this.DiscountForCalc / 100.0);

        if (environment.offerLineLog)
            console.log("discountForCalc: ", discountForCalc);

        let priceWithDiscount = this.exchangedOriginalUnitPrice;
        priceWithDiscount -= HelperFunctions.ToFloat(this.exchangedOriginalUnitPrice * discountForCalc);
        priceWithDiscount = HelperFunctions.Round2(priceWithDiscount, 1);

        if (environment.offerLineLog) {
            console.log("priceWithDiscount: ", priceWithDiscount);
            console.log(`unitPriceWasUpdated ${unitPriceWasUpdated}, priceWithDiscount ${priceWithDiscount}, this.unitPrice ${this.unitPrice}`);
        }

        if (unitPriceWasUpdated && priceWithDiscount !== this.unitPrice) {
            this.unitPrice = HelperFunctions.Round2(this.unitPrice, 1);
            this.discount = 0.0;
        } else {
            this.unitPrice = HelperFunctions.Round2(priceWithDiscount, 1);
        }

        this.unitVat = this.unitPrice * this.vatRate;

        if (environment.offerLineLog) {
            console.log("unitVat: ", this.unitVat);
            console.log("unitPrice: ", this.unitPrice);
            console.log("vatRate: ", this.vatRate);
        }

        this.unitGross = HelperFunctions.Round2(this.UnitPriceForCalc + this.unitVat, 1);

        if (environment.offerLineLog) {
            // console.log("unitGross no rounding: ", this.UnitPriceForCalc + this.unitVat);
            // console.log("unitGross rounding 2: ", HelperFunctions.Round2(this.UnitPriceForCalc + this.unitVat, 2));
            // console.log("unitGross rounding 1: ", HelperFunctions.Round2(this.UnitPriceForCalc + this.unitVat, 1));
            // console.log("unitGross rounding 1: ", HelperFunctions.ToFloat(HelperFunctions.ToFloat(this.UnitPriceForCalc + this.unitVat).toFixed(1)));
            // console.log("unitGross rounding 1: ", (this.UnitPriceForCalc + this.unitVat).toFixed(1));
            // console.log("unitGross * quantity: ", this.unitGross * this.quantity);
            console.log("unitGross: ", this.unitGross);
            console.log("UnitGrossVal: ", this.UnitGrossVal);

            console.log("....................................................");
            console.log("....................................................");
        }
    }

    static FromProduct(product: Product, offerId: number = 0, vatRateId: number = 0, unitPriceWasUpdated: boolean, currencyCode: string, exchangeRate: number, unitPriceType: UnitPriceTypes|null = null): OfferLine {
        let offerLine = new OfferLine();

        offerLine.lineDescription = product.description ?? '';
        offerLine.productCode = product.productCode;

        offerLine.vatRateCode = product.vatRateCode;

        offerLine.vatPercentage = HelperFunctions.ToFloat(product.vatPercentage ?? 0.0);
        offerLine.vatRate = product.vatPercentage ?? 10;

        offerLine.UnitVat = product.vatPercentage ?? 0;

        if (unitPriceType) {
            offerLine.unitPriceSwitch = unitPriceType === UnitPriceTypes.Unit
        }

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

    static FromOfferLineFullData(data: OfferLineFullData, currencyCode: string, exchangeRate: number): OfferLine {
        if (environment.offerLineLog)
            console.log("\n\n[FromOfferLineFullData] stard, ID: ", data.id);

        let offerLine = new OfferLine();

        if (environment.offerLineLog)
            console.log("[FromOfferLineFullData] data: ", data, ", blank offerline: ", offerLine);

        offerLine.currencyCode = currencyCode;
        offerLine.exchangeRate = HelperFunctions.ToFloat(exchangeRate);

        offerLine.originalUnitPrice1 = HelperFunctions.ToFloat(data.unitPrice1);
        offerLine.originalUnitPrice2 = HelperFunctions.ToFloat(data.unitPrice2);

        offerLine.lineNumber = data.lineNumber;
        offerLine.productCode = data.productCode;
        offerLine.lineDescription = data.lineDescription;
        offerLine.vatRateCode = data.vatRateCode;
        offerLine.originalUnitPrice = offerLine.unitPriceSwitch ?
            HelperFunctions.Round2(offerLine.originalUnitPrice2 ?? 0, 2) : HelperFunctions.Round2(offerLine.originalUnitPrice1 ?? 0, 2);
        offerLine.unitGross = data.unitGross;
        offerLine.showDiscount = data.showDiscount;
        offerLine.unitOfMeasure = data.unitOfMeasure;

        offerLine.quantity = HelperFunctions.ToFloat(data.quantity ?? 0);

        offerLine.vatRate = data.vatPercentage;

        offerLine.id = data.id;
        offerLine.offerID = data.offerID;
        offerLine.productID = data.productID;
        offerLine.unitOfMeasureX = data.unitOfMeasureX;
        offerLine.vatRateID = data.vatRateID;
        offerLine.vatPercentage = data.vatPercentage;

        offerLine.UnitPriceSwitch = data.unitPriceSwitch;

        offerLine.discount = data.discount;

        offerLine.unitPrice = HelperFunctions.ToFloat(data.unitPrice);

        if (environment.offerLineLog)
            console.log("[FromOfferLineFullData] offerLine: ", offerLine);

        offerLine.ReCalc(true);

        if (environment.offerLineLog)
            console.log("[FromOfferLineFullData] end, after ReCalc offerLine: ", offerLine, "\n\n");

        return offerLine;
    }

    public override toString(): string {
        return this.productCode;
    }
}