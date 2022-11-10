import { IEditable } from "src/assets/model/IEditable";
import { HelperFunctions } from "src/assets/util/HelperFunctions";

export class InvoiceLineForPost {
    // table col order
    lineNumber: number = 0; // hidden

    productCode: string = ''; // editable
    productDescription: string = "";

    quantity: number = 0.0; // editable

    unitOfMeasure: string = "";

    unitPrice: number = 0.0; // editable

    vatRateCode: string = ''; // below table

    lineNetAmount: number = 0.0; // price * quant
}

export class InvoiceLine extends InvoiceLineForPost implements IEditable {
    lineGrossAmount: number = 0.0; // netamount + vatamount
    lineVatAmount: number = 0.0; // netamount * vat - hidden

    vatRate: number = 1; // hidden

    unitOfMeasureX?: string;

    IsUnfinished(): boolean {
        return this.productCode?.length === 0 || this.productDescription?.length === 0 ||
            this.quantity === undefined || this.unitPrice === undefined;
    }

    public override toString(): string {
        return this.productCode;
    }

    public ReCalc(): void {
        console.log("");
        console.log("==========================");
        console.log("[InvoiceLine ReCalc]");
        console.log("BEFORE");
        console.log("unitPrice: " + this.unitPrice);
        console.log("lineNetAmount: " + this.lineNetAmount);
        console.log("vatRate: " + this.vatRate);
        console.log("lineVatAmount: " + this.lineVatAmount);
        console.log("lineGrossAmount: " + this.lineGrossAmount);
        console.log("==========================");

        this.unitPrice = HelperFunctions.Round2(this.unitPrice, 2);

        this.lineNetAmount = HelperFunctions.Round2(this.unitPrice * this.quantity, 1);
        this.lineVatAmount = HelperFunctions.Round2(this.lineNetAmount * this.vatRate, 1);
        this.lineGrossAmount = this.lineVatAmount + this.lineNetAmount;

        console.log("AFTER");
        console.log("unitPrice: " + this.unitPrice);
        console.log("lineNetAmount: " + this.lineNetAmount);
        console.log("vatRate: " + this.vatRate);
        console.log("lineVatAmount: " + this.lineVatAmount);
        console.log("lineGrossAmount: " + this.lineGrossAmount);
        console.log("==========================");
        console.log("");
    }

    public GetPOSTData(): InvoiceLineForPost {
        let res = {
            lineNetAmount: this.lineNetAmount,
            lineNumber: this.lineNumber,
            quantity: this.quantity,
            productCode: this.productCode,
            productDescription: this.productDescription,
            unitOfMeasure: this.unitOfMeasure,
            unitPrice: this.unitPrice,
            vatRate: this.vatRate,
            vatRateCode: this.vatRateCode
        } as InvoiceLineForPost;

        return res;
    }
}