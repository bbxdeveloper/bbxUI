import { AfterContentInit, AfterViewChecked, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { OutGoingInvoiceFullData } from '../models/CreateOutgoingInvoiceRequest';
import { createMask } from '@ngneat/input-mask';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

const NavMap: string[][] = [
  ['active-prod-search', 'show-all', 'show-less']
];

interface VatRateRow { Id: string, Value: number };

@Component({
  selector: 'app-save-dialog',
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.scss']
})
export class SaveDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked {
  @Input() data!: OutGoingInvoiceFullData;

  numberInputMask: any = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0.0',
  });

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  closedManually: boolean = false;
  isLoading: boolean = true;

  sumForm: FormGroup;
  sumFormId: string = "outgoing-invoice-form";

  vatRateCodes: VatRateRow[] = [];

  constructor(
    protected dialogRef: NbDialogRef<SaveDialogComponent>,
    private kBs: KeyboardNavigationService
  ) {
    super();
    this.Setup();

    this.sumForm = new FormGroup({});
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button-yes", "confirm-dialog-button-no"]];
  }

  private prepareVatRateCodes(): void {
    var result: VatRateRow[] = [];
    this.data.invoiceLines.forEach(x => {
      if (!!x.vatRateCode){
        const resultIndex = result.findIndex(y => y.Id === x.vatRateCode);
        if (result.findIndex(y => y.Id === x.vatRateCode) !== -1) {
          result[resultIndex].Value += x.lineVatAmount;
        } else {
          result.push({ Id: x.vatRateCode, Value: x.lineVatAmount } as VatRateRow);
        }
      }
    });
    result.forEach(x => {
      x.Value = HelperFunctions.Round(x.Value);
    });
    this.vatRateCodes = result;
  }

  ngAfterContentInit(): void {
    this.prepareVatRateCodes();
    const vatRateRowCount = this.vatRateCodes.length;

    this.sumForm.addControl('invoiceNetAmount', new FormControl(this.data.invoiceNetAmount, [Validators.required]));

    this.vatRateCodes.forEach((row: VatRateRow, index: number) => {
      this.sumForm.addControl('vatRateFormControl-' + (index + ''), new FormControl(row.Value, [Validators.required]));
    });

    this.sumForm.addControl('lineGrossAmount', new FormControl(this.data.lineGrossAmount, [Validators.required]));
    this.sumForm.addControl('invoiceLinesCount', new FormControl(this.data.invoiceLines.length, [Validators.required]));

    this.kBs.SetWidgetNavigatable(this);
    this.kBs.setEditMode(KeyboardModes.NAVIGATION);
    this.kBs.SelectFirstTile();
  }
  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kBs.RemoveWidgetNavigatable();
    }
  }
  ngAfterViewChecked(): void {
  }

  close(answer: boolean) {
    this.closedManually = true;
    this.kBs.RemoveWidgetNavigatable();
    this.dialogRef.close(answer);
  }
}
