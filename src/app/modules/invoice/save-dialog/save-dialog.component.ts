import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
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

const NavMap: string[][] = [
  ['active-prod-search', 'show-all', 'show-less']
];

interface VatRateRow { Id: string, Value: number };

@Component({
  selector: 'app-save-dialog',
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.scss']
})
export class SaveDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, AfterContentInit, OnDestroy, OnInit, AfterViewChecked {
  @Input() data!: OutGoingInvoiceFullData;

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

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<SaveDialogComponent>,
    private kBs: KeyboardNavigationService
  ) {
    super();
    this.Setup();

    this.sumForm = new FormGroup({});
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
      x.Value = HelperFunctions.Round(x.Value);
    });
    this.vatRateCodes = result;
  }

  private recalc(actualDiscount: number): void {
    // update discount
    this.data.invoiceDiscountPercent = actualDiscount;
    const invoiceDiscountMultiplier = HelperFunctions.Round2(actualDiscount / 100, 1);
    // this.sumForm.controls['invoiceDiscountPercent'].setValue(this.data.invoiceDiscountPercent);

    // calc rate summary + prepare discountedData for lines
    this.prepareVatRateCodes(invoiceDiscountMultiplier);

    // discountedInvoiceNetAmount
    let discountedInvoiceNetAmount =
      this.data.invoiceLines
        .map(x => HelperFunctions.ToFloat(x.discountedData!.lineNetAmount))
        .reduce((sum, current) => sum + current, 0);
    discountedInvoiceNetAmount = HelperFunctions.Round2(discountedInvoiceNetAmount, 1);
    
    const invoiceDiscountValue = this.data.invoiceNetAmount - discountedInvoiceNetAmount;
    
    console.log("invoice net: ", this.data.invoiceNetAmount, ", discounted: ", discountedInvoiceNetAmount, ", discount percent: ", invoiceDiscountMultiplier, ", discount value: ", invoiceDiscountValue);

    // const discountedInvoiceNetAmount = this.data.invoiceNetAmount - invoiceDiscountValue;
    this.sumForm.controls['invoiceDiscountValue'].setValue(invoiceDiscountValue);
    this.sumForm.controls['discountedInvoiceNetAmount'].setValue(discountedInvoiceNetAmount);

    // discounted vat amount
    // refresh invoice stats
    const discountedVatAmount =
      this.data.invoiceLines
        .map(x => HelperFunctions.ToFloat(x.discountedData!.lineVatAmount))
        .reduce((sum, current) => sum + current, 0);

    let discountedGross = discountedInvoiceNetAmount + discountedVatAmount;

    if (this.data.paymentMethod === "CASH" && this.data.currencyCode === CurrencyCodes.HUF) {
      discountedGross = HelperFunctions.CashRound(discountedGross);
    } else {
      discountedGross = HelperFunctions.Round(discountedGross);
    }

    // rates
    this.vatRateCodes.forEach((row: VatRateRow, index: number) => {
      this.sumForm.controls['vatRateFormControl-' + (index + '')].setValue(row.Value);
    });

    // gross, linecount
    this.sumForm.controls['lineGrossAmount'].setValue(discountedGross);
    this.sumForm.controls['invoiceLinesCount'].setValue(this.data.invoiceLines.length);
  }

  ngAfterContentInit(): void {
    this.prepareVatRateCodes();

    this.sumForm.addControl('invoiceNetAmount', new FormControl(this.data.invoiceNetAmount, [Validators.required]));
    this.sumForm.addControl('discountedInvoiceNetAmount', new FormControl(this.data.invoiceNetAmount, [Validators.required]));

    this.vatRateCodes.forEach((row: VatRateRow, index: number) => {
      this.sumForm.addControl('vatRateFormControl-' + (index + ''), new FormControl(row.Value, [Validators.required]));
    });

    this.sumForm.addControl('lineGrossAmount', new FormControl(this.data.lineGrossAmount, [Validators.required]));
    this.sumForm.addControl('invoiceLinesCount', new FormControl(this.data.invoiceLines.length, [Validators.required]));
    this.sumForm.addControl('invoiceDiscountPercent', new FormControl(this.data.invoiceDiscountPercent, [Validators.required]));
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
    this.kBs.SelectFirstTile();
    this.kBs.setEditMode(KeyboardModes.EDIT);
    setTimeout(() => {
      HelperFunctions.SelectBeginningByClass('discount-input', 1);
    }, 100);
  }
  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kBs.RemoveWidgetNavigatable();
    }
  }
  ngAfterViewChecked(): void {
  }

  RefreshCalc(): void {
    this.recalc(this.sumForm.controls['invoiceDiscountPercent'].value ?? 0);
  }

  close(answer: boolean) {
    this.closedManually = true;
    this.kBs.RemoveWidgetNavigatable();
    this.dialogRef.close(answer ? this.data : undefined);
  }
}
