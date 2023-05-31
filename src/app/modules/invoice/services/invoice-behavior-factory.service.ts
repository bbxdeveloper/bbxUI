import { Injectable } from '@angular/core';
import { InvoiceCategory } from '../models/InvoiceCategory';
import { InvoiceTypes } from '../models/InvoiceTypes';
import { NegativeQuantityValidator, PositiveQuantityValidator, SummaryInvoiceMode } from '../models/SummaryInvoiceMode';

@Injectable({
  providedIn: 'root'
})
export class InvoiceBehaviorFactoryService {

  constructor() { }

  public create(path: string): SummaryInvoiceMode {
    let mode = {} as SummaryInvoiceMode

    switch (path) {
      case 'invoice':
        mode = this.forInvoice()
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

  private forInvoice(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.NORMAL,
      invoiceType: InvoiceTypes.INV,
      incoming: false,
      validateQuantity: new PositiveQuantityValidator,
      isSummaryInvoice: false,
      checkCustomerLimit: true,
      title: 'Számla'
    } as SummaryInvoiceMode
  }

  private forOutgoingDeliveryNoteIncome(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.NORMAL,
      invoiceType: InvoiceTypes.DNI,
      incoming: false,
      validateQuantity: new PositiveQuantityValidator,
      isSummaryInvoice: false,
      checkCustomerLimit: true,
      title: 'Szállítólevél'
    } as SummaryInvoiceMode
  }

  private forReceipt(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.NORMAL,
      invoiceType: InvoiceTypes.BLK,
      incoming: false,
      validateQuantity: new PositiveQuantityValidator,
      isSummaryInvoice: true,
      title: 'Blokk'
    } as SummaryInvoiceMode
  }

  private forSummaryInvoice(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.AGGREGATE,
      invoiceType: InvoiceTypes.INV,
      incoming: false,
      validateQuantity: new PositiveQuantityValidator,
      isSummaryInvoice: true,
      checkCustomerLimit: true,
      title: 'Gyűjtőszámla'
    } as SummaryInvoiceMode
  }

  private forIncomingSummaryInvoice(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.AGGREGATE,
      invoiceType: InvoiceTypes.INC,
      incoming: true,
      validateQuantity: new PositiveQuantityValidator,
      isSummaryInvoice: true,
      title: 'Be. Gyűjtőszámla'
    } as SummaryInvoiceMode
  }

  private forMinusDeliveryNote(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.NORMAL,
      invoiceType: InvoiceTypes.DNO,
      incoming: false,
      deliveryNoteCorrection: true,
      paymentMethod: 'OTHER',
      validateQuantity: new NegativeQuantityValidator,
      isSummaryInvoice: false,
      title: 'Szállító vissz.',
      invoiceCorrection: true,
    } as SummaryInvoiceMode
  }

  private forMinusIncomingDeliveryNote(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.NORMAL,
      invoiceType: InvoiceTypes.DNI,
      incoming: true,
      deliveryNoteCorrection: true,
      paymentMethod: 'OTHER',
      validateQuantity: new NegativeQuantityValidator,
      isSummaryInvoice: false,
      title: 'Be. Szállító vissz.',
      invoiceCorrection: true,
    } as SummaryInvoiceMode
  }
}
