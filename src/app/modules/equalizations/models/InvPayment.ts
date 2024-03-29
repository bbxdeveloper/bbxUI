import { IEditable } from "src/assets/model/IEditable"
import { MementoObject } from "src/assets/model/MementoObject"
import { DynamicObject, JsonIgnore } from "src/assets/model/navigation/DynamicObject"
import { HelperFunctions } from "src/assets/util/HelperFunctions"

export interface InvPayment {
    invPaymentItems: InvPaymentItemPost[]
}

export interface InvPaymentItemPost {
    invoiceNumber: string
    bankTransaction: string
    invPaymentDate: string
    currencyCode: string
    exchangeRate: number
    invPaymentAmount: number
    userID: number
}

export interface InvPaymentItemFull extends InvPaymentItemPost {
    invoiceID: number
    invoiceNumber: string
    paymentDate: string
    customerID: number
    customerName: string
    bankTransaction: string
    invPaymentDate: string
    currencyCode: string
    currencyCodeX: string
    exchangeRate: number
    invPaymentAmount: number
    invPaymentAmountHUF: number
    payableAmount: number
    payableAmountHUF: number
    invoicePaidAmount: number
    invoicePaidAmountHUF: number
    userID: number
    userName: string
    invoiceGrossAmount: number
    invoiceGrossAmountHUF: number
}

export class InvPaymentItem extends MementoObject implements IEditable, InvPaymentItemFull {
    @JsonIgnore
    public override DeafultFieldList: string[] = ['invoiceNumber'];
    @JsonIgnore
    public requiredFields?: string[]

    // POST
    invoiceNumber: string = ''
    bankTransaction: string = ''
    invPaymentDate: string = ''
    currencyCode: string = ''
    exchangeRate: number = 0
    invPaymentAmount: number = 0
    userID: number = 0

    // GET, TABLE...
    @JsonIgnore
    invoiceID: number = 0
    @JsonIgnore
    paymentDate: string = ''
    @JsonIgnore
    customerID: number = 0
    @JsonIgnore
    customerName: string = ''
    @JsonIgnore
    currencyCodeX: string = ''
    @JsonIgnore
    invPaymentAmountHUF: number = 0
    @JsonIgnore
    userName: string = ''
    @JsonIgnore
    payableAmount: number = 0
    @JsonIgnore
    payableAmountHUF: number = 0
    @JsonIgnore
    invoicePaidAmount: number = 0
    @JsonIgnore
    invoicePaidAmountHUF: number = 0
    @JsonIgnore
    invoiceGrossAmount: number = 0
    @JsonIgnore
    invoiceGrossAmountHUF: number = 0

    @JsonIgnore
    get GetInvoicePaidAmountHUF(): number {
        return HelperFunctions.Round2(HelperFunctions.ToInt(this.invPaymentAmount) * this.exchangeRate, 1)
    }

    @JsonIgnore
    get GetRemaining(): number {
        return this.payableAmount - HelperFunctions.ToInt(this.invPaymentAmount)
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
        return HelperFunctions.isEmptyOrSpaces(this.invoiceNumber)
            || HelperFunctions.isEmptyOrSpaces(this.customerName)
    }
}

