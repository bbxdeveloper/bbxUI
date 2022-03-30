import { IEditable } from "src/assets/model/IEditable";

export class InvoiceLine implements IEditable {
    "productCode": string = '';
    
    "vatRateCode": string = '';
    
    "quantity": number = 0;
    
    "price": number = 0;
    
    "lineNetAmount": number = 0;
    "lineVatAmount": number = 0;

    IsUnfinished(): boolean {
        return this.productCode.length === 0 || this.quantity === undefined || this.price === undefined ||
               this.lineNetAmount === undefined;
    }
    
}