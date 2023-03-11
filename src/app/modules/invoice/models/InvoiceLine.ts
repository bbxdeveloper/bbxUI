import { IEditable } from "src/assets/model/IEditable";
import { MementoObject } from "src/assets/model/MementoObject";
import { JsonIgnore } from "src/assets/model/navigation/DynamicObject";
import { HelperFunctions } from "src/assets/util/HelperFunctions";
import { Price } from "src/assets/util/Price";

/**
 * Invoivceline model for sending data to the backend
 * Used within: @see CreateOutgoingInvoiceRequest<InvoiceLineForPost>
 */
export interface InvoiceLineForPost {
    // table col order
    lineNumber: number; // hidden
    productCode: string; // editable
    productDescription: string;
    quantity: number; // editable
    unitOfMeasure: string;
    unitPrice: number; // editable
    vatRateCode: string; // below table
    vatRate?: number;
    lineNetAmount: number; // price * quant
    relDeliveryNoteInvoiceLineID?: number
}

export function GetBlankInvoiceLineForPost(): InvoiceLineForPost {
    return {
        lineNumber: 0,
        productCode: '',
        productDescription: "",
        quantity: 0.0,
        unitOfMeasure: "",
        unitPrice: 0.0,
        vatRateCode: '',
        lineNetAmount: 0.0
    } as InvoiceLineForPost;
}

/**
 * Price data for invocielines.
 */
export class InvoiceLinePriceData {
    quantity: number = 0.0; // editable

    unitPrice: number = 0.0; // editable

    vatRateCode: string = ''; // below table

    lineNetAmount: number = 0.0; // price * quant

    lineGrossAmount: number = 0.0; // netamount + vatamount
    lineVatAmount: number = 0.0; // netamount * vat - hidden

    vatRate: number = 1; // hidden

    discount: number = 0;
}

/**
 * Invoiceline class for handling grids, calculations, conversions...
 */
export class InvoiceLine extends MementoObject implements InvoiceLineForPost, IEditable {
    @JsonIgnore
    public override DeafultFieldList: string[] = ['productCode'];

    lineNumber: number = 0; // hidden

    productCode: string = ''; // editable
    productDescription: string = "";

    quantity: number = 0.0; // editable

    unitOfMeasure: string = "";

    unitPrice: number = 0.0; // editable

    vatRateCode: string = ''; // below table

    @JsonIgnore
    lineNetAmount: number = 0.0; // price * quant

    @JsonIgnore
    lineGrossAmount: number = 0.0; // netamount + vatamount

    @JsonIgnore
    lineVatAmount: number = 0.0; // netamount * vat - hidden

    @JsonIgnore
    custDiscounted: boolean = false;

    @JsonIgnore
    noDiscount: boolean = false;

    @JsonIgnore
    discount: number = 0;

    vatRate: number = 1; // hidden

    @JsonIgnore
    unitOfMeasureX?: string;

    relDeliveryNoteInvoiceLineID: number = 0

    @JsonIgnore
    workNumber: string = ''

    /**
     * Discounts are only used in the save dialog, so we keep this data separately.
     */
    @JsonIgnore
    discountedData?: InvoiceLinePriceData;

    @JsonIgnore
    invoiceNumber?: string;

    @JsonIgnore
    unitPriceDiscounted: number = 0

    //#region Gyűjtő számla
    @JsonIgnore
    limit: number = 0

    @JsonIgnore
    public get rowDiscountedNetPrice(): number {
        return this.unitPriceDiscounted * this.quantity
    }

    @JsonIgnore
    public get rowNetPrice(): number {
        return this.unitPrice * this.quantity;
    }

    @JsonIgnore
    public get rowDiscountValue(): number {
        return this.rowNetPrice - this.rowDiscountedNetPrice;
    }

    @JsonIgnore
    public get rowGrossPrice(): number {
        return Price.gross(this.rowNetPrice, this.vatRate)
    }

    @JsonIgnore
    public get rowDiscountedGrossPrice(): number {
        return Price.gross(this.rowDiscountedNetPrice, this.vatRate)
    }

    @JsonIgnore
    public get rowNetPriceRounded(): number {
        return HelperFunctions.Round2(this.rowDiscountedNetPrice, 1);
    }

    @JsonIgnore
    public get rowGrossPriceRounded(): number {
        return HelperFunctions.Round2(this.rowGrossPrice, 0);
    }
    //#endregion Gyűjtő számla

    constructor() {
        super();
        this.SaveDefault();
    }

    IsUnfinished(): boolean {
        return this.productCode?.length === 0 || this.productDescription?.length === 0 ||
            this.quantity === undefined || this.unitPrice === undefined;
    }

    public override toString(): string {
        return this.productCode;
    }

    /**
     * Calculates - and returns - the price data of invoieline without modifying the target object.
     * Ignores @see this.discount if @see this.noDiscount is true.
     * @returns InvoiceLinePriceData
     */
    public GetDiscountedCalcResult(): InvoiceLinePriceData {
        let result = new InvoiceLinePriceData();

        result.discount = this.noDiscount ? 0 : HelperFunctions.ToFloat(this.discount);

        result.unitPrice = HelperFunctions.ToFloat(this.unitPrice - this.unitPrice * result.discount);

        result.quantity = HelperFunctions.ToFloat(this.quantity);
        result.vatRate = HelperFunctions.ToFloat(this.vatRate);

        result.unitPrice = HelperFunctions.Round2(HelperFunctions.ToFloat(result.unitPrice), 2);

        result.lineNetAmount = HelperFunctions.Round2(result.unitPrice * result.quantity, 1);
        result.lineVatAmount = HelperFunctions.Round2(result.lineNetAmount * result.vatRate, 1);
        result.lineGrossAmount = result.lineVatAmount + result.lineNetAmount;

        this.discountedData = result;

        return result;
    }

    /**
     * Calcs price related values based mainly on @see this.unitPrice, @see this.quantity, @see this.vatRate
     * Ignores: @see this.discount
     */
    public ReCalc(): void {
        // console.log("");
        // console.log("==========================");
        // console.log("[InvoiceLine ReCalc]");
        // console.log("BEFORE");
        // console.log("unitPrice: " + this.unitPrice);
        // console.log("lineNetAmount: " + this.lineNetAmount);
        // console.log("vatRate: " + this.vatRate);
        // console.log("lineVatAmount: " + this.lineVatAmount);
        // console.log("lineGrossAmount: " + this.lineGrossAmount);
        // console.log("==========================");

        this.unitPrice = HelperFunctions.ToFloat(this.unitPrice);
        this.quantity = HelperFunctions.ToFloat(this.quantity);
        this.vatRate = HelperFunctions.ToFloat(this.vatRate);

        this.unitPrice = HelperFunctions.Round2(HelperFunctions.ToFloat(this.unitPrice), 2);

        this.lineNetAmount = HelperFunctions.Round2(this.unitPrice * this.quantity, 1);
        this.lineVatAmount = HelperFunctions.Round2(this.lineNetAmount * this.vatRate, 1);
        this.lineGrossAmount = this.lineVatAmount + this.lineNetAmount;

        // console.log("AFTER");
        // console.log("unitPrice: " + this.unitPrice);
        // console.log("lineNetAmount: " + this.lineNetAmount);
        // console.log("vatRate: " + this.vatRate);
        // console.log("lineVatAmount: " + this.lineVatAmount);
        // console.log("lineGrossAmount: " + this.lineGrossAmount);
        // console.log("==========================");
        // console.log("");
    }

    /**
     * Converts into the backend model
     * @returns
     */
    public GetPOSTData(needVatRate = true): InvoiceLineForPost {
        let res = {
            lineNetAmount: HelperFunctions.ToFloat(this.lineNetAmount),
            lineNumber: this.lineNumber,
            quantity: this.quantity,
            productCode: this.productCode,
            productDescription: this.productDescription,
            unitOfMeasure: this.unitOfMeasure,
            unitPrice: HelperFunctions.ToFloat(this.unitPrice),
            vatRateCode: this.vatRateCode,
            relDeliveryNoteInvoiceLineID: this.relDeliveryNoteInvoiceLineID
        } as InvoiceLineForPost;

        if (needVatRate) {
            res.vatRate = this.vatRate
        }
        else {
            res.vatRate = undefined
        }

        return res;
    }
}