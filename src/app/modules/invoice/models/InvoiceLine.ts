import { IEditable } from "src/assets/model/IEditable";
import { MementoObject } from "src/assets/model/MementoObject";
import { HelperFunctions } from "src/assets/util/HelperFunctions";

export interface InvoiceLineForPost {
    // table col order
    lineNumber: number; // hidden
    productCode: string; // editable
    productDescription: string;
    quantity: number; // editable
    unitOfMeasure: string;
    unitPrice: number; // editable
    vatRateCode: string; // below table
    lineNetAmount: number; // price * quant
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

export class InvoiceLine extends MementoObject implements InvoiceLineForPost, IEditable {
    public override DeafultFieldList: string[] = ['productCode'];

    lineNumber: number = 0; // hidden

    productCode: string = ''; // editable
    productDescription: string = "";

    quantity: number = 0.0; // editable

    unitOfMeasure: string = "";

    unitPrice: number = 0.0; // editable

    vatRateCode: string = ''; // below table

    lineNetAmount: number = 0.0; // price * quant

    lineGrossAmount: number = 0.0; // netamount + vatamount
    lineVatAmount: number = 0.0; // netamount * vat - hidden

    custDiscounted: boolean = false;

    vatRate: number = 1; // hidden

    unitOfMeasureX?: string;

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

    public GetPOSTData(): InvoiceLineForPost {
        let res = {
            lineNetAmount: HelperFunctions.ToFloat(this.lineNetAmount),
            lineNumber: this.lineNumber,
            quantity: this.quantity,
            productCode: this.productCode,
            productDescription: this.productDescription,
            unitOfMeasure: this.unitOfMeasure,
            unitPrice: HelperFunctions.ToFloat(this.unitPrice),
            vatRate: this.vatRate,
            vatRateCode: this.vatRateCode
        } as InvoiceLineForPost;

        return res;
    }
}