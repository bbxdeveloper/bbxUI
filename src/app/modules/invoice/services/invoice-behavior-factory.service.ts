import { Injectable } from '@angular/core';
import { InvoiceCategory } from '../models/InvoiceCategory';
import { InvoiceTypes } from '../models/InvoiceTypes';
import { NegativeQuantityValidator, NotZeroQuantityValidator, PositiveQuantityValidator, InvoiceBehaviorMode } from '../models/InvoiceBehaviorMode';
import { PartnerLockHandlerService } from 'src/app/services/partner-lock-handler.service';

@Injectable()
export class InvoiceBehaviorFactoryService {

  constructor(
    private readonly partnerLock: PartnerLockHandlerService
  ) { }

  public create(path: string): InvoiceBehaviorMode {
    let mode

    switch (path) {
      case 'invoice':
        mode = this.forInvoice()
        break
      case 'invoice-income':
        mode = this.forInvoiceIncome()
        break
      case 'price-review':
        mode = this.forPriceReview()
        break
      case 'incoming-delivery-note-income':
        mode = this.forIncomingDeliveryNoteIncome()
        break
      case 'incoming-correction-invoice':
        mode = this.forCorrectionInvoiceIncome()
        break
      case 'correction-invoice':
        mode = this.forCorrectionInvoice()
        break
      case 'outgoing-delivery-note-income':
        mode = this.forOutgoingDeliveryNoteIncome()
        break
      case 'receipt':
        mode = this.forReceipt()
        break
      case 'summary-invoice':
        mode = this.forSummaryInvoice()
        break
      case 'incoming-summary-invoice':
        mode = this.forIncomingSummaryInvoice()
        break
      case 'minus-delivery-note':
        mode = this.forMinusDeliveryNote()
        break
      case 'minus-incoming-delivery-note':
        mode = this.forMinusIncomingDeliveryNote()
        break
      default:
        throw new Error('Unsupported mode based on path: ' + path)
    }

    return mode
  }

  private forIncomingDeliveryNoteIncome(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.NORMAL
    result.invoiceType = InvoiceTypes.DNI
    result.incoming = true
    result.quantityValidators = [new NotZeroQuantityValidator, new PositiveQuantityValidator]
    result.title = 'Be. Szállítólevél'
    return result
  }

  private forInvoiceIncome(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.NORMAL
    result.invoiceType = InvoiceTypes.INC
    result.incoming = true
    result.quantityValidators = [new NotZeroQuantityValidator, new PositiveQuantityValidator]
    result.title = 'Be. Számla'
    return result
  }

  private forPriceReview(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.NOT_DEFINED
    result.invoiceType = InvoiceTypes.NOT_DEFINED
    result.quantityValidators = [new NotZeroQuantityValidator, new PositiveQuantityValidator]
    result.title = 'Árfelülvizsg.'
    result.partnerLock = this.partnerLock
    return result
  }

  private forCorrectionInvoiceIncome(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.NORMAL
    result.invoiceType = InvoiceTypes.INC
    result.incoming = true
    result.quantityValidators = [new NotZeroQuantityValidator, new NegativeQuantityValidator]
    result.title = 'Bejövő javítószámla'
    result.unitPriceColumnTitle = 'Besz.Ár'
    result.partnerLock = this.partnerLock
    return result
  }

  private forCorrectionInvoice(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.NORMAL
    result.invoiceType = InvoiceTypes.INV
    result.incoming = false
    result.quantityValidators = [new NotZeroQuantityValidator, new NegativeQuantityValidator]
    result.title = 'Javítószámla'
    result.partnerLock = this.partnerLock
    return result
  }

  private forInvoice(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.NORMAL
    result.invoiceType = InvoiceTypes.INV
    result.incoming = false
    result.quantityValidators = [new NotZeroQuantityValidator, new PositiveQuantityValidator]
    result.isSummaryInvoice = false
    result.checkCustomerLimit = true
    result.title = 'Számla'
    result.useCustomersPaymentMethod = true
    return result
  }

  private forOutgoingDeliveryNoteIncome(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.NORMAL
    result.invoiceType = InvoiceTypes.DNO
    result.incoming = false
    result.quantityValidators = [new NotZeroQuantityValidator, new PositiveQuantityValidator]
    result.isSummaryInvoice = false
    result.checkCustomerLimit = true
    result.title = 'Szállítólevél'
    return result
  }

  private forReceipt(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.NORMAL
    result.invoiceType = InvoiceTypes.BLK
    result.incoming = false
    result.quantityValidators = [new NotZeroQuantityValidator]
    result.isSummaryInvoice = true
    result.title = 'Blokk'
    return result
  }

  private forSummaryInvoice(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.AGGREGATE
    result.invoiceType = InvoiceTypes.INV
    result.incoming = false
    result.quantityValidators = [new NotZeroQuantityValidator, new PositiveQuantityValidator]
    result.isSummaryInvoice = true
    result.title = 'Gyűjtőszámla'
    result.useCustomersPaymentMethod = true
    result.partnerLock = this.partnerLock
    return result
  }

  private forIncomingSummaryInvoice(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.AGGREGATE
    result.invoiceType = InvoiceTypes.INC
    result.incoming = true
    result.quantityValidators = [new NotZeroQuantityValidator, new PositiveQuantityValidator]
    result.isSummaryInvoice = true
    result.title = 'Be. Gyűjtőszámla'
    result.unitPriceColumnTitle = 'Besz.Ár'
    result.partnerLock = this.partnerLock
    return result
  }

  private forMinusDeliveryNote(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.NORMAL
    result.invoiceType = InvoiceTypes.DNO
    result.incoming = false
    result.deliveryNoteCorrection = true
    result.paymentMethod = 'OTHER'
    result.quantityValidators = [new NotZeroQuantityValidator, new NegativeQuantityValidator]
    result.isSummaryInvoice = false
    result.title = 'Szállító vissz.'
    result.invoiceCorrection = true
    result.partnerLock = this.partnerLock
    return result
  }

  private forMinusIncomingDeliveryNote(): InvoiceBehaviorMode {
    const result = new InvoiceBehaviorMode()
    result.invoiceCategory = InvoiceCategory.NORMAL
    result.invoiceType = InvoiceTypes.DNI
    result.incoming = true
    result.deliveryNoteCorrection = true
    result.paymentMethod = 'OTHER'
    result.quantityValidators = [new NotZeroQuantityValidator, new NegativeQuantityValidator]
    result.isSummaryInvoice = false
    result.title = 'Be. Szállító vissz.'
    result.invoiceCorrection = true
    result.unitPriceColumnTitle = 'Besz.Ár'
    result.partnerLock = this.partnerLock
    return result
  }
}
