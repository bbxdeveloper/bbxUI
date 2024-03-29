import { Injectable } from '@angular/core';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { OutGoingInvoiceFullData } from '../models/CreateOutgoingInvoiceRequest';
import { InvoiceCategory } from '../models/InvoiceCategory';
import { InvoiceLine } from '../models/InvoiceLine';
import { InvoiceTypes } from '../models/InvoiceTypes';

@Injectable({
  providedIn: 'root'
})
export class InvoiceStatisticsService {
  private invoiceLines: TreeGridNode<InvoiceLine>[] = []
  public set InvoiceLines(data: TreeGridNode<InvoiceLine>[]) {
    this.invoiceLines = data
  }
  public get InvoiceLines(): TreeGridNode<InvoiceLine>[] {
    return this.invoiceLines
  }

  private outGoingInvoiceData?: OutGoingInvoiceFullData
  public set OutGoingInvoiceData(data: OutGoingInvoiceFullData | undefined) {
    this.outGoingInvoiceData = data
  }
  public get OutGoingInvoiceData(): OutGoingInvoiceFullData | undefined {
    return this.outGoingInvoiceData
  }

  public InvoiceType: string = InvoiceTypes.NOT_DEFINED;
  public InvoiceCategory: string = InvoiceCategory.NOT_DEFINED
  public DeliveryPaymentMethod: string = 'OTHER';

  get Delivery(): boolean {
    return this.InvoiceType == InvoiceTypes.DNI || this.InvoiceType == InvoiceTypes.DNO;
  }
  get Incoming(): boolean {
    return this.InvoiceType == InvoiceTypes.INC || this.InvoiceType == InvoiceTypes.DNI;
  }

  /**
   * Tételek nettó
   */
  get SummaryInvoiceInvoiceLineNetSum(): number {
    return this.InvoiceLines
      .map(x => HelperFunctions.ToFloat(x.data.rowNetPrice))
      .reduce((sum, current) => sum + current, 0);
  }

  /**
   * Kedv. értéke
   */
  get SummaryInvoiceInvoiceLineDiscountValueSum(): number {
    return this.InvoiceLines
      .map(x => HelperFunctions.ToFloat(x.data.rowDiscountValue))
      .reduce((sum, current) => sum + current, 0);
  }

  /**
  * Kedvezményes. nettó
  */
  get SummaryInvoiceDiscountedNetAmountSum(): number {
    return this.SummaryInvoiceInvoiceLineNetSum - this.SummaryInvoiceInvoiceLineDiscountValueSum;
  }

  constructor() { }
}
