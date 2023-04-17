import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { validDate } from 'src/assets/model/Validators';
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
    return !this.kbS.isEditModeActivated && !this.isLoading && !this.isSaveInProgress;
  }

  get invoiceIssueDateValue(): Date | undefined {
    if (!!!this.outInvForm) {
      return undefined
    }
    const tmp = this.outInvForm.controls['invoiceIssueDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp)
  }

  get invoiceDeliveryDateValue(): Date | undefined {
    if (!!!this.outInvForm) {
      return undefined
    }
    const tmp = this.outInvForm.controls['invoiceDeliveryDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp)
  }

  constructor(private kbS: KeyboardNavigationService, private seInv: InvoiceService, private cs: CommonService) {
    this.outInvForm = new FormGroup({
      paymentMethod: new FormControl('', [Validators.required]),
      invoiceDeliveryDate: new FormControl('', [
        Validators.required,
        this.validateInvoiceDeliveryDate.bind(this),
        validDate
      ]),
      invoiceIssueDate: new FormControl('', [validDate]),
      paymentDate: new FormControl('', [validDate]),
      invoiceOrdinal: new FormControl('', []), // in post response
      notice: new FormControl('', []),
    });
    if (this.mode?.incoming) {
      this.outInvForm.addControl('customerInvoiceNumber', new FormControl('', [
        Validators.required
      ]));
    }
  }

  async ngOnInit(): Promise<void> {
    this.InitFormDefaultValues()
    await this.Refresh()
  }

  // invoiceDeliveryDate
  validateInvoiceDeliveryDate(control: AbstractControl): any {
    if (this.invoiceIssueDateValue === undefined) {
      return null
    }

    let deliveryDate = HelperFunctions.GetDateIfDateStringValid(control.value)
    // let issueDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceIssueDateValue.toDateString())

    const wrong = false // deliveryDate?.isAfter(issueDate, "day") || deliveryDate?.isAfter(undefined, "day")
    return wrong ? { wrongDate: { value: control.value } } : null
  }

  InitFormDefaultValues(): void {
    this.outInvForm.controls['invoiceIssueDate'].setValue(HelperFunctions.GetDateString(0, 0, 0))
    this.outInvForm.controls['invoiceDeliveryDate'].setValue(HelperFunctions.GetDateString(0, 0, 0))
    this.outInvForm.controls['paymentDate'].setValue(HelperFunctions.GetDateString(0, 0, 0))

    this.outInvForm.controls['invoiceIssueDate'].valueChanges.subscribe({
      next: p => {
        this.outInvForm.controls['invoiceDeliveryDate'].setValue(this.outInvForm.controls['invoiceDeliveryDate'].value)
        this.outInvForm.controls['invoiceDeliveryDate'].markAsTouched()

        this.outInvForm.controls['paymentDate'].setValue(this.outInvForm.controls['paymentDate'].value)
        this.outInvForm.controls['paymentDate'].markAsTouched()
      }
    });
  }

  private async Refresh(): Promise<void> {
    const tempPaymentSubscription = this.seInv.GetTemporaryPaymentMethod().subscribe({
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
    this.seInv.GetPaymentMethods().subscribe({
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
        this.cs.HandleError(err);
      },
      complete: () => { },
    })
  }
}
