import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NbDialogRef, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { createMask } from '@ngneat/input-mask';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { BlankComboBoxValue } from 'src/assets/model/navigation/Nav';
import { TileCssClass, TileCssColClass, AttachDirection, NavigatableType } from 'src/assets/model/navigation/Navigatable';
import { Constants } from 'src/assets/util/Constants';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseNavigatableComponentComponent } from '../../base-navigatable-component/base-navigatable-component.component';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { FlatDesignNoFormNavigatableTable } from 'src/assets/model/navigation/FlatDesignNoFormNavigatableTable';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdater } from 'src/assets/model/UpdaterInterfaces';
import { Invoice } from 'src/app/modules/invoice/models/Invoice';
import { InvoiceLine } from 'src/app/modules/invoice/models/InvoiceLine';
import { InvoiceService } from 'src/app/modules/invoice/services/invoice.service';

@Component({
  selector: 'app-invoice-lines-dialog',
  templateUrl: './invoice-lines-dialog.component.html',
  styleUrls: ['./invoice-lines-dialog.component.scss']
})
export class InvoiceLinesDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked, AfterViewInit {
  @Input() invoice?: Invoice

  //#region Table

  allColumns: string[] = [
    'productCode',
    'lineDescription',
    'quantity',
    'unitOfMeasure',
    'unitPrice',
    'lineNetAmount',
    'lineVatAmount',
    'lineGrossAmountNormal'
  ]
  colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Termékkód', objectKey: 'productCode', colKey: 'productCode',
      defaultValue: '', type: 'string', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "200px", textAlign: "left", fInputType: ''
    },
    {
      label: 'Terméknév', objectKey: 'lineDescription', colKey: 'lineDescription',
      defaultValue: '', type: 'string', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "350px", textAlign: "left", fInputType: ''
    },
    {
      label: 'Mennyiség', objectKey: 'quantity', colKey: 'quantity',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "100px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Me.e.', objectKey: 'unitOfMeasure', colKey: 'unitOfMeasure',
      defaultValue: '', type: 'string', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "70px", textAlign: "left", fInputType: ''
    },
    {
      label: 'Ár', objectKey: 'unitPrice', colKey: 'unitPrice',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Nettó', objectKey: 'lineNetAmount', colKey: 'lineNetAmount',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Áfa', objectKey: 'lineVatAmount', colKey: 'lineVatAmount',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Bruttó', objectKey: 'lineGrossAmountNormal', colKey: 'lineGrossAmountNormal',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    }
  ]
  dbData!: TreeGridNode<InvoiceLine>[];
  dbDataSource!: NbTreeGridDataSource<TreeGridNode<InvoiceLine>>;
  dbDataTable!: FlatDesignNoFormNavigatableTable<InvoiceLine>;
  selectedRow!: InvoiceLine;
  dbDataTableForm!: FormGroup;
  dbDataTableId: string = 'dialog-invoice-lines';
  trackRows(index: number, row: any) {
    return row.uid;
  }
  private uid = 0;
  protected nextUid() {
    ++this.uid;
    return this.uid;
  }
  tableIsFocused: boolean = false

  //#endregion Table

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  override NavigatableType = NavigatableType.dialog

  public get saveIsDisabled(): boolean {
    if (this._form !== undefined && this._form.form !== undefined) {
      return this._form.form.invalid;
    } else {
      return true;
    }
  }

  customPatterns: any = {
    A: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä]') },
    C: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä]') }
  };

  numberInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0',
  });

  numberInputMaskInteger = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 0,
    digitsOptional: true,
    prefix: '',
    placeholder: '0',
  });

  blankOptionText: string = BlankComboBoxValue;
  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  closedManually: boolean = false;
  isLoading: boolean = true;

  _form?: FlatDesignNoTableNavigatableForm;
  dataForm: FormGroup;
  sumFormId: string = "InvoiceItemsDialogComponentForm";

  constructor(
    private bbxsb: BbxSidebarService,
    private cdref: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<InvoiceLinesDialogComponent>,
    private kbS: KeyboardNavigationService,
    private fs: FooterService,
    private sts: StatusService,
    private bbxToastrService: BbxToastrService,
    private invoiceService: InvoiceService,
    private tokenService: TokenStorageService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvoiceLine>>,
    private sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private fS: FooterService
  ) {
    super();

    this.Setup();

    this.dataForm = new FormGroup({
      invoiceNumber: new FormControl(undefined, []),
      supplierName: new FormControl(undefined, []),
      invoiceIssueDate: new FormControl(undefined, []),
      invoiceDeliveryDate: new FormControl(undefined, []),
      paymentDate: new FormControl(undefined, [])
    });

    this.dbDataTableForm = new FormGroup({});
    this.dbDataTable = new FlatDesignNoFormNavigatableTable(
      this.dbDataTableForm,
      'InvoiceLine',
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.UP,
      this.sidebarService,
      this.sidebarFormService,
      {} as IUpdater<InvoiceLine>,
      () => {
        return {} as InvoiceLine;
      }
    )
    this.dbDataTable.InnerJumpOnEnter = true;
    this.dbDataTable.OuterJump = true;
  }

  focusOnTable(focusIn: boolean): void {
    this.tableIsFocused = focusIn;
    if (focusIn) {
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button-close"]];
  }

  RefreshTable(selectAfterRefresh?: any, setAsCurrent: boolean = false): void {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataSource,
      this.allColumns,
      this.colDefs,
      [],
      undefined
    )
  }

  async loadInvoiceLines(): Promise<void> {
    this.sts.waitForLoad(true)

    const wareHouse = this.tokenService.wareHouse

    if (!wareHouse) {
      this.bbxToastrService.showError(Constants.MSG_ERROR_NO_WAREHOUSE_SELECTED)
      this.sts.waitForLoad(false)
      return
    }

    if (!this.invoice) {
      this.bbxToastrService.showError(Constants.MSG_ERROR_NO_PRODUCT_SELECTED)
      this.sts.waitForLoad(false)
      return
    }

    this.invoice = await this.invoiceService.Get({ id: this.invoice.id, fullData: true })

    this.dataForm.patchValue(this.invoice)
    this.dataForm.controls["supplierName"].setValue(this.invoice.incoming ? this.invoice.supplierName : this.invoice.customerName)

    this.fillInvoiceLinesTable()

    this.sts.waitForLoad(false)
  }

  private fillInvoiceLinesTable(): void {
    this.dbData = []
    this.dbDataSource = this.dataSourceBuilder.create(this.dbData)
    this.selectedRow = {} as InvoiceLine

    const invoiceLines = this.invoice!.invoiceLines
    const tempData = invoiceLines.map((x) => {
      return { data: x, uid: this.nextUid() };
    });

    this.dbData = tempData;
    this.dbDataSource.setData(this.dbData);
    this.RefreshTable()
  }

  override ngOnInit(): void {
  }
  ngAfterContentInit(): void { }
  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }
  ngAfterViewChecked(): void {
  }
  async ngAfterViewInit(): Promise<void> {
    this.kbS.SetWidgetNavigatable(this);
    this.SetNewForm(this.dataForm);

    this.kbS.SelectFirstTile()

    // We can move onto the confirmation buttons from the form.
    this._form!.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;

    await this.loadInvoiceLines()

    this.kbS.SelectFirstTile()
  }

  private SetNewForm(form?: FormGroup): void {
    this._form = new FlatDesignNoTableNavigatableForm(
      this.dataForm,
      this.kbS,
      this.cdref,
      [],
      this.sumFormId,
      AttachDirection.UP,
      [],
      this.bbxsb,
      this.fs
    );
    this._form.IsFootersEnabled = false;

    console.log("[SetNewForm] ", this._form); // TODO: only for debug

    this.cdref.detectChanges();
  }

  close() {
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable();
    this.dialogRef.close(undefined);
  }

  moveCursor(codeInput: any): void {
    setTimeout(function () {
      codeInput.setSelectionRange(0, 0);
    }, 100);
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.key == KeyBindings.exit || event.key == KeyBindings.exitIE) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      this.close()
    }
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this._form?.HandleFormShiftEnter(event)
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
  }
}
