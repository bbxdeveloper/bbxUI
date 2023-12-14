import { IEditable } from "src/assets/model/IEditable"
import { MementoObject } from "src/assets/model/MementoObject"
import { DynamicObject, JsonIgnore } from "src/assets/model/navigation/DynamicObject";
import { HelperFunctions } from "src/assets/util/HelperFunctions";

export class InvPayment extends DynamicObject {
    "invPaymentItems": InvPaymentItem[]
}

export interface InvPaymentItemFull {
    "invoiceID": number
    "invoiceNumber": string
    "paymentDate": string
    "customerID": number
    "customerName": string
    "bankTransaction": string
    "invPaymentDate": string
    "currencyCode": string
    "currencyCodeX": string
    "exchangeRate": number
    "invPaymentAmount": number
    "invPaymentAmountHUF": number
    "userID": number
    "userName": string
}

export class InvPaymentItem extends MementoObject implements IEditable {
    @JsonIgnore
    public override DeafultFieldList: string[] = ['invoiceNumber'];
    @JsonIgnore
    public requiredFields?: string[]

    invoiceNumber: string = ''
    bankTransaction: string = ''
    invPaymentDate: string = ''
    currencyCode: string = ''
    exchangeRate: number = 0
    invPaymentAmount: number = 0
    userID: number = 0

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
        return HelperFunctions.isEmptyOrSpaces(this.invoiceNumber)
            || HelperFunctions.isEmptyOrSpaces(this.bankTransaction)
            || HelperFunctions.isEmptyOrSpaces(this.invPaymentDate)
            || HelperFunctions.isEmptyOrSpaces(this.currencyCode)
            || this.exchangeRate === 0
    }
}

