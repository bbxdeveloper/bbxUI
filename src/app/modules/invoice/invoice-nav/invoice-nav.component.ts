import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { TileCssClass, AttachDirection, TileCssColClass, NavMatrixOrientation } from 'src/assets/model/navigation/Navigatable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { InvoiceService } from '../services/invoice.service';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { Invoice } from '../models/Invoice';
import { GetInvoicesParamListModel } from '../models/GetInvoicesParamListModel';
import { FlatDesignNoFormNavigatableTable } from 'src/assets/model/navigation/FlatDesignNoFormNavigatableTable';
import { BaseNoFormManagerComponent } from '../../shared/base-no-form-manager/base-no-form-manager.component';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { validDate } from 'src/assets/model/Validators';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { OfferNavKeySettings, GetFooterCommandListFromKeySettings, InvoiceNavKeySettings, Actions, KeyBindings } from 'src/assets/util/KeyBindings';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { IFunctionHandler } from 'src/assets/model/navigation/IFunctionHandler';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';

@Component({
  selector: 'app-invoice-nav',
  templateUrl: './invoice-nav.component.html',
  styleUrls: ['./invoice-nav.component.scss']
})
export class InvoiceNavComponent extends BaseManagerComponent<Invoice> implements IFunctionHandler, IInlineManager, OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  IsTableFocused: boolean = false;
  isDeleteDisabled: boolean = false;

  readonly ChosenIssueFilterOptionValue: string = '1';
  readonly ChosenDeliveryFilterOptionValue: string = '2';

  readonly SearchButtonId: string = 'stock-card-button-search';

  override allColumns = [
    'invoiceNumber',
    'warehouse',
    'customerName',
    'customerCity',
    'paymentMethodX',
    'invoiceDeliveryDate',
    'invoiceIssueDate',
    //'paymentDate',
    //'invoiceNetAmount',
    //'invoiceVatAmount',
    //'invoiceGrossAmount',
    'notice',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Számlaszám',
      objectKey: 'invoiceNumber',
      colKey: 'invoiceNumber',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '120px',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Raktár',
      objectKey: 'warehouse',
      colKey: 'warehouse',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Partner',
      objectKey: 'customerName',
      colKey: 'customerName',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '50%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Partner címe',
      objectKey: 'customerCity',
      colKey: 'customerCity',
      defaultValue: '',
      type: 'getter',
      fInputType: 'text',
      mask: '',
      colWidth: '50%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
      calc: (val: any) => {
        let invoice = val as Invoice;
        return invoice.customerPostalCode + ', ' + invoice.customerCity + 
          (!!invoice.customerAdditionalAddressDetail && invoice.customerAdditionalAddressDetail.length > 0 ?
            ', ' + invoice.customerAdditionalAddressDetail : '')
      }
    },
    {
      label: 'Fizetési mód',
      objectKey: 'paymentMethodX',
      colKey: 'paymentMethodX',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '65px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Teljesítés',
      objectKey: 'invoiceDeliveryDate',
      colKey: 'invoiceDeliveryDate',
      defaultValue: '',
      type: 'onlyDate',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kelt.',
      objectKey: 'invoiceIssueDate',
      colKey: 'invoiceIssueDate',
      defaultValue: '',
      type: 'onlyDate',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Fiz.hat.',
      objectKey: 'paymentDate',
      colKey: 'paymentDate',
      defaultValue: '',
      type: 'onlyDate',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Nettó érték',
      objectKey: 'invoiceNetAmount',
      colKey: 'invoiceNetAmount',
      defaultValue: '',
      type: 'formatted-number',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Áfás érték',
      objectKey: 'invoiceVatAmount',
      colKey: 'invoiceVatAmount',
      defaultValue: '',
      type: 'formatted-number',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Bruttó érték',
      objectKey: 'invoiceGrossAmount',
      colKey: 'invoiceGrossAmount',
      defaultValue: '',
      type: 'formatted-number',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megjegyzés',
      objectKey: 'notice',
      colKey: 'notice',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '110px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
  ];

  override get getInputParams(): GetInvoicesParamListModel {
    return {
      PageNumber: this.dbDataTable.currentPage,
      PageSize: parseInt(this.dbDataTable.pageSize),

      Incoming: this.filterForm.controls['Incoming'].value,

      WarehouseCode: HelperFunctions
        .ConvertChosenWareHouseToCode(this.filterForm.controls['WarehouseCode'].value, this.wh, ''),

      // Radio 1
      InvoiceIssueDateFrom: this.isIssueFilterSelected ?
        this.filterForm.controls['InvoiceIssueDateFrom'].value : null,
      InvoiceIssueDateTo: this.isIssueFilterSelected ?
        this.filterForm.controls['InvoiceIssueDateTo'].value : null,

      // Radio 2
      InvoiceDeliveryDateFrom: this.isDeliveryFilterSelected ?
        this.filterForm.controls['InvoiceDeliveryDateFrom'].value : null,
      InvoiceDeliveryDateTo: this.isDeliveryFilterSelected ?
        this.filterForm.controls['InvoiceDeliveryDateTo'].value : null,
    };
  }

  filterFormId = 'invoices-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: FlatDesignNoTableNavigatableForm;

  // WareHouse
  wh: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  get sumGrossAmount(): any {
    return this.dbData
      .map(x => x.data)
      .map(x => x.invoiceNetAmount ?? 0)
      .reduce((sum, current) => sum + current, 0)
      +
      this.dbData
        .map(x => x.data)
        .map(x => x.invoiceVatAmount ?? 0)
        .reduce((sum, current) => sum + current, 0);
  }

  get sumNetAmount(): any {
    return this.dbData
      .map(x => x.data)
      .map(x => x.invoiceNetAmount ?? 0)
      .reduce((sum, current) => sum + current, 0);
  }

  get sumVatAmount(): any {
    return this.dbData
      .map(x => x.data)
      .map(x => x.invoiceVatAmount ?? 0)
      .reduce((sum, current) => sum + current, 0);
  }

  readonly DefaultChosenDateFilter: string = '1';
  get chosenDateFilter(): string {
    return this.filterForm.controls['DateFilterChooser'].value ?? this.DefaultChosenDateFilter;
  }

  override KeySetting: Constants.KeySettingsDct = InvoiceNavKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  get isIssueFilterSelected(): boolean { return this.chosenDateFilter === this.ChosenIssueFilterOptionValue; }
  get isDeliveryFilterSelected(): boolean { return this.chosenDateFilter === this.ChosenDeliveryFilterOptionValue; }

  get isIssueFilterSelectedAndValid(): boolean {
    return this.isIssueFilterSelected
      && this.filterForm.controls['InvoiceIssueDateFrom'].value !== undefined && this.filterForm.controls['InvoiceIssueDateFrom'].value.length > 0
      && this.filterForm.controls['InvoiceIssueDateTo'].value !== undefined && this.filterForm.controls['InvoiceIssueDateTo'].value.length > 0
      && this.filterForm.controls['InvoiceIssueDateFrom'].valid && this.filterForm.controls['InvoiceIssueDateTo'].valid
      && this.filterForm.controls['Incoming'].valid && this.filterForm.controls['WarehouseCode'].valid;
  }

  get isDeliveryFilterSelectedAndValid(): boolean {
    return this.isDeliveryFilterSelected
      && this.filterForm.controls['InvoiceDeliveryDateFrom'].value !== undefined && this.filterForm.controls['InvoiceDeliveryDateFrom'].value.length > 0
      && this.filterForm.controls['InvoiceDeliveryDateTo'].value !== undefined && this.filterForm.controls['InvoiceDeliveryDateTo'].value.length > 0
      && this.filterForm.controls['InvoiceDeliveryDateFrom'].valid && this.filterForm.controls['InvoiceDeliveryDateTo'].valid
      && this.filterForm.controls['Incoming'].valid && this.filterForm.controls['WarehouseCode'].valid;
  }

  get invoiceIssueDateFromValue(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceIssueDateFrom'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }
  get invoiceIssueDateToValue(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceIssueDateTo'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get invoiceDeliveryDateFromValue(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceDeliveryDateFrom'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }
  get invoiceDeliveryDateToValue(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceDeliveryDateTo'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Invoice>>,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private simpleToastrService: BbxToastrService,
    private bbxToastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private invoiceService: InvoiceService,
    private wareHouseApi: WareHouseService,
    cs: CommonService,
    sts: StatusService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);

    this.refreshComboboxData();

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'invoices-table';
    this.dbDataTableEditId = 'invoices-cell-edit-input';

    this.kbS.ResetToRoot();

    this.Setup();
  }

  validateInvoiceIssueDateFrom(control: AbstractControl): any {
    if (this.invoiceIssueDateToValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) > this.invoiceIssueDateToValue;
    return wrong ? { maxDate: { value: control.value } } : null;
  }
  validateInvoiceIssueDateTo(control: AbstractControl): any {
    if (this.invoiceIssueDateFromValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) < this.invoiceIssueDateFromValue;
    return wrong ? { minDate: { value: control.value } } : null;
  }

  validateInvoiceDeliveryDateFrom(control: AbstractControl): any {
    if (this.invoiceDeliveryDateToValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) > this.invoiceDeliveryDateToValue;
    return wrong ? { maxDate: { value: control.value } } : null;
  }
  validateInvoiceDeliveryDateTo(control: AbstractControl): any {
    if (this.invoiceDeliveryDateFromValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) < this.invoiceDeliveryDateFromValue;
    return wrong ? { minDate: { value: control.value } } : null;
  }

  InitFormDefaultValues(): void {
    this.filterForm.controls['Incoming'].setValue(false);

    this.filterForm.controls['InvoiceIssueDateFrom'].setValue(HelperFunctions.GetDateString(0, 0, -1));
    this.filterForm.controls['InvoiceIssueDateTo'].setValue(HelperFunctions.GetDateString());
    this.filterForm.controls['InvoiceDeliveryDateFrom'].setValue(HelperFunctions.GetDateString());
    this.filterForm.controls['InvoiceDeliveryDateTo'].setValue(HelperFunctions.GetDateString());

    this.filterForm.controls['WarehouseCode'].setValue(this.wh[0]?.warehouseCode ?? '');

    this.filterForm.controls['DateFilterChooser'].setValue(this.DefaultChosenDateFilter);
  }

  private refreshComboboxData(): void {
    // WareHouse
    this.wareHouseApi.GetAll().subscribe({
      next: data => {
        this.wh = data?.data ?? [];
        this.wareHouseData$.next(this.wh.map(x => x.warehouseDescription));
      }
    });
  }

  ToInt(p: any): number {
    return parseInt(p + '');
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.filterForm = new FormGroup({
      Incoming: new FormControl(false, []),
      WarehouseCode: new FormControl(undefined, []),
      InvoiceIssueDateFrom: new FormControl(undefined, [
        this.validateInvoiceIssueDateFrom.bind(this),
        validDate
      ]),
      InvoiceIssueDateTo: new FormControl(undefined, [
        this.validateInvoiceIssueDateTo.bind(this),
        validDate
      ]),
      InvoiceDeliveryDateFrom: new FormControl(undefined, [
        this.validateInvoiceDeliveryDateFrom.bind(this),
        validDate
      ]),
      InvoiceDeliveryDateTo: new FormControl(undefined, [
        this.validateInvoiceDeliveryDateTo.bind(this),
        validDate
      ]),
      DateFilterChooser: new FormControl(1, [])
    });

    this.filterForm.controls['DateFilterChooser'].valueChanges.subscribe({
      next: newValue => {
        console.log('DateFilterChooser value changed: ', newValue);
        let x = this.kbS.p.x;
        let y = this.kbS.p.y;
        setTimeout(() => {
          this.filterFormNav.GenerateAndSetNavMatrices(false, true, NavMatrixOrientation.ONLY_HORIZONTAL);
          this.kbS.SelectElementByCoordinate(x, y);
        }, 200);
      }
    });

    this.filterForm.controls['InvoiceIssueDateFrom'].valueChanges.subscribe({
      next: newValue => {
        console.log('InvoiceIssueDateFrom value changed: ', newValue);
        if (!this.filterForm.controls['InvoiceIssueDateTo'].valid && this.filterForm.controls['InvoiceIssueDateFrom'].valid) {
          this.filterForm.controls['InvoiceIssueDateTo'].setValue(this.filterForm.controls['InvoiceIssueDateTo'].value);
        }
      }
    });

    this.filterForm.controls['InvoiceIssueDateTo'].valueChanges.subscribe({
      next: newValue => {
        console.log('InvoiceIssueDateTo value changed: ', newValue);
        if (!this.filterForm.controls['InvoiceIssueDateFrom'].valid && this.filterForm.controls['InvoiceIssueDateTo'].valid) {
          this.filterForm.controls['InvoiceIssueDateFrom'].setValue(this.filterForm.controls['InvoiceIssueDateFrom'].value);
        }
      }
    });

    this.filterForm.controls['InvoiceDeliveryDateFrom'].valueChanges.subscribe({
      next: newValue => {
        console.log('InvoiceDeliveryDateFrom value changed: ', newValue);
        if (!this.filterForm.controls['InvoiceDeliveryDateTo'].valid && this.filterForm.controls['InvoiceDeliveryDateFrom'].valid) {
          this.filterForm.controls['InvoiceDeliveryDateTo'].setValue(this.filterForm.controls['InvoiceDeliveryDateTo'].value);
        }
      }
    });

    this.filterForm.controls['InvoiceDeliveryDateTo'].valueChanges.subscribe({
      next: newValue => {
        console.log('InvoiceDeliveryDateTo value changed: ', newValue);
        if (!this.filterForm.controls['InvoiceDeliveryDateFrom'].valid && this.filterForm.controls['InvoiceDeliveryDateTo'].valid) {
          this.filterForm.controls['InvoiceDeliveryDateFrom'].setValue(this.filterForm.controls['InvoiceDeliveryDateFrom'].value);
        }
        this.filterForm.controls['InvoiceDeliveryDateFrom'].markAsDirty();
        this.cdref.detectChanges();
      }
    });

    this.InitFormDefaultValues();

    this.filterFormNav = new FlatDesignNoTableNavigatableForm(
      this.filterForm,
      this.kbS,
      this.cdref, [], this.filterFormId,
      AttachDirection.DOWN,
      this.colDefs,
      this.bbxSidebarService,
      this.fS,
      this.dbDataTable,
      this
    );

    this.dbDataTableForm = new FormGroup({
      invoiceNumber: new FormControl(0, []),
      warehouse: new FormControl(undefined, []),
      customerName: new FormControl(undefined, []),
      customerCity: new FormControl(undefined, []),
      paymentMethodX: new FormControl(undefined, []),
      invoiceDeliveryDate: new FormControl(undefined, []),
      invoiceIssueDate: new FormControl(undefined, []),
      paymentDate: new FormControl(undefined, []),
      invoiceNetAmount: new FormControl(undefined, []),
      invoiceVatAmount: new FormControl(undefined, []),
      invoiceGrossAmount: new FormControl(undefined, []),
      notice: new FormControl(undefined, [])
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'InvoiceNav',
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.RIGHT,
      this.bbxSidebarService,
      this.sidebarFormService,
      this,
      () => {
        return {} as Invoice;
      },
      false
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.NewPageSelected.subscribe({
      next: () => {
        this.Refresh(this.getInputParams);
      },
    });
    this.dbDataTable.flatDesignForm.commandsOnForm = this.commands;

    this.filterFormNav!.OuterJump = true;
    this.dbDataTable!.OuterJump = true;

    this.RefreshAll(this.getInputParams);
  }

  override Refresh(params?: GetInvoicesParamListModel): void {
    console.log('Refreshing: ', params); // TODO: only for debug
    this.isLoading = true;
    this.invoiceService.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetProducts response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable();
        } else {
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
      },
      error: (err) => {
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    console.log("[ngAfterViewInit]");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    $('*[type=radio]').addClass(TileCssClass);
    $('*[type=radio]').on('click', (event) => {
      this.filterFormNav.HandleFormFieldClick(event);
    });

    this.filterFormNav.GenerateAndSetNavMatrices(true, true, NavMatrixOrientation.ONLY_HORIZONTAL);
    this.AddSearchButtonToFormMatrix();

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.ReadonlyFormByDefault = true;

    this.filterFormNav.DownNeighbour = this.dbDataTable;

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  private AddSearchButtonToFormMatrix(): void {
    this.filterFormNav.Matrix[this.filterFormNav.Matrix.length - 1].push(this.SearchButtonId);
  }

  private RefreshAll(params?: GetInvoicesParamListModel): void {
    // WareHouses
    this.wareHouseApi.GetAll().subscribe({
      next: (data) => {
        if (!!data.data) this.wh = data.data;
      },
      error: (err) => {
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        this.Refresh(params);
      },
    });
  }

  RefreshData(): void { }
  TableRowDataChanged(changedData?: any, index?: number, col?: string): void { }
  RecalcNetAndVat(): void { }

  HandleFunctionKey(event: Event | KeyBindings): void {
    const val = event instanceof Event ? (event as KeyboardEvent).code : event;
    console.log(`[HandleFunctionKey]: ${val}`);
    switch (val) {
      // NEW
      case this.KeySetting[Actions.CrudNew].KeyCode:
        break;
      // EDIT
      case this.KeySetting[Actions.CrudEdit].KeyCode:
        break;
      // DELETE
      case this.KeySetting[Actions.CrudDelete].KeyCode:
      case this.KeySetting[Actions.CrudDelete].AlternativeKeyCode:
        break;
    }
  }

  Create(): void { }

  Edit(): void { }

  Delete(): void { }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.filterFormNav?.HandleFormShiftEnter(event)
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      case this.KeySetting[Actions.CrudNew].KeyCode:
      case this.KeySetting[Actions.CrudEdit].KeyCode:
      case this.KeySetting[Actions.CrudDelete].KeyCode:
      case this.KeySetting[Actions.CrudDelete].AlternativeKeyCode:
      case this.KeySetting[Actions.JumpToForm].KeyCode:
      // case this.KeySetting[Actions.CSV].KeyCode:
      // case this.KeySetting[Actions.Email].KeyCode:
      // case this.KeySetting[Actions.Details].KeyCode:
      // case this.KeySetting[Actions.CrudReset].KeyCode:
      // case this.KeySetting[Actions.CrudSave].KeyCode:
      // case this.KeySetting[Actions.Print].KeyCode:
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.HandleFunctionKey(event);
        break;
    }
  }

  ChooseDataForTableRow(rowIndex: number): void { }
  ChooseDataForForm(): void {}
}
