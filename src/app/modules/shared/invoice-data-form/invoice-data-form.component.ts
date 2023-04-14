import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { validDate } from 'src/assets/model/Validators';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { SummaryInvoiceMode } from '../../invoice/models/SummaryInvoiceMode';

@Component({
  selector: 'app-invoice-data-form',
  templateUrl: './invoice-data-form.component.html',
  styleUrls: ['./invoice-data-form.component.scss']
})
export class InvoiceDataFormComponent implements OnInit {
  @Input() mode?: SummaryInvoiceMode

  outInvForm!: FormGroup
  outInvFormId: string = "outgoing-invoice-form"
  outInvFormNav!: InlineTableNavigatableForm
  outInvFormNav$: BehaviorSubject<InlineTableNavigatableForm[]> = new BehaviorSubject<InlineTableNavigatableForm[]>([])

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

  constructor() {
    this.outInvForm = new FormGroup({
      paymentMethod: new FormControl('', [Validators.required]),
      invoiceDeliveryDate: new FormControl('', [
        Validators.required,
        this.validateInvoiceDeliveryDate.bind(this),
        validDate
      ]),
      invoiceIssueDate: new FormControl('', [
        Validators.required,
        this.validateInvoiceIssueDate.bind(this),
        validDate
      ]),
      paymentDate: new FormControl('', [
        Validators.required,
        this.validatePaymentDate.bind(this),
        validDate
      ]),
      invoiceOrdinal: new FormControl('', []), // in post response
      notice: new FormControl('', []),
    });
    if (this.mode?.incoming) {
      this.outInvForm.addControl('customerInvoiceNumber', new FormControl('', [
        Validators.required
      ]));
    }
  }

  ngOnInit(): void {
    this.InitFormDefaultValues()
  }

  // invoiceDeliveryDate
  validateInvoiceDeliveryDate(control: AbstractControl): any {
    if (this.invoiceIssueDateValue === undefined) {
      return null
    }

    let deliveryDate = HelperFunctions.GetDateIfDateStringValid(control.value)
    let issueDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceIssueDateValue.toDateString())

    const wrong = deliveryDate?.isAfter(issueDate, "day") || deliveryDate?.isAfter(undefined, "day")
    return wrong ? { wrongDate: { value: control.value } } : null
  }

  validateInvoiceIssueDate(control: AbstractControl): any {
    if (this.invoiceDeliveryDateValue === undefined) {
      return null
    }

    let issueDate = HelperFunctions.GetDateIfDateStringValid(control.value)
    let deliveryDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceDeliveryDateValue.toDateString())

    const wrong = issueDate?.isBefore(deliveryDate, "day") || issueDate?.isAfter(undefined, "day")
    return wrong ? { wrongDate: { value: control.value } } : null
  }

  // paymentDate
  validatePaymentDate(control: AbstractControl): any {
    if (this.invoiceIssueDateValue === undefined) {
      return null
    }

    let paymentDate = HelperFunctions.GetDateIfDateStringValid(control.value)
    let issueDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceIssueDateValue.toString())

    const wrong = paymentDate?.isBefore(issueDate, "day")
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

}
