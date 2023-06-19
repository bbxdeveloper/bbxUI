import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, pairwise } from 'rxjs';
import { validDate } from 'src/assets/model/Validators';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PaymentMethod } from '../models/PaymentMethod';
import { InvoiceService } from '../services/invoice.service';
import { CommonService } from 'src/app/services/common.service';
import { InvoiceFormData } from './InvoiceFormData';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit, IInlineManager {
  @Input()
  public editDisabled!: boolean

  @Input()
  public set invoiceFormData(invoiceFormData: InvoiceFormData|undefined) {
    if (!invoiceFormData) {
      return
    }

    const paymentMethod = this.paymentMethods.find(x => x.value === invoiceFormData.paymentMethod)?.text ?? 'Átutalás'

    const controls = this.outInvForm.controls
    controls['paymentMethod'].setValue(paymentMethod)
    controls['invoiceDeliveryDate'].setValue(invoiceFormData.invoiceDeliveryDate)
    controls['invoiceIssueDate'].setValue(invoiceFormData.invoiceIssueDate)
    controls['paymentDate'].setValue(invoiceFormData.paymentDate)
    controls['invoiceOrdinal'].setValue(invoiceFormData.invoiceOrdinal)
    controls['notice'].setValue(invoiceFormData.notice)
  }
  public get invoiceFormData() {
    const controls = this.outInvForm.controls

    const paymentMethod = this.paymentMethods.find(x => x.text === controls['paymentMethod'].value)?.value
    const formData = {
      paymentMethod: paymentMethod,
      invoiceDeliveryDate: controls['invoiceDeliveryDate'].value,
      invoiceIssueDate: controls['invoiceIssueDate'].value,
      paymentDate: controls['paymentDate'].value,
      invoiceOrdinal: controls['invoiceOrdinal'].value,
      notice: controls['notice'].value
    } as InvoiceFormData
    return formData
  }

  public tileCssClass = TileCssClass

  public outInvForm!: FormGroup
  public outInvFormId = 'outgoing-invoice-form'
  outInvFormNav!: InlineTableNavigatableForm
  outInvFormNav$ = new BehaviorSubject<InlineTableNavigatableForm[]>([])

  paymentMethods: PaymentMethod[] = [];
  _paymentMethods: string[] = [];
  paymentMethodOptions$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  get invoiceIssueDateValue(): Date | undefined {
    if (!this.outInvForm) {
      return undefined;
    }

    const tmp = this.outInvForm.controls['invoiceIssueDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get invoiceDeliveryDateValue(): Date | undefined {
    if (!this.outInvForm) {
      return undefined;
    }

    const tmp = this.outInvForm.controls['invoiceDeliveryDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly commonService: CommonService,
    private readonly keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
  ) {
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
  }

  public ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    throw new Error('Method not implemented.');
  }

  public ChooseDataForCustomerForm(): void {
    throw new Error('Method not implemented.');
  }

  public RefreshData(): void {
    throw new Error('Method not implemented.');
  }

  IsTableFocused: boolean = false

  public TableRowDataChanged(changedData?: any, index?: number | undefined, col?: string | undefined): void {
    throw new Error('Method not implemented.');
  }

  public RecalcNetAndVat(): void {
    throw new Error('Method not implemented.');
  }

  private validateInvoiceDeliveryDate(control: AbstractControl): any {
    if (this.invoiceIssueDateValue === undefined) {
      return null;
    }

    let deliveryDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let issueDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceIssueDateValue.toDateString());

    const wrong = deliveryDate?.isAfter(issueDate, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  private validateInvoiceIssueDate(control: AbstractControl): any {
    if (this.invoiceDeliveryDateValue === undefined) {
      return null;
    }

    let issueDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let deliveryDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceDeliveryDateValue.toDateString());

    const wrong = issueDate?.isBefore(deliveryDate, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  private validatePaymentDate(control: AbstractControl): any {
    if (this.invoiceIssueDateValue === undefined) {
      return null;
    }

    let paymentDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let issueDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceIssueDateValue.toString());

    const wrong = paymentDate?.isBefore(issueDate, "day");
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  public ngOnInit(): void {
    this.outInvFormNav = new InlineTableNavigatableForm(
      this.outInvForm,
      this.keyboardService,
      this.cdref,
      [],
      this.outInvFormId,
      AttachDirection.DOWN,
      this
    )
    this.outInvFormNav.OuterJump = true

    this.outInvForm.controls['invoiceDeliveryDate'].valueChanges
      .pipe(pairwise())
      .subscribe({
        next: ([oldValue, newValue]: [string, string]) => {
          if (oldValue !== newValue) {
            this.outInvForm.controls['invoiceIssueDate'].updateValueAndValidity()
            this.outInvForm.controls['paymentDate'].updateValueAndValidity()
          }
        }
      });

    this.outInvForm.controls['invoiceIssueDate'].valueChanges
      .pipe(pairwise())
      .subscribe({
        next: ([oldValue, newValue]: [string, string]) => {
          if (oldValue !== newValue) {
            this.outInvForm.controls['invoiceDeliveryDate'].updateValueAndValidity()
            this.outInvForm.controls['paymentDate'].updateValueAndValidity()
          }
        }
      });

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
        this.paymentMethods = d;
        this._paymentMethods = this.paymentMethods.map(x => x.text) ?? [];
        this.paymentMethodOptions$.next(this._paymentMethods);
        if (this._paymentMethods.length > 0) {
          this.outInvForm.controls['paymentMethod'].setValue(this._paymentMethods[0])
        }
      },
      error: (err) => {
        this.commonService.HandleError(err);
      },
    })
  }

}
