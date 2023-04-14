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

  private forReceipt(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.NOT_DEFINED,
      invoiceType: InvoiceTypes.BLK,
      incoming: false,
      correction: false,
      validateQuantity: new PositiveQuantityValidator,
      isSummaryInvoice: true
    } as SummaryInvoiceMode
  }

  private forSummaryInvoice(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.AGGREGATE,
      invoiceType: InvoiceTypes.INV,
      incoming: false,
      correction: false,
      validateQuantity: new PositiveQuantityValidator,
      isSummaryInvoice: true
    } as SummaryInvoiceMode
  }

  private forIncomingSummaryInvoice(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.AGGREGATE,
      invoiceType: InvoiceTypes.INC,
      incoming: true,
      correction: false,
      validateQuantity: new PositiveQuantityValidator,
      isSummaryInvoice: true
    } as SummaryInvoiceMode
  }

  private forMinusDeliveryNote(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.NORMAL,
      invoiceType: InvoiceTypes.DNO,
      incoming: false,
      correction: true,
      paymentMethod: 'OTHER',
      validateQuantity: new NegativeQuantityValidator,
      isSummaryInvoice: false
    } as SummaryInvoiceMode
  }

  private forMinusIncomingDeliveryNote(): SummaryInvoiceMode {
    return {
      invoiceCategory: InvoiceCategory.NORMAL,
      invoiceType: InvoiceTypes.DNI,
      incoming: true,
      correction: true,
      paymentMethod: 'OTHER',
      validateQuantity: new NegativeQuantityValidator,
      isSummaryInvoice: false
    } as SummaryInvoiceMode
  }
}
