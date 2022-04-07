import { IEditable } from "src/assets/model/IEditable";

export class InvoiceLine implements IEditable {
    // table col order

    "lineNumber": 0; // hidden
    
    "productCode": string = ''; // editable
    "productDescription": string;

    "quantity": number; // editable

    "unitOfMeasure": string;

    "price": number = 0.0; // editable

    "vatRate": string = ''; // hidden
    "vatRateCode": string = ''; // below table
    
    "lineNetAmount": number = 0; // price * quant
    "lineVatAmount": number = 0; // netamount * vat - hidden

    "lineGrossAmount": number = 0; // netamount + vatamount

    IsUnfinished(): boolean {
        return this.productCode.length === 0 || this.quantity === undefined || this.price === undefined ||
               this.lineNetAmount === undefined;
    }
}