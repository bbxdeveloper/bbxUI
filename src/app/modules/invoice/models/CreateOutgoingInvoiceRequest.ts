import { DynamicObject, JsonIgnore } from "src/assets/model/navigation/DynamicObject";
import { HelperFunctions } from "src/assets/util/HelperFunctions";
import { InvoiceLine } from "./InvoiceLine";
import { InvoiceTypes } from "./InvoiceTypes";

export class CreateOutgoingInvoiceRequest<T = InvoiceLine> extends DynamicObject {
    "warehouseCode": string;

    "invoiceIssueDate": any;  // date
    "invoiceDeliveryDate": any; // date
    "paymentDate": any; // date

    "customerID"?: number;
    "customerInvoiceNumber"?: string;

    "paymentMethod": string;

    "notice": string;

    "invoiceLines": T[];

    "currencyCode"?: string;
    "exchangeRate"?: number;

    "incoming"?: boolean;
    "invoiceType"?: string;
    "invoiceCategory"?: string;

    "invoiceDiscountPercent": number;

    workNumber: string|undefined = undefined
    priceReview: boolean|undefined = undefined
    deliveryNoteCorrection?: boolean = undefined
    invoiceCorrection: boolean = false
    originalInvoiceID: number|undefined

    userID: number = -1

    @JsonIgnore
    get isDelivery(): boolean {
        switch (this.invoiceType) {
            case InvoiceTypes.DNO:
            case InvoiceTypes.DNI:
                return true
            default:
                return false
        }
    }

    constructor(init?: Partial<CreateOutgoingInvoiceRequest>) {
        super()
        if (init) {
            Object.assign(this, init)
        }
    }
}

export class OutGoingInvoiceFullData extends CreateOutgoingInvoiceRequest<InvoiceLine> {
    @JsonIgnore
    "invoiceNetAmount": number; // amount * price (sum invoicelines) - status row

    @JsonIgnore
    "invoiceVatAmount": number; // netamount * vat (sum invoicelines)

    @JsonIgnore
    "lineGrossAmount": number; // netamount + vatamount (sum invoicelines)

    /**
     * Save dialog cache
     */
    @JsonIgnore
    loginName?: string = undefined

    /**
     * Save dialog cache
     */
    @JsonIgnore
    username?: string = undefined

    constructor(init?: Partial<OutGoingInvoiceFullData>) {
        super()
        if (init) {
            Object.assign(this, init)
        }
    }
}

export function OutGoingInvoiceFullDataToRequest(f: OutGoingInvoiceFullData, needVatRate = true): CreateOutgoingInvoiceRequest<InvoiceLine> {
    if (f.invoiceType !== InvoiceTypes.DNO) {
        f.JsonIgnoreList.push('priceReview', 'workNumber')
    }
    if (!needVatRate) {
        f.JsonIgnoreList.push('vatRate')
    }

    f.invoiceDiscountPercent = HelperFunctions.ToFloat(f.invoiceDiscountPercent)

    return f;
}