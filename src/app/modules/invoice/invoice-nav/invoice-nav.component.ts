import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { validDate } from 'src/assets/model/Validators';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { GetFooterCommandListFromKeySettings, InvoiceNavKeySettings, Actions, KeyBindings } from 'src/assets/util/KeyBindings';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { IFunctionHandler } from 'src/assets/model/navigation/IFunctionHandler';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { InvoiceNavFilter } from '../models/InvoiceNavFilter';
import { SystemService } from '../../system/services/system.service';
import { InvoiceType } from '../../system/models/InvoiceType';

@Component({
  selector: 'app-invoice-nav',
  templateUrl: './invoice-nav.component.html',
  styleUrls: ['./invoice-nav.component.scss']
})
export class InvoiceNavComponent extends BaseManagerComponent<Invoice> implements IFunctionHandler, IInlineManager, OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;

  private readonly localStorageKey: string

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  IsTableFocused: boolean = false;
  isDeleteDisabled: boolean = false;

  readonly ChosenIssueFilterOptionValue: string = '1';
  readonly ChosenDeliveryFilterOptionValue: string = '2';

  override allColumns = [
    'invoiceNumber',
    'warehouse',
    'customerName',
    'paymentMethodX',
    'invoiceDeliveryDate',
    'invoiceIssueDate',
    'invoiceNetAmount',
    'invoiceVatAmount',
    'invoiceGrossAmount',
    'notice',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Bizonylatszám',
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
      colWidth: '37%',
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
      colWidth: '85px',
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
      label: 'Áfa értéke',
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
      colWidth: '13%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
  ];

  override get getInputParams(): GetInvoicesParamListModel {
    const controls = this.filterForm.controls
    return {
      PageNumber: this.dbDataTable.currentPage,
      PageSize: parseInt(this.dbDataTable.pageSize),

      InvoiceType: this.invoiceTypes.find(x => x.text === controls['InvoiceType'].value)?.value ?? '',

      WarehouseCode: HelperFunctions
        .ConvertChosenWareHouseToCode(controls['WarehouseCode'].value, this.warehouses, ''),

      // Radio 1
      InvoiceIssueDateFrom: this.isIssueFilterSelected ? controls['InvoiceIssueDateFrom'].value : null,
      InvoiceIssueDateTo: this.isIssueFilterSelected ? controls['InvoiceIssueDateTo'].value : null,

      // Radio 2
      InvoiceDeliveryDateFrom: this.isDeliveryFilterSelected ? controls['InvoiceDeliveryDateFrom'].value : null,
      InvoiceDeliveryDateTo: this.isDeliveryFilterSelected ? controls['InvoiceDeliveryDateTo'].value : null,
      OrderBy: 'InvoiceNumber'
    };
  }

  filterFormId = 'invoices-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: FlatDesignNoTableNavigatableForm;

  // WareHouse
  warehouses: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  invoiceTypes: InvoiceType[] = []
  invoiceTypes$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])

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
    const controls = this.filterForm.controls

    return this.isIssueFilterSelected
      && controls['InvoiceIssueDateFrom'].value !== undefined && controls['InvoiceIssueDateFrom'].value.length > 0
      && controls['InvoiceIssueDateTo'].value !== undefined && controls['InvoiceIssueDateTo'].value.length > 0
      && controls['InvoiceIssueDateFrom'].valid && controls['InvoiceIssueDateTo'].valid
      && controls['InvoiceType'].valid && controls['WarehouseCode'].valid;
  }

  get isDeliveryFilterSelectedAndValid(): boolean {
    const controls = this.filterForm.controls

    return this.isDeliveryFilterSelected
      && controls['InvoiceDeliveryDateFrom'].value !== undefined && controls['InvoiceDeliveryDateFrom'].value.length > 0
      && controls['InvoiceDeliveryDateTo'].value !== undefined && controls['InvoiceDeliveryDateTo'].value.length > 0
      && controls['InvoiceDeliveryDateFrom'].valid && controls['InvoiceDeliveryDateTo'].valid
      && controls['InvoiceType'].valid && controls['WarehouseCode'].valid;
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
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Invoice>>,
    private readonly cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private readonly simpleToastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private readonly sidebarFormService: SideBarFormService,
    private readonly invoiceService: InvoiceService,
    private readonly wareHouseApi: WareHouseService,
    cs: CommonService,
    sts: StatusService,
    private readonly keyboardHelperService: KeyboardHelperService,
    tokenStorage: TokenStorageService,
    private readonly localStorage: LocalStorageService,
    private readonly systemService: SystemService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'invoices-table';
    this.dbDataTableEditId = 'invoices-cell-edit-input';

    this.localStorageKey = 'invoiceNavKey.' + tokenStorage.user?.id ?? 'for-everyone'

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


  ToInt(p: any): number {
    return parseInt(p + '');
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.setupFilterForm()

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
    // this.dbDataTable.NewPageSelected.subscribe({
    //   next: () => {
    //     this.Refresh(this.getInputParams);
    //   },
    // });
    this.dbDataTable.flatDesignForm.commandsOnForm = this.commands;

    this.filterFormNav!.OuterJump = true;
    this.dbDataTable!.OuterJump = true;

  }

  private setupFilterForm(): void {
    let filterData = this.localStorage.get<InvoiceNavFilter>(this.localStorageKey)

    if (!filterData) {
      filterData = InvoiceNavFilter.create()
    }

    this.filterForm = new FormGroup({
      InvoiceType: new FormControl(filterData.invoiceType, [Validators.required]),
      WarehouseCode: new FormControl(filterData.warehouseCode, []),
      InvoiceIssueDateFrom: new FormControl(filterData.invoiceIssueDateFrom, [
        this.validateInvoiceIssueDateFrom.bind(this),
        validDate
      ]),
      InvoiceIssueDateTo: new FormControl(filterData.invoiceIssueDateTo, [
        this.validateInvoiceIssueDateTo.bind(this),
        validDate
      ]),
      InvoiceDeliveryDateFrom: new FormControl(filterData.invoiceDeliveryDateFrom, [
        this.validateInvoiceDeliveryDateFrom.bind(this),
        validDate
      ]),
      InvoiceDeliveryDateTo: new FormControl(filterData.invoiceDeliveryDateTo, [
        this.validateInvoiceDeliveryDateTo.bind(this),
        validDate
      ]),
      DateFilterChooser: new FormControl(filterData.dateFilterChooser, [])
    });

    this.filterForm.valueChanges.subscribe(value => {
      const filterData = {
        invoiceType: value.InvoiceType,
        warehouseCode: value.WarehouseCode,
        invoiceIssueDateFrom: value.InvoiceIssueDateFrom,
        invoiceIssueDateTo: value.InvoiceIssueDateTo,
        invoiceDeliveryDateFrom: value.InvoiceDeliveryDateFrom,
        invoiceDeliveryDateTo: value.InvoiceDeliveryDateTo,
        dateFilterChooser: value.DateFilterChooser,
      } as InvoiceNavFilter

      this.localStorage.put(this.localStorageKey, filterData)
    })

    this.filterForm.controls['DateFilterChooser'].valueChanges.subscribe({
      next: newValue => {
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
        if (!this.filterForm.controls['InvoiceIssueDateTo'].valid && this.filterForm.controls['InvoiceIssueDateFrom'].valid) {
          this.filterForm.controls['InvoiceIssueDateTo'].setValue(this.filterForm.controls['InvoiceIssueDateTo'].value);
        }
      }
    });

    this.filterForm.controls['InvoiceIssueDateTo'].valueChanges.subscribe({
      next: newValue => {
        if (!this.filterForm.controls['InvoiceIssueDateFrom'].valid && this.filterForm.controls['InvoiceIssueDateTo'].valid) {
          this.filterForm.controls['InvoiceIssueDateFrom'].setValue(this.filterForm.controls['InvoiceIssueDateFrom'].value);
        }
      }
    });

    this.filterForm.controls['InvoiceDeliveryDateFrom'].valueChanges.subscribe({
      next: newValue => {
        if (!this.filterForm.controls['InvoiceDeliveryDateTo'].valid && this.filterForm.controls['InvoiceDeliveryDateFrom'].valid) {
          this.filterForm.controls['InvoiceDeliveryDateTo'].setValue(this.filterForm.controls['InvoiceDeliveryDateTo'].value);
        }
      }
    });

    this.filterForm.controls['InvoiceDeliveryDateTo'].valueChanges.subscribe({
      next: newValue => {
        if (!this.filterForm.controls['InvoiceDeliveryDateFrom'].valid && this.filterForm.controls['InvoiceDeliveryDateTo'].valid) {
          this.filterForm.controls['InvoiceDeliveryDateFrom'].setValue(this.filterForm.controls['InvoiceDeliveryDateFrom'].value);
        }
        this.filterForm.controls['InvoiceDeliveryDateFrom'].markAsDirty();
        this.cdref.detectChanges();
      }
    });
  }

  override async Refresh(): Promise<void> {
    this.isLoading = true;

    try {
      const response = await this.invoiceService.getAllAsync(this.getInputParams)

      if (response && response.succeeded && !!response.data) {
        const tempData = response.data.map((x) => {
          return { data: x, uid: this.nextUid() };
        });
        this.dbData = tempData;
        this.dbDataDataSrc.setData(this.dbData);
        this.dbDataTable.SetPaginatorData(response);

        this.RefreshTable();

        await this.getAndSetWarehouses()
      } else {
        this.simpleToastrService.show(
          response.errors!.join('\n'),
          Constants.TITLE_ERROR,
          Constants.TOASTR_ERROR
        );
      }
    }
    catch (error) {
      this.cs.HandleError(error);
    }
    finally {
      this.isLoading = false
    }
  }

  private async getAndSetWarehouses(): Promise<void> {
    try {
      const response = await this.wareHouseApi.GetAllPromise();
      if (!!response && !!response.data) {
        this.warehouses = response.data;
        this.wareHouseData$.next(this.warehouses.map(x => x.warehouseDescription));
      }
    }
    catch (error) {
      this.cs.HandleError(error);
      this.isLoading = false;
    }
  }

  private async getAndSetInvoiceTypes(): Promise<void> {
    try {
      const invoiceTypes = await this.systemService.getInvoiceTypes()

      if (invoiceTypes) {
        this.invoiceTypes = invoiceTypes
        this.invoiceTypes$.next(invoiceTypes.map(x => x.text))

        this.filterForm.controls['InvoiceType'].setValue(invoiceTypes.find(x => x.value === 'INV')?.text ?? '')
      }
    }
    catch (error) {
      this.cs.HandleError(error)
    }
  }

  private navigateToTable() {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)
    this.kbS.SetCurrentNavigatable(this.dbDataTable)
    this.kbS.SelectElementByCoordinate(0, 0)
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)
  }

  public async ngOnInit(): Promise<void> {
    const requests = [
      this.getAndSetWarehouses(),
      this.getAndSetInvoiceTypes()
    ]

    await Promise.all(requests)

    await this.Refresh();

    if (this.localStorage.has(this.localStorageKey)) {
      this.navigateToTable()
    }

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

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.ReadonlySideForm = true;

    this.filterFormNav.DownNeighbour = this.dbDataTable;

    this.kbS.SelectFirstTile();
  }

  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  RefreshData(): void { }
  TableRowDataChanged(changedData?: any, index?: number, col?: string): void { }
  RecalcNetAndVat(): void { }

  HandleFunctionKey(event: Event | KeyBindings): void {
    const val = event instanceof Event ? (event as KeyboardEvent).code : event;
    console.log(`[HandleFunctionKey]: ${val}`);
    switch (val) {
      // NEW
      case this.KeySetting[Actions.Create].KeyCode:
        break;
      // EDIT
      case this.KeySetting[Actions.Edit].KeyCode:
        break;
      // DELETE
      case this.KeySetting[Actions.Delete].KeyCode:
      case this.KeySetting[Actions.Delete].AlternativeKeyCode:
        break;
    }
  }

  Create(): void { }

  Edit(): void { }

  Delete(): void { }

  @HostListener('window:keydown.f12', ['$event'])
  public async getCsv(): Promise<void> {
    try {
      this.sts.pushProcessStatus(Constants.DownloadReportStatuses[Constants.DownloadOfferNavCSVProcessPhases.PROC_CMD])

      const response = await this.invoiceService.getCsv(this.getInputParams)

    }
    catch (error) {
      this.cs.HandleError(error)
    }
    finally {
      this.sts.pushProcessStatus(Constants.BlankProcessStatus)
    }
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event'])
  public onKeyDown2(event: KeyboardEvent): void {
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.filterFormNav?.HandleFormShiftEnter(event)
      return;
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    if (this.keyboardHelperService.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      default: { }
    }
  }

  ChooseDataForTableRow(rowIndex: number): void { }
  ChooseDataForCustomerForm(): void {}
}
