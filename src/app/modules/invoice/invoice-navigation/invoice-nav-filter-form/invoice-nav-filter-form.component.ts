import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { Customer } from 'src/app/modules/customer/models/Customer';
import { WareHouseService } from 'src/app/modules/warehouse/services/ware-house.service';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { validDate } from 'src/assets/model/Validators';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { TileCssClass, AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { ChosenDeliveryFilterOptionValue, ChosenIssueFilterOptionValue, DefaultChosenDateFilter, InvoiceNavFilter } from '../../models/InvoiceNavFilter';
import { InvoiceType } from 'src/app/modules/system/models/InvoiceType';
import { WareHouse } from 'src/app/modules/warehouse/models/WareHouse';
import { SystemService } from 'src/app/modules/system/services/system.service';
import { CustomerSearchComponent } from '../../customer-serach/customer-search.component';

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

  customerData?: Customer;
  customersData: Customer[] = [];
  @ViewChild('customerSearch')
  private customerSearch!: CustomerSearchComponent
  customerSearchFocused: boolean = false
  private lastBuyerId: number | undefined
  get buyerData(): Customer {
    return this.customerData!
  }
  set buyerData(buyer: Customer) {
    this.customerData = buyer
  }

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
      CustomerSearch: this.customerSearch?.searchForm?.controls['customerSearch']?.value,
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

      this.customerSearch.searchFormNav.attachDirection = AttachDirection.DOWN
      this.customerSearch.searchFormNav.GenerateAndSetNavMatrices(true, undefined, true)

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

    this.customerSearch.search(filter.CustomerSearch)
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

    var filter_cached = this.componentFormData
    filter_cached.CustomerID = undefined
    this.localStorage.put(this.localStorageKey, filter_cached)
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

  ChooseDataForCustomerForm(): void { }

  //#endregion Unimplemented

  //#region customer search component

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

  public customerChanged([customer, shouldNavigate]: [Customer, boolean]): void {
    this.buyerData = customer
    this.SetCustomerFormFields(customer)
  }

  public onFormSearchFocused(event?: any, formFieldName?: string): void {
    this.customerSearchFocused = true;
  }

  public onFormSearchBlurred(event?: any, formFieldName?: string): void {
    this.customerSearchFocused = false;
  }

  //#endregion customer search component
}
