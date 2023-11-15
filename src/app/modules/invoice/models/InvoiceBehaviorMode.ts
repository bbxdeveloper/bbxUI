import { ValidationMessage } from "src/assets/util/ValidationMessages";
import { InvoiceCategory } from "./InvoiceCategory";
import { InvoiceTypes } from "./InvoiceTypes";
import { IPartnerLock } from "src/app/services/IPartnerLock";

export class InvoiceBehaviorMode {
    public invoiceCategory!: InvoiceCategory
    public invoiceType!: InvoiceTypes
    public deliveryNoteCorrection?: boolean
    public incoming!: boolean
    public paymentMethod: string = ''
    public isSummaryInvoice: boolean = false
    public invoiceCorrection: boolean = false
    public useCustomersPaymentMethod: boolean = false
    public unitPriceColumnTitle: string = ''
    public partnerLock: IPartnerLock|undefined
    public autoFillCustomerInvoiceNumber: boolean = false

    public checkCustomerLimit: boolean = false

    public quantityValidators: IQuantityValidator[] = []

    public title: string = ''

    get Delivery(): boolean {
        return this.invoiceType == InvoiceTypes.DNI || this.invoiceType == InvoiceTypes.DNO;
    }

    get Incoming(): boolean {
        return this.invoiceType == InvoiceTypes.INC || this.invoiceType == InvoiceTypes.DNI;
    }

    /**
     * Validálja az értéket és visszaadja az első hibát jelző validációs eredményt.
     * @param value
     * @param limit
     * @returns Validálásnál talált hiba vagy null.
     */
    public validateQuantity(value: number, limit?: number): ValidationMessage | null {
        for(let i = 0; i < this.quantityValidators.length; i++) {
            const result = this.quantityValidators[i].validate(value, limit)
            if (result) {
                return result
            }
        }
        return null
    }

    /**
     * Validálja az értéket és visszaadja azon validálások eredményét, amik hibát jeleztek.
     * @param value
     * @param limit
     * @returns Validálásnál talált hibák vagy üres lista.
     */
    public multiValidateQuantity(value: number, limit?: number): ValidationMessage[] {
        let results: ValidationMessage[] = []
        for (let i = 0; i < this.quantityValidators.length; i++) {
            const result = this.quantityValidators[i].validate(value, limit)
            if (result) {
                results.push(result)
            }
        }
        return results
    }
}

export interface IQuantityValidator {
    validate: (value: number, limit?: number) => ValidationMessage | null
}

export class PositiveQuantityValidator implements IQuantityValidator {
    public validate(value: number, limit: number = Number.MAX_SAFE_INTEGER): ValidationMessage | null {
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
    public validate(value: number, limit: number = Number.MIN_SAFE_INTEGER): ValidationMessage | null {
        if (value < limit) {
            return ValidationMessage.ErrorMin
        }
        else if (value >= 0) {
            return ValidationMessage.ErrorMax
        }

        return null
    }
}

export class NotZeroQuantityValidator implements IQuantityValidator {
    /**
     *
     * @param value
     * @param limit Nincs használva. Fixen 0-ra van az ellenőrzés.
     * @returns
     */
    public validate(value: number, limit?: number): ValidationMessage | null {
        if (value === 0) {
            return ValidationMessage.ErrorZero
        }

        return null
    }
}
