import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection, NavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { OutGoingInvoiceFullData } from '../models/CreateOutgoingInvoiceRequest';
import { createMask } from '@ngneat/input-mask';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { InvoiceTypes } from '../models/InvoiceTypes';
import { InvoiceCategory } from '../models/InvoiceCategory';
import { InvoiceStatisticsService } from '../services/invoice-statistics.service';
import { Price } from 'src/assets/util/Price';
import { LoggerService } from 'src/app/services/logger.service';
import { InvoiceService } from '../services/invoice.service';
import { CommonService } from 'src/app/services/common.service';
import { Customer } from '../../customer/models/Customer';
import { NavigatableType } from 'src/assets/model/navigation/Navigatable';
import { Constants } from 'src/assets/util/Constants';
import { AuthChangeEventArgs } from '../../shared/auth/auth-form/auth-fields.component';
import { PaymentMethods } from '../models/PaymentMethod';

interface VatRateRow { Id: string, Value: number };

const logTag: string = 'InvSaveDlgLogs'

@Component({
  selector: 'app-save-dialog',
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.scss']
})
/**
 * Save and summary dialog for invoices and deliveries
 */
export class SaveDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, AfterContentInit, OnDestroy, OnInit {
  @Input() data!: OutGoingInvoiceFullData;

  @Input() InvoiceType: string = "";
  @Input() Incoming: boolean = false;
  @Input() Delivery: boolean = false;
  @Input() isDiscountVisible: boolean = true
  @Input() isDiscountDisabled: boolean = false
  @Input() forceDisableOutgoingDelivery: boolean = false
  @Input() negativeDiscount: boolean = false
  @Input() defaultDiscountPercent?: number

  @Input() checkCustomerLimit: boolean = false
  @Input() customer?: Customer

  loggedIn: boolean = false

  override NavigatableType = NavigatableType.dialog

  get OutGoingDelivery(): boolean {
    return !this.forceDisableOutgoingDelivery && this.data && this.data?.invoiceType == InvoiceTypes.DNO;
  }

  get isEditModeOff() {
    return this.kBs.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  public get isAggregate(): boolean {
    return this.data?.invoiceCategory === InvoiceCategory.AGGREGATE
  }

  discountPercentInputPlaceHolder: string = "0";
  discountInputPlaceHolder: string = "0.00";

  formNav!: NavigatableForm;

  numberInputMask: any = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0.0',
  });

  numberInputMaskInt: any = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 0,
    digitsOptional: true,
    prefix: '',
    placeholder: '0',
  });

  discountInputMask: any = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 0,
    digitsOptional: false,
    prefix: '',
    min: -999,
    max: 999,
    placeholder: '0',
  });

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  closedManually: boolean = false;
  isLoading: boolean = true;

  sumForm: FormGroup;
  sumFormId: string = "outgoing-invoice-form";

  vatRateCodes: VatRateRow[] = [];

  customerLimitsChecked: boolean = false

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<SaveDialogComponent>,
    private kBs: KeyboardNavigationService,
    private invoiceStats: InvoiceStatisticsService,
    private loggerService: LoggerService,
    private invoiceService: InvoiceService,
    private cs: CommonService,
    private dialogService: NbDialogService,
    private commonService: CommonService
  ) {
    super()
    this.Setup()
    this.sumForm = new FormGroup({})
  }

  MoveToSaveButtons(event: any): void {
    if (!this.kBs.isEditModeActivated) {
      this.formNav!.HandleFormEnter(event);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.kBs.Jump(AttachDirection.DOWN, false);
      this.kBs.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button-yes", "confirm-dialog-button-no"]];
  }

  private prepareVatRateCodes(discount: number = 0): void {
    var result: VatRateRow[] = [];
    this.data.invoiceLines.forEach(x => {
      x.discount = discount;
      const priceData = x.GetDiscountedCalcResult();
      if (!!x.vatRateCode){
        const resultIndex = result.findIndex(y => y.Id === x.vatRateCode);
        if (result.findIndex(y => y.Id === x.vatRateCode) !== -1) {
          result[resultIndex].Value += priceData.lineVatAmount;
        } else {
          result.push({ Id: x.vatRateCode, Value: priceData.lineVatAmount } as VatRateRow);
        }
      }
    });
    result.forEach(x => {
      x.Value = this.data.currencyCode === CurrencyCodes.HUF
        ? HelperFunctions.Round(x.Value)
        : HelperFunctions.Round2(x.Value, 2)
    });
    this.vatRateCodes = result;
  }

  private async checkCustomerLimits(): Promise<void> {
    if (this.customerLimitsChecked) {
      return
    }

    if (!this.checkCustomerLimit) {
      return
    }

    if (this.data.paymentMethod !== 'TRANSFER' && this.data.paymentMethod !== 'CARD') {
      if (!(this.data.isDelivery && !this.data.incoming)) {
        return
      }
    }

    try {
      if (this.data.customerID !== undefined) {
        const maxLimit = HelperFunctions.ToInt(this.customer?.maxLimit)
        const warningLimit = HelperFunctions.ToInt(this.customer?.warningLimit)

        if (maxLimit === 0 || warningLimit === 0) {
          return
        }

        var discountedPrice = HelperFunctions.ToFloat(this.sumForm.controls['discountedInvoiceNetAmount'].value)
        var customerUnpaidAmount = await this.invoiceService.GetCustomerUnpaidAmount({ CustomerID: this.data.customerID })
        var sum = discountedPrice + customerUnpaidAmount

        if (sum > maxLimit) {
          HelperFunctions.confirmOneButtonAsync(
            this.dialogService,
            `A partner kiegyenlítetlen összege elérte a maximális értéket (${maxLimit})!`,
            `Visszalépés`,
            () => {
              this.checkCustomerLimit = false
              this.close(false)
            }
          )
        }

        else if (sum > warningLimit) {
          HelperFunctions.confirmAsync(
            this.dialogService,
            `A partner kiegyenlítetlen összege elérte a figyelmeztetés limitet (${warningLimit})!`,
            () => { this.customerLimitsChecked = true },
            () => { this.checkCustomerLimit = false; this.close(false) }
          )
        }
      } else {
        throw new Error("Partnert kötelező választani!")
      }
    }
    catch (error) {
      this.cs.HandleError(error)
      this.close(false)
    }
  }

  private recalc(actualDiscount: number): void {
    // this.logi(`actualDiscount: ${actualDiscount}`)

    // update discount
    this.data.invoiceDiscountPercent = actualDiscount;

    const invoiceDiscountMultiplier = actualDiscount / 100.0
    // this.logi(`invoiceDiscountMultiplier: ${invoiceDiscountMultiplier}`)

    // calc rate summary + prepare discountedData for lines
    this.prepareVatRateCodes(invoiceDiscountMultiplier);

    // discountedInvoiceNetAmount
    let discountedInvoiceNetAmount = 0
    if (!this.isAggregate) {
      discountedInvoiceNetAmount = this.data.invoiceLines
        .map(x => HelperFunctions.ToFloat(x.discountedData!.lineNetAmount))
        .reduce((sum, current) => sum + current, 0);
    }
    else {
      discountedInvoiceNetAmount = this.invoiceStats.SummaryInvoiceDiscountedNetAmountSum;
    }

    discountedInvoiceNetAmount = HelperFunctions.Round2(discountedInvoiceNetAmount, 1);

    if (!this.isAggregate){
      let invoiceDiscountValue = this.data.invoiceNetAmount - discountedInvoiceNetAmount;

      if (this.negativeDiscount) {
        invoiceDiscountValue = -invoiceDiscountValue
      }
      this.sumForm.controls['invoiceDiscountValue'].setValue(invoiceDiscountValue);
    } else {
      this.sumForm.controls['invoiceDiscountValue'].setValue(this.invoiceStats.SummaryInvoiceInvoiceLineDiscountValueSum);

      this.sumForm.controls['invoiceNetAmount'].setValue(this.invoiceStats.SummaryInvoiceInvoiceLineNetSum);
    }

    this.sumForm.controls['discountedInvoiceNetAmount'].setValue(discountedInvoiceNetAmount);

    // discounted vat amount
    // refresh invoice stats

    let discountedVatAmount
    let discountedGross
    if (this.isAggregate) {
      discountedVatAmount = this.data.invoiceLines
        .map(x => HelperFunctions.ToFloat(x.rowDiscountedGrossPrice))
        .reduce((sum, current) => sum + current, 0)

      discountedGross = discountedVatAmount
    }
    else {
      discountedVatAmount = this.data.invoiceLines
        .map(x => HelperFunctions.ToFloat(x.discountedData!.lineVatAmount))
        .reduce((sum, current) => sum + current, 0);

      discountedVatAmount = this.data.currencyCode === CurrencyCodes.HUF
        ? HelperFunctions.Round(discountedVatAmount)
        : HelperFunctions.Round2(discountedVatAmount, 2)

      discountedGross = discountedInvoiceNetAmount + discountedVatAmount;
    }

    if (this.data.currencyCode !== CurrencyCodes.HUF) {
      discountedGross = HelperFunctions.Round2(discountedGross, 2)
    }
    else if (this.data.paymentMethod === PaymentMethods.Cash) {
      discountedGross = HelperFunctions.CASHRound(discountedGross)
    }
    else {
      discountedGross = HelperFunctions.Round(discountedGross)
    }

    // rates
    if (!this.isAggregate) {
      this.vatRateCodes.forEach((row: VatRateRow, index: number) => {
        this.sumForm.controls['vatRateFormControl-' + (index + '')].setValue(row.Value);
      });
    }
    else {
      const summedVatPrice = this.data.invoiceLines.reduce((sum, current) => sum + Price.vatRate(current.rowDiscountedNetPrice, current.vatRate), 0)

      this.sumForm.controls['vatRateFormControl-0'].setValue(summedVatPrice)
    }

    // gross, linecount
    this.sumForm.controls['lineGrossAmount'].setValue(discountedGross);
    this.sumForm.controls['invoiceLinesCount'].setValue(this.data.invoiceLines.length);
  }

  ngAfterContentInit(): void {
    this.prepareVatRateCodes();

    if (this.defaultDiscountPercent !== undefined) {
      this.data.invoiceDiscountPercent = HelperFunctions.ToFloat(this.defaultDiscountPercent)
    }

    if (this.OutGoingDelivery) {
      this.sumForm.addControl('workNumber', new FormControl(undefined, []));
      this.sumForm.addControl('priceReview', new FormControl(undefined, []));
    }

    this.sumForm.addControl('invoiceNetAmount', new FormControl(this.data.invoiceNetAmount, [Validators.required]));
    this.sumForm.addControl('discountedInvoiceNetAmount', new FormControl(this.data.invoiceNetAmount, [Validators.required]));

    this.vatRateCodes.forEach((row: VatRateRow, index: number) => {
      this.sumForm.addControl('vatRateFormControl-' + (index + ''), new FormControl(row.Value, [Validators.required]));
    });

    this.sumForm.addControl('lineGrossAmount', new FormControl(this.data.lineGrossAmount, [Validators.required]));
    this.sumForm.addControl('invoiceLinesCount', new FormControl(this.data.invoiceLines.length, [Validators.required]));
    this.sumForm.addControl('invoiceDiscountPercent', new FormControl({value: this.data.invoiceDiscountPercent, disabled: this.isDiscountDisabled }, [Validators.required]));
    this.sumForm.addControl('invoiceDiscountValue', new FormControl(0, [Validators.required]));

    this.formNav = new NavigatableForm(
      this.sumForm, this.kBs, this.cdrf, [], 'invoiceSaveForm', AttachDirection.UP, {} as IInlineManager
    );

    // We can move onto the confirmation buttons from the form.
    this.formNav.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;

    this.RefreshCalc();
  }

  ngAfterViewInit(): void {
    this.kBs.SetWidgetNavigatable(this);
    this.formNav.GenerateAndSetNavMatrices(true);

    if (this.isDiscountDisabled) {
      // select the next available input
      this.kBs.SelectElementByCoordinate(0, 1)
    }
    else {
      this.kBs.SelectFirstTile();
    }

    this.kBs.setEditMode(KeyboardModes.EDIT);

    setTimeout(() => {
      HelperFunctions.SelectBeginningByClass('discount-input', 10);
    }, 100);
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kBs.RemoveWidgetNavigatable();
    }
  }

  RefreshCalc(): void {
    this.recalc(this.sumForm.controls['invoiceDiscountPercent'].value ?? 0);
    this.customerLimitsChecked = false
  }

  async FocusSaveButton(): Promise<void> {
    await this.checkCustomerLimits()
    this.customerLimitsChecked = true
  }

  logi(msg: string): void {
    this.loggerService.info(msg, logTag)
  }

  close(answer: boolean) {
    if (answer && !this.loggedIn) {
      this.commonService.ShowErrorMessage(Constants.MSG_ERROR_USERDATA_NEEDED)
      return
    }

    this.handleClose(answer)
  }

  private handleClose(answer: boolean): void {
    if (this.OutGoingDelivery) {
      this.data.workNumber = this.sumForm.controls['workNumber'].value
      this.data.priceReview = this.sumForm.controls['priceReview'].value
    }
    this.closedManually = true
    this.kBs.RemoveWidgetNavigatable()
    this.dialogRef.close(answer ? this.data : undefined)
  }

  public handleAuthChange(event: AuthChangeEventArgs): void {
    this.loggedIn = event.loggedIn
    if (this.loggedIn) {
      this.data.userID = event.userID
    }
  }

  public handleAuthComponentReady(event?: any): void {
    this.formNav.GenerateAndSetNavMatrices(false)
  }
}
