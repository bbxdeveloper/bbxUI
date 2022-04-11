import { AfterContentInit, AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { SelectedCell } from 'src/assets/model/navigation/SelectedCell';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CustomerService } from '../../customer/services/customer.service';
import { SelectTableDialogComponent } from '../../shared/select-table-dialog/select-table-dialog.component';

import { AfterViewInit, HostListener, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NbTable, NbSortDirection, NbDialogService, NbToastrService } from '@nebular/theme';
import { Observable, of, startWith, map } from 'rxjs';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { NavigatableForm as InlineTableNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { maxDate, minDate, todaysDate } from 'src/assets/model/Validators';
import { Product } from '../../product/models/Product';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { CustomerSelectTableDialogComponent } from '../customer-select-table-dialog/customer-select-table-dialog.component';
import { CreateOutgoingInvoiceRequest } from '../models/CreateOutgoingInvoiceRequest';
import { InvoiceLine } from '../models/InvoiceLine';
import { PaymentMethod } from '../models/PaymentMethod';
import { ProductSelectTableDialogComponent } from '../product-select-table-dialog/product-select-table-dialog.component';
import { InvoiceService } from '../services/invoice.service';
import { createMask } from '@ngneat/input-mask';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { SumData } from '../models/SumData';

const NavMap: string[][] = [
  ['active-prod-search', 'show-all', 'show-less']
];

@Component({
  selector: 'app-save-dialog',
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.scss']
})
export class SaveDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked {
  @Input() data!: CreateOutgoingInvoiceRequest;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  closedManually: boolean = false;
  isLoading: boolean = true;

  sumForm: FormGroup;
  sumFormId: string = "outgoing-invoice-form";

  constructor(
    protected dialogRef: NbDialogRef<SaveDialogComponent>,
    private kBs: KeyboardNavigationService
  ) {
    super();
    this.Setup();

    this.sumForm = new FormGroup({
      invoiceNetAmount: new FormControl('', [Validators.required]),
      invoiceVatAmount: new FormControl('', [Validators.required]),
      lineGrossAmount: new FormControl('', [Validators.required]),
      invoiceLinesCount: new FormControl('', [Validators.required]),
    });
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button-yes", "confirm-dialog-button-no"]];
  }

  ngAfterContentInit(): void {
    this.sumForm.controls['invoiceNetAmount'].setValue(this.data.invoiceNetAmount);
    this.sumForm.controls['invoiceVatAmount'].setValue(this.data.invoiceVatAmount);
    this.sumForm.controls['lineGrossAmount'].setValue(this.data.lineGrossAmount);
    this.sumForm.controls['invoiceLinesCount'].setValue(this.data.invoiceLines.length);

    this.kBs.SetWidgetNavigatable(this);
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
