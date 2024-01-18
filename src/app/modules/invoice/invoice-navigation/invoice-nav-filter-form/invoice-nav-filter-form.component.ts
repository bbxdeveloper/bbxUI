import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { Customer } from 'src/app/modules/customer/models/Customer';
import { GetCustomerByTaxNumberParams } from 'src/app/modules/customer/models/GetCustomerByTaxNumberParams';
import { GetCustomersParamListModel } from 'src/app/modules/customer/models/GetCustomersParamListModel';
import { CustomerService } from 'src/app/modules/customer/services/customer.service';
import { WareHouseService } from 'src/app/modules/warehouse/services/ware-house.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { CustomerDialogTableSettings } from 'src/assets/model/TableSettings';
import { validDate } from 'src/assets/model/Validators';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { TileCssClass, AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { CustomerSelectTableDialogComponent } from '../../customer-select-table-dialog/customer-select-table-dialog.component';
import { ChosenDeliveryFilterOptionValue, ChosenIssueFilterOptionValue, DefaultChosenDateFilter, InvoiceNavFilter } from '../../models/InvoiceNavFilter';
import { TaxNumberSearchCustomerEditDialogComponent } from '../../tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { InvoiceType } from 'src/app/modules/system/models/InvoiceType';
import { WareHouse } from 'src/app/modules/warehouse/models/WareHouse';
import { SystemService } from 'src/app/modules/system/services/system.service';

@Component({
  selector: 'app-invoice-nav-filter-form',
  templateUrl: './invoice-nav-filter-form.component.html',
  styleUrls: ['./invoice-nav-filter-form.component.scss']
})
export class InvoiceNavFilterFormComponent implements OnInit, IInlineManager {
  @Input()
  public editDisabled!: boolean

  @Output()
  public refreshClicked = new EventEmitter<InvoiceNavFilter | undefined>(undefined)

  @Output()
  public pageReady = new EventEmitter<void>()

  IsTableFocused: boolean = false

  private localStorageKey: string

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

  isLoading: boolean = false

  @Input()
  public set componentFormData(formData: InvoiceNavFilter | undefined) {
    if (!formData) {
      return
    }
    this.filterForm.patchValue(formData)
  }
  public get componentFormData(): InvoiceNavFilter {
    const controls = this.filterForm.controls

    const formData = {
      CustomerID: HelperFunctions.ToOptionalInt(this.customerData?.id),
      CustomerSearch: controls['CustomerSearch'].value,
      InvoiceType: controls['InvoiceType'].value,
      WarehouseCode: controls['WarehouseCode'].value,
      InvoiceIssueDateFrom: controls['InvoiceIssueDateFrom'].value,
      InvoiceIssueDateTo: controls['InvoiceIssueDateTo'].value,
      InvoiceDeliveryDateFrom: controls['InvoiceDeliveryDateFrom'].value,
      InvoiceDeliveryDateTo: controls['InvoiceDeliveryDateTo'].value,
      DateFilterChooser: controls['DateFilterChooser'].value,
    } as InvoiceNavFilter
    return formData
  }

  public TileCssClass = TileCssClass

  public filterForm!: FormGroup
  public filterFormId = 'stock-document-filter-form'
  filterFormNav!: InlineTableNavigatableForm
  outInvFormNav$ = new BehaviorSubject<InlineTableNavigatableForm[]>([])

  readonly ChosenIssueFilterOptionValue: string = ChosenIssueFilterOptionValue;
  readonly ChosenDeliveryFilterOptionValue: string = ChosenDeliveryFilterOptionValue;
  readonly DefaultChosenDateFilter: string = DefaultChosenDateFilter;

  // WareHouse
  warehouses: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  invoiceTypes: InvoiceType[] = []
  invoiceTypes$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])

  //#region Getters

  get isEditModeOff() {
    return !this.keyboardService.isEditModeActivated;
  }

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
    private readonly keyboardService: KeyboardNavigationService,
    private readonly wareHouseApi: WareHouseService,
    private readonly cs: CommonService,
    private readonly cdref: ChangeDetectorRef,
    private readonly localStorage: LocalStorageService,
    private readonly tokenService: TokenStorageService,
    private readonly customerService: CustomerService,
    private readonly warehouseService: WareHouseService,
    private readonly bbxToastService: BbxToastrService,
    private readonly dialogService: BbxDialogServiceService,
    private readonly systemService: SystemService
  ) {
    this.localStorageKey = 'invoiceNavKey.' + tokenService.user?.id ?? 'for-everyone'

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
  }

  private async setupFilterForm(): Promise<void> {
    this.filterForm.controls['DateFilterChooser'].valueChanges.subscribe({
      next: newValue => {
        let x = this.keyboardService.p.x;
        let y = this.keyboardService.p.y;
        setTimeout(() => {
          this.filterFormNav.GenerateAndSetNavMatrices(false, undefined, true);
          this.keyboardService.SelectElementByCoordinate(x, y);
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

  private AddSearchButtonToFormMatrix(): void {
    this.filterFormNav.Matrix[this.filterFormNav.Matrix.length - 1].push(this.SearchButtonId);
  }

  private async getWarehouses(): Promise<void> {
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

  private async getInvoiceTypes(): Promise<void> {
    try {
      const invoiceTypes = await this.systemService.getInvoiceTypes()
      if (invoiceTypes) {
        this.invoiceTypes = invoiceTypes
        this.invoiceTypes$.next(invoiceTypes.map(x => x.text))

        const control = this.filterForm.controls['InvoiceType']
        if (HelperFunctions.isEmptyOrSpaces(control.value)) {
          control.setValue(invoiceTypes.find(x => x.value === 'INV')?.text ?? '')
        }
      }
    }
    catch (error) {
      this.cs.HandleError(error)
    }
  }

  public async ngOnInit(): Promise<void> {
    const requests = [
      this.getWarehouses(),
      this.getInvoiceTypes()
    ]

    await Promise.all(requests)

    this.setupFilterForm()
    this.filterFormNav = new InlineTableNavigatableForm(
      this.filterForm,
      this.keyboardService,
      this.cdref,
      [],
      this.filterFormId,
      AttachDirection.DOWN,
      this
    )
    this.filterFormNav.OuterJump = true

    setTimeout(async () => {
      this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);

      $('*[type=radio]').addClass(TileCssClass);
      $('*[type=radio]').on('click', (event) => {
        this.filterFormNav.HandleFormFieldClick(event);
      });

      this.filterFormNav.GenerateAndSetNavMatrices(true, undefined, true)
      this.filterFormNav.InnerJumpOnEnter = true
      this.filterFormNav.OuterJump = true

      this.keyboardService.SetCurrentNavigatable(this.filterFormNav)

      this.pageReady.emit()

      this.keyboardService.SetCurrentNavigatable(this.filterFormNav)
      this.keyboardService.SelectFirstTile()
      this.keyboardService.ClickCurrentElement()

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

  private async loadFilters(): Promise<void> {
    const filter = this.localStorage.get<InvoiceNavFilter>(this.localStorageKey)

    if (!filter) {
      return
    }

    await this.loadCustomerFilter(filter)
    this.loadMiscFilters(filter)
    this.loadDatesFromFilter(filter)
  }

  private async loadCustomerFilter(filter: InvoiceNavFilter): Promise<void> {
    const setControlValue = (filterValue: any, control: AbstractControl) => {
      if (!filterValue) {
        return
      }
      control.setValue(filterValue)
    }

    const controls = this.filterForm.controls
    setControlValue(filter.CustomerSearch, controls['CustomerSearch'])

    if (filter) {
      if (HelperFunctions.isEmptyOrSpaces(filter.CustomerSearch)) {
        filter.CustomerID = undefined
      } else {
        await this.searchCustomerAsync(this.filterForm.controls['CustomerSearch'].value)
        this.keyboardService.SelectElementByCoordinate(0, 5)
      }
    }
  }

  private loadMiscFilters(filter: InvoiceNavFilter): void {
    const setControlValue = (filterValue: any, control: AbstractControl) => {
      if (!filterValue) {
        return
      }
      control.setValue(filterValue)
    }

    const controls = this.filterForm.controls

    setControlValue(filter.InvoiceType, controls['InvoiceType'])
    setControlValue(filter.DateFilterChooser, controls['DateFilterChooser'])
    setControlValue(filter.WarehouseCode, controls['WarehouseCode'])
  }

  private loadDatesFromFilter(filter: InvoiceNavFilter): void {
    const setControlValue = (filterValue: string, control: AbstractControl) => {
      if (!filterValue) {
        return
      }
      control.setValue(filterValue)
    }

    const controls = this.filterForm.controls

    setControlValue(filter.InvoiceDeliveryDateFrom, controls['InvoiceDeliveryDateFrom'])
    setControlValue(filter.InvoiceDeliveryDateTo, controls['InvoiceDeliveryDateTo'])
    setControlValue(filter.InvoiceIssueDateFrom, controls['InvoiceIssueDateFrom'])
    setControlValue(filter.InvoiceIssueDateTo, controls['InvoiceIssueDateTo'])
  }

  public Refresh(): void {
    var filter = this.componentFormData
    this.refreshClicked.emit(filter)
    filter.CustomerID = undefined
    this.localStorage.put(this.localStorageKey, filter)
  }

  MoveToSearchButton(event: any, jumpNext: boolean = true, toggleEditMode: boolean = true, preventEventInAnyCase: boolean = false): void {
    if (this.keyboardService.isEditModeActivated) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)
      this.keyboardService.MoveDown();
    } else {
      this.filterFormNav.HandleFormEnter(event, jumpNext, toggleEditMode, preventEventInAnyCase)
    }
  }

  @HostListener('window:keydown', ['$event'])
  public onKeyDown2(event: KeyboardEvent): void {
    if (event.shiftKey && event.key == 'Enter') {
      this.keyboardService.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.filterFormNav?.HandleFormShiftEnter(event)
      return;
    }
  }

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

    return data;
  }

  ChoseDataForFormByTaxtNumber(): void {
    console.log("Selecting Customer from avaiable data by taxtnumber.");

    this.isLoading = true;

    this.customerService.GetByTaxNumber({ Taxnumber: this.customerInputFilterString } as GetCustomerByTaxNumberParams).subscribe({
      next: async res => {
        if (!!res && !!res.data && !!res.data.customerName && res.data.customerName.length > 0) {
          this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);

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

                this.keyboardService.SetCurrentNavigatable(this.filterFormNav);
                this.keyboardService.SelectFirstTile();
                this.keyboardService.setEditMode(KeyboardModes.EDIT);
              }
            },
            error: err => {
              this.cs.HandleError(err);
            }
          });
        } else {
          this.bbxToastService.show(res.errors?.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
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

    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)

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

        this.keyboardService.SetCurrentNavigatable(this.filterFormNav)
        this.keyboardService.SelectElementByCoordinate(0, 3)
        this.keyboardService.ClickCurrentElement()
      }
    })
  }

  //#endregion Customer

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

  //#region Unimplemented

  public ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    throw new Error('Method not implemented.');
  }

  public RefreshData(): void {
    throw new Error('Method not implemented.');
  }

  public TableRowDataChanged(changedData?: any, index?: number | undefined, col?: string | undefined): void {
    throw new Error('Method not implemented.');
  }

  public RecalcNetAndVat(): void {
    throw new Error('Method not implemented.');
  }

  //#endregion Unimplemented

}
