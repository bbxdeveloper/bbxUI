import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PaymentMethod } from '../../invoice/models/PaymentMethod';
import { SummaryInvoiceMode } from '../../invoice/models/SummaryInvoiceMode';
import { InvoiceService } from '../../invoice/services/invoice.service';

@Component({
  selector: 'app-receipt-data-form',
  templateUrl: './receipt-data-form.component.html',
  styleUrls: ['./receipt-data-form.component.scss']
})
export class ReceiptDataFormComponent implements OnInit {
  @Input() mode: SummaryInvoiceMode = {} as SummaryInvoiceMode

  @Input() isLoading: boolean = true;
  @Input() isSaveInProgress: boolean = false;

  TileCssClass = TileCssClass;

  @Input() outInvForm!: FormGroup
  outInvFormId: string = "outgoing-invoice-form"
  @Input() outInvFormNav!: InlineTableNavigatableForm

  paymentMethods: PaymentMethod[] = [];
  _paymentMethods: string[] = [];
  paymentMethodOptions$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  get editDisabled() {
    return !this.keyboardNavService.isEditModeActivated && !this.isLoading && !this.isSaveInProgress;
  }

  constructor(private keyboardNavService: KeyboardNavigationService, private invoiceService: InvoiceService, private commonService: CommonService) {
  }

  async ngOnInit(): Promise<void> {
    await this.Refresh()
    this.initFormValues()
  }

  initFormValues(): void {
    this.outInvForm.controls['invoiceIssueDate'].setValue(HelperFunctions.GetDateString(0, 0, 0))
  }

  private async Refresh(): Promise<void> {
    const tempPaymentSubscription = this.invoiceService.GetTemporaryPaymentMethod().subscribe({
      next: d => {
        console.log('[GetTemporaryPaymentMethod]: ', d);
        this.paymentMethods = d;
        this._paymentMethods = this.paymentMethods.map(x => x.text) ?? [];
        this.paymentMethodOptions$.next(this._paymentMethods);
        if (this._paymentMethods.length > 0) {
          this.outInvForm.controls['paymentMethod'].setValue(this._paymentMethods[0])
        }
      }
    });
    this.invoiceService.GetPaymentMethods().subscribe({
      next: d => {
        if (!!tempPaymentSubscription && !tempPaymentSubscription.closed) {
          tempPaymentSubscription.unsubscribe();
        }
        console.log('[GetPaymentMethods]: ', d);
        this.paymentMethods = !!d && d.length > 0 ? d.filter(x => x.value === 'CASH' || x.value === 'CARD') : [];
        this._paymentMethods = this.paymentMethods.map(x => x.text) ?? [];
        this.paymentMethodOptions$.next(this._paymentMethods);
        if (this._paymentMethods.length > 0) {
          this.outInvForm.controls['paymentMethod'].setValue(this._paymentMethods[0])
        }
      },
      error: (err) => {
        this.commonService.HandleError(err);
      },
      complete: () => { },
    })
  }
}
