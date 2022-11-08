import { IEditable } from "src/assets/model/IEditable";
import { HelperFunctions } from "src/assets/util/HelperFunctions";

export class InvoiceLine implements IEditable {
    // table col order

    lineNumber: number = 0; // hidden
    
    productCode: string = ''; // editable
    productDescription: string = "";

    quantity: number = 0.0; // editable

    unitOfMeasure: string = "";
    unitOfMeasureX?: string;

    unitPrice: number = 0.0; // editable

    vatRate: number = 1; // hidden
    vatRateCode: string = ''; // below table
    
    lineNetAmount: number = 0.0; // price * quant
    lineVatAmount: number = 0.0; // netamount * vat - hidden

    lineGrossAmount: number = 0.0; // netamount + vatamount

    IsUnfinished(): boolean {
        return this.productCode?.length === 0 || this.productDescription?.length === 0 ||
            this.quantity === undefined || this.unitPrice === undefined;
    }

    public toString(): string {
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

        this.lineNetAmount = this.unitPrice * this.quantity;
        this.lineVatAmount = this.lineNetAmount * this.vatRate;
        this.lineGrossAmount = HelperFunctions.Round(this.lineVatAmount + this.lineNetAmount);

        console.log("AFTER");
        console.log("unitPrice: " + this.unitPrice);
        console.log("lineNetAmount: " + this.lineNetAmount);
        console.log("vatRate: " + this.vatRate);
        console.log("lineVatAmount: " + this.lineVatAmount);
        console.log("lineGrossAmount: " + this.lineGrossAmount);
        console.log("==========================");
        console.log("");
    }
}