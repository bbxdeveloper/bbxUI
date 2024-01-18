import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, Optional } from '@angular/core';
import { NbTreeGridDataSourceBuilder } from '@nebular/theme';
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
import { InvoiceService } from '../../services/invoice.service';
import { WareHouse } from '../../../warehouse/models/WareHouse';
import { WareHouseService } from '../../../warehouse/services/ware-house.service';
import { Invoice } from '../../models/Invoice';
import { GetInvoicesParamListModel } from '../../models/GetInvoicesParamListModel';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { validDate } from 'src/assets/model/Validators';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { GetFooterCommandListFromKeySettings, InvoiceNavKeySettings, Actions, KeyBindings } from 'src/assets/util/KeyBindings';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { IFunctionHandler } from 'src/assets/model/navigation/IFunctionHandler';
import { BaseManagerComponent } from '../../../shared/base-manager/base-manager.component';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { TokenStorageService } from '../../../auth/services/token-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { InvoiceNavFilter } from '../../models/InvoiceNavFilter';
import { SystemService } from '../../../system/services/system.service';
import { InvoiceType } from '../../../system/models/InvoiceType';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { LoggerService } from 'src/app/services/logger.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { CustomerService } from '../../../customer/services/customer.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { CustomerDialogTableSettings } from 'src/assets/model/TableSettings';
import { Customer } from '../../../customer/models/Customer';
import { GetCustomerByTaxNumberParams } from '../../../customer/models/GetCustomerByTaxNumberParams';
import { GetCustomersParamListModel } from '../../../customer/models/GetCustomersParamListModel';
import { CustomerSelectTableDialogComponent } from '../../customer-select-table-dialog/customer-select-table-dialog.component';
import { TaxNumberSearchCustomerEditDialogComponent } from '../../tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';

@Component({
  selector: 'app-invoice-nav',
  templateUrl: './invoice-nav.component.html',
  styleUrls: ['./invoice-nav.component.scss']
})
export class InvoiceNavComponent extends BaseManagerComponent<Invoice> implements IFunctionHandler, IInlineManager, OnInit, AfterViewInit {
  //#region Customer fields

  readonly SearchButtonId: string = 'customer-button-search';
  private Subscription_FillFormWithFirstAvailableCustomer?: Subscription;
  customerInputFilterString: string = '';
  cachedCustomerName?: string;
  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.filterFormNav.GenerateAndSetNavMatrices(false, true);
    this.AddSearchButtonToFormMatrix();
  }
  customerData?: Customer;
  customersData: Customer[] = [];

  //#endregion Customer fields
  
  private readonly localStorageKey: string

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  IsTableFocused: boolean = false;
  isDeleteDisabled: boolean = false;

  override KeySetting: Constants.KeySettingsDct = InvoiceNavKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

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
    'invoicePaidAmount',
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
    {
      label: 'Kiegyenlítve',
      objectKey: 'invoicePaidAmount',
      colKey: 'invoicePaidAmount',
      defaultValue: '',
      type: 'formatted-number',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
  ];

  public override getInputParams(override?: Constants.Dct): GetInvoicesParamListModel {
    const controls = this.filterForm.controls
    const params = {
      PageNumber: 1,
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
    }
    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"]
    }
    return params
  }

  filterFormId = 'invoices-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: InlineTableNavigatableForm;

  readonly ChosenIssueFilterOptionValue: string = '1';
  readonly ChosenDeliveryFilterOptionValue: string = '2';

  // WareHouse
  warehouses: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  invoiceTypes: InvoiceType[] = []
  invoiceTypes$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])

  //#region Getters

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
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

  //#endregion Getters

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
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
    private readonly systemService: SystemService,
    private readonly printAndDownloadService: PrintAndDownloadService,    
    loggerService: LoggerService,
    private readonly customerService: CustomerService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'invoices-table';
    this.dbDataTableEditId = 'invoices-cell-edit-input';

    this.localStorageKey = 'invoiceNavKey.' + tokenStorage.user?.id ?? 'for-everyone'

    this.kbS.ResetToRoot();

    this.filterForm = new FormGroup({
      InvoiceType: new FormControl(undefined, [Validators.required]),
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
      DateFilterChooser: new FormControl(undefined, []),

      CustomerSearch: new FormControl(undefined, []),
      CustomerName: new FormControl(undefined, []),
      CustomerAddress: new FormControl(undefined, []),
      CustomerTaxNumber: new FormControl(undefined, []),
    });

    this.Setup();
  }

  //#region Validations

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

  //#endregion Validations

  //#region Misc

  override GetRecordName(data: Invoice): string | number | undefined {
    return data.invoiceNumber
  }

  ToInt(p: any): number {
    return parseInt(p + '');
  }

  private navigateToTable() {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)
    this.kbS.SetCurrentNavigatable(this.dbDataTable)
    this.kbS.SelectElementByCoordinate(0, 0)
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)
  }

  //#endregion Misc

  //#region Refresh

  SearchButtonClicked(event: any): void {
    this.localStorage.put(this.localStorageKey, this.filterForm.value)
    this.Refresh()
  }

  override async Refresh(params?: GetInvoicesParamListModel): Promise<void> {
    console.trace("ez miért hívódik meg?????????????????????")

    this.sts.waitForLoad(true)

    try {
      const response = await this.invoiceService.getAllAsync(params ?? this.getInputParams())

      if (response && response.succeeded && !!response.data) {
        const tempData = response.data.map((x) => {
          return { data: x, uid: this.nextUid() };
        });
        this.dbData = tempData;
        this.dbDataDataSrc.setData(this.dbData);
        this.dbDataTable.SetPaginatorData(response);

        this.RefreshTable(undefined, true);

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
      this.sts.waitForLoad(false)
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

        const control = this.filterForm.controls['InvoiceType']

        if (control.value === '') {
          control.setValue(invoiceTypes.find(x => x.value === 'INV')?.text ?? '')
        }
      }
    }
    catch (error) {
      this.cs.HandleError(error)
    }
  }

  //#endregion Refresh

  //#region Utility

  public getCsv(): void {
    HelperFunctions.confirm(this.dialogService, 'Export CSV formátumban?', () => {
      try {
        this.sts.pushProcessStatus(Constants.DownloadReportStatuses[Constants.DownloadOfferNavCSVProcessPhases.PROC_CMD])

        const reportParams = {
          report_params: this.getInputParams(),
        } as Constants.Dct

        this.printAndDownloadService.download_csv(reportParams, this.invoiceService.getCsv.bind(this.invoiceService))
      }
      catch (error) {
        this.cs.HandleError(error)
      }
      finally {
        this.sts.pushProcessStatus(Constants.BlankProcessStatus)
      }
    })
  }

  private printSelectedInvoice(): void {
    const selectedRow = this.dbDataTable.prevSelectedRow

    const invoiceNumber = selectedRow?.data.invoiceNumber ?? ''

    this.printAndDownloadService.openPrintDialog({
      DialogTitle: Constants.TITLE_PRINT_INVOICE,
      DefaultCopies: Constants.OutgoingIncomingInvoiceDefaultPrintCopy,
      MsgError: `A ${invoiceNumber} számla nyomtatása közben hiba történt.`,
      MsgCancel: `A ${invoiceNumber} számla nyomtatása nem történt meg.`,
      MsgFinish: `A ${invoiceNumber} számla nyomtatása véget ért.`,
      Obs: this.invoiceService.GetReport.bind(this.invoiceService),
      Reset: () => {},
      ReportParams: {
        id: selectedRow?.data.id,
        copies: 1
      } as Constants.Dct
    } as PrintDialogRequest)
  }

  //#endregion Utility

  //#region Keyboard

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
        break;
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
      case this.KeySetting[Actions.Print].KeyCode: {
        event.preventDefault()
        event.stopImmediatePropagation()

        this.printSelectedInvoice()
        break
      }
      case this.KeySetting[Actions.CSV].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        this.getCsv()
        break
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.ToggleForm].KeyLabel} Pressed: ${this.KeySetting[Actions.ToggleForm].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break
      }
    }
  }

  //#endregion Keyboard

  //#region Init

  private async loadFilters(): Promise<void> {
    const filter = this.localStorage.get<InvoiceNavFilter>(this.localStorageKey)

    if (!filter) {
      return
    }

    await this.loadCustomerFilter(filter)
  }

  public async ngOnInit(): Promise<void> {
    const requests = [
      this.getAndSetWarehouses(),
      this.getAndSetInvoiceTypes()
    ]

    await Promise.all(requests)

    // await this.Refresh();

    // if (this.localStorage.has(this.localStorageKey)) {
    //   this.navigateToTable()
    // }

    this.fS.pushCommands(this.commands);

    setTimeout(async () => {
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  
      $('*[type=radio]').addClass(TileCssClass);
      $('*[type=radio]').on('click', (event) => {
        this.filterFormNav.HandleFormFieldClick(event);
      });

      this.filterFormNav.GenerateAndSetNavMatrices(true, undefined, true);
      this.filterFormNav.DownNeighbour = this.dbDataTable;
      this.filterFormNav.InnerJumpOnEnter = true
      this.filterFormNav.OuterJump = true

      this.dbDataTable.ReadonlySideForm = true;

      this.kbS.SetCurrentNavigatable(this.filterFormNav)
      this.kbS.SelectFirstTile()
      this.kbS.ClickCurrentElement()

      await this.setupFilterForm()      
      await this.loadFilters()

      const filter = this.localStorage.get<InvoiceNavFilter>(this.localStorageKey)      
      if (filter) {
        this.filterForm.patchValue(filter)
        this.Refresh()
      }

      setTimeout(() => {
        this.cs.CloseAllHeaderMenuTrigger.next(true)
      }, 500);
    }, 500);
  }

  ngAfterViewInit(): void {
    // console.log("[ngAfterViewInit]");

    // this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    // $('*[type=radio]').addClass(TileCssClass);
    // $('*[type=radio]').on('click', (event) => {
    //   this.filterFormNav.HandleFormFieldClick(event);
    // });

    // this.filterFormNav.GenerateAndSetNavMatrices(true, true, NavMatrixOrientation.ONLY_HORIZONTAL);

    // this.dbDataTable.GenerateAndSetNavMatrices(true);
    // this.dbDataTable.ReadonlySideForm = true;

    // this.filterFormNav.DownNeighbour = this.dbDataTable;

    // this.kbS.SelectFirstTile();
  }

  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.setupFilterForm()

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
      invoicePaidAmount: new FormControl(undefined, []),
      invoicePaidAmountHUF: new FormControl(undefined, []),
      invoiceNetAmountHUF: new FormControl(undefined, []),
      invoiceVatAmountHUF: new FormControl(undefined, []),
      invoiceGrossAmountHUF: new FormControl(undefined, []),
      invoicePaidDates: new FormControl(undefined, []),
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
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams({ 'PageNumber': newPageNumber }));
      },
    });
    this.dbDataTable.flatDesignForm.commandsOnForm = this.commands;

    this.dbDataTable!.OuterJump = true;
  }

  private async loadCustomerFilter(filter: InvoiceNavFilter): Promise<void> {
    const setControlValue = (filterValue: any, control: AbstractControl) => {
      if (!filterValue) {
        return
      }
      control.setValue(filterValue)
    }

    if (filter) {
      if (HelperFunctions.isEmptyOrSpaces(filter.CustomerSearch)) {
        filter.CustomerID = undefined
      } else {
        await this.searchCustomerAsync(this.filterForm.controls['CustomerSearch'].value)
        this.kbS.SelectElementByCoordinate(0, 0)
      }
    }

    // this.customerSearch.search(filter.CustomerSearch)
  }

  private async setupFilterForm(): Promise<void> {
    let filterData = this.localStorage.get<InvoiceNavFilter>(this.localStorageKey)

    if (!filterData) {
      filterData = InvoiceNavFilter.create()
    }

    // this.filterForm.patchValue(filterData)

    // this.filterForm = new FormGroup({
    //   InvoiceType: new FormControl(filterData.invoiceType, [Validators.required]),
    //   WarehouseCode: new FormControl(filterData.warehouseCode, []),
    //   InvoiceIssueDateFrom: new FormControl(filterData.invoiceIssueDateFrom, [
    //     this.validateInvoiceIssueDateFrom.bind(this),
    //     validDate
    //   ]),
    //   InvoiceIssueDateTo: new FormControl(filterData.invoiceIssueDateTo, [
    //     this.validateInvoiceIssueDateTo.bind(this),
    //     validDate
    //   ]),
    //   InvoiceDeliveryDateFrom: new FormControl(filterData.invoiceDeliveryDateFrom, [
    //     this.validateInvoiceDeliveryDateFrom.bind(this),
    //     validDate
    //   ]),
    //   InvoiceDeliveryDateTo: new FormControl(filterData.invoiceDeliveryDateTo, [
    //     this.validateInvoiceDeliveryDateTo.bind(this),
    //     validDate
    //   ]),
    //   DateFilterChooser: new FormControl(filterData.dateFilterChooser, []),

    //   CustomerSearch: new FormControl(undefined, []),
    //   CustomerName: new FormControl(undefined, []),
    //   CustomerAddress: new FormControl(undefined, []),
    //   CustomerTaxNumber: new FormControl(undefined, []),
    // });

    this.filterForm.valueChanges.subscribe(value => {
      const filterData = {
        InvoiceType: value.InvoiceType,
        WarehouseCode: value.WarehouseCode,
        InvoiceIssueDateFrom: value.InvoiceIssueDateFrom,
        InvoiceIssueDateTo: value.InvoiceIssueDateTo,
        InvoiceDeliveryDateFrom: value.InvoiceDeliveryDateFrom,
        InvoiceDeliveryDateTo: value.InvoiceDeliveryDateTo,
        DateFilterChooser: value.DateFilterChooser,
      } as InvoiceNavFilter

      this.localStorage.put(this.localStorageKey, filterData)
    })

    this.filterForm.controls['DateFilterChooser'].valueChanges.subscribe({
      next: newValue => {
        let x = this.kbS.p.x;
        let y = this.kbS.p.y;
        setTimeout(() => {
          this.filterFormNav.GenerateAndSetNavMatrices(false, undefined, true);
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

    this.filterFormNav = new InlineTableNavigatableForm(
      this.filterForm,
      this.kbS,
      this.cdref,
      [],
      this.filterFormId,
      AttachDirection.DOWN,
      this
    )

    this.filterFormNav.OuterJump = true;
  }

  //#endregion Init

  //#region Customer

  private SetCustomerFormFields(data?: Customer) {
    if (data === undefined) {
      this.filterForm.controls["CustomerName"].setValue(undefined);
      this.filterForm.controls['CustomerName'].setValue(undefined);
      this.filterForm.controls['CustomerAddress'].setValue(undefined);
      this.filterForm.controls['CustomerTaxNumber'].setValue(undefined);
      return;
    }
    this.filterForm.controls["CustomerName"].setValue(data.customerName);
    this.filterForm.controls['CustomerName'].setValue(data.customerName);
    this.filterForm.controls['CustomerAddress'].setValue(data.postalCode + ', ' + data.city);
    this.filterForm.controls['CustomerTaxNumber'].setValue(data.taxpayerNumber);
  }

  FillFormWithFirstAvailableCustomer(event: any): void {
    if (!!this.Subscription_FillFormWithFirstAvailableCustomer && !this.Subscription_FillFormWithFirstAvailableCustomer.closed) {
      this.Subscription_FillFormWithFirstAvailableCustomer.unsubscribe();
    }

    this.customerInputFilterString = event.target.value ?? '';

    if (this.customerInputFilterString.replace(' ', '') === '' || HelperFunctions.isEmptyOrSpaces(this.customerInputFilterString)) {
      this.customerData = undefined;
      this.SetCustomerFormFields(undefined);
      this.isLoading = false
      return;
    }

    this.isLoading = true;
    this.Subscription_FillFormWithFirstAvailableCustomer = this.searchCustomer(this.customerInputFilterString)
  }

  private async searchCustomerAsync(term: string): Promise<void> {
    if (HelperFunctions.isEmptyOrSpaces(term)) {
      this.SetCustomerFormFields(undefined);
    }

    const request = {
      IsOwnData: false,
      PageNumber: '1',
      PageSize: '1',
      SearchString: term,
      OrderBy: 'customerName'
    } as GetCustomersParamListModel

    try {
      const res = await firstValueFrom(this.customerService.GetAll(request))

      if (!!res && res.data !== undefined && res.data.length > 0) {
        this.customerData = res.data[0];
        this.cachedCustomerName = res.data[0].customerName;
        this.SetCustomerFormFields(res.data[0]);
        this.searchByTaxtNumber = false;
      } else {
        if (this.customerInputFilterString.length >= 8 &&
          HelperFunctions.IsNumber(this.customerInputFilterString)) {
          this.searchByTaxtNumber = true;
        } else {
          this.searchByTaxtNumber = false;
        }
        this.SetCustomerFormFields(undefined);
      }
    }
    catch (error) {
      this.cs.HandleError(error);
      this.isLoading = false;
      this.searchByTaxtNumber = false;
    }
  }

  private searchCustomer(term: string): Subscription {
    if (HelperFunctions.isEmptyOrSpaces(term)) {
      this.SetCustomerFormFields(undefined);
    }

    const request = {
      IsOwnData: false,
      PageNumber: '1',
      PageSize: '1',
      SearchString: term,
      OrderBy: 'customerName'
    } as GetCustomersParamListModel

    return this.customerService.GetAll(request).subscribe({
      next: res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.customerData = res.data[0];
          this.cachedCustomerName = res.data[0].customerName;
          this.SetCustomerFormFields(res.data[0]);
          this.searchByTaxtNumber = false;
        } else {
          if (this.customerInputFilterString.length >= 8 &&
            HelperFunctions.IsNumber(this.customerInputFilterString)) {
            this.searchByTaxtNumber = true;
          } else {
            this.searchByTaxtNumber = false;
          }
          this.SetCustomerFormFields(undefined);
        }
      },
      error: (err) => {
        this.cs.HandleError(err);
        this.isLoading = false;
        this.searchByTaxtNumber = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private async PrepareCustomer(data: Customer): Promise<Customer> {
    console.log('Before: ', data);

    data.customerBankAccountNumber = data.customerBankAccountNumber ?? '';
    data.taxpayerNumber = `${data.taxpayerId}-${data.vatCode ?? ''}-${data.countyCode ?? ''}`

    // const countryCodes = await lastValueFrom(this.customerService.GetAllCountryCodes());

    // if (!!countryCodes && countryCodes.length > 0 && data.countryCode !== undefined && this.countryCodes.length > 0) {
    //   data.countryCode = this.countryCodes.find(x => x.value == data.countryCode)?.text ?? '';
    // }

    return data;
  }

  ChoseDataForFormByTaxtNumber(): void {
    console.log("Selecting Customer from avaiable data by taxtnumber.");

    this.isLoading = true;

    this.customerService.GetByTaxNumber({ Taxnumber: this.customerInputFilterString } as GetCustomerByTaxNumberParams).subscribe({
      next: async res => {
        if (!!res && !!res.data && !!res.data.customerName && res.data.customerName.length > 0) {
          this.kbS.setEditMode(KeyboardModes.NAVIGATION);

          const dialogRef = this.dialogService.open(TaxNumberSearchCustomerEditDialogComponent, {
            context: {
              data: await this.PrepareCustomer(res.data)
            },
            closeOnEsc: false
          });
          dialogRef.onClose.subscribe({
            next: (res: Customer) => {
              console.log("Selected item: ", res);
              if (!!res) {
                this.customerData = res;
                this.filterForm.controls["CustomerName"].setValue(res.customerName);

                this.kbS.SetCurrentNavigatable(this.filterFormNav);
                this.kbS.SelectFirstTile();
                this.kbS.setEditMode(KeyboardModes.EDIT);
              }
            },
            error: err => {
              this.cs.HandleError(err);
            }
          });
        } else {
          this.simpleToastrService.show(res.errors?.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
        }
      },
      error: (err) => {
        this.cs.HandleError(err); this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  ChooseDataForCustomerForm(): void {
    console.log("Selecting Customer from avaiable data.")

    this.kbS.setEditMode(KeyboardModes.NAVIGATION)

    const dialogRef = this.dialogService.open(CustomerSelectTableDialogComponent, {
      context: {
        searchString: this.customerInputFilterString,
        allColumns: CustomerDialogTableSettings.CustomerSelectorDialogAllColumns,
        colDefs: CustomerDialogTableSettings.CustomerSelectorDialogColDefs
      }
    })
    dialogRef.onClose.subscribe((res: Customer) => {
      console.log("Selected item: ", res)
      if (!!res) {
        this.customerData = res
        this.SetCustomerFormFields(res)

        this.kbS.SetCurrentNavigatable(this.filterFormNav)
        this.kbS.SelectElementByCoordinate(0, 3)
        this.kbS.ClickCurrentElement()
      }
    })
  }

  private AddSearchButtonToFormMatrix(): void {
    this.filterFormNav.Matrix[this.filterFormNav.Matrix.length - 1].push(this.SearchButtonId);
  }

  //#endregion Customer

  //#region Unimplemented

  RefreshData(): void { }
  TableRowDataChanged(changedData?: any, index?: number, col?: string): void { }
  RecalcNetAndVat(): void { }

  Create(): void { }

  Edit(): void { }

  Delete(): void { }

  ChooseDataForTableRow(rowIndex: number): void {}

  //#endregion Unimplemented

}
