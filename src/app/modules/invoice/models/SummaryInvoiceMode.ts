import { ValidationMessage } from "src/assets/util/ValidationMessages";
import { InvoiceCategory } from "./InvoiceCategory";
import { InvoiceTypes } from "./InvoiceTypes";

export class SummaryInvoiceMode {
    public invoiceCategory!: InvoiceCategory
    public invoiceType!: InvoiceTypes
    public correction!: boolean
    public incoming!: boolean
    public paymentMethod: string = ''
    public isSummaryInvoice: boolean = false

    public validateQuantity!: IQuantityValidator

    public title: string = ''
}

export interface IQuantityValidator {
    validate: (value: number, limit: number) => ValidationMessage | null
}

export class PositiveQuantityValidator implements IQuantityValidator {
    public validate(value: number, limit: number): ValidationMessage | null {
        if (value > limit) {
            return ValidationMessage.ErrorMax
        }
        else if (value < 1) {
            return ValidationMessage.ErrorMin
        }

        return null
    }
}

export class NegativeQuantityValidator implements IQuantityValidator {
    public validate(value: number, limit: number): ValidationMessage | null {
        if (value < limit) {
            return ValidationMessage.ErrorMin
        }
        else if (value >= 0) {
            return ValidationMessage.ErrorMax
        }

        return null
    }
}
