import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, ReplaySubject, Subscription, firstValueFrom, lastValueFrom } from 'rxjs';
import { validDate } from 'src/assets/model/Validators';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { WareHouseService } from 'src/app/modules/warehouse/services/ware-house.service';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { OfflineWhsTransferStatus } from 'src/app/modules/warehouse/models/whs/WhsTransferStatus';
import { UnbalancedInvoicesFilterFormData } from './UnbalancedInvoicesFilterFormData';
import { Customer } from 'src/app/modules/customer/models/Customer';
import { GetCustomerByTaxNumberParams } from 'src/app/modules/customer/models/GetCustomerByTaxNumberParams';
import { GetCustomersParamListModel } from 'src/app/modules/customer/models/GetCustomersParamListModel';
import { TaxNumberSearchCustomerEditDialogComponent } from 'src/app/modules/invoice/tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { Constants } from 'src/assets/util/Constants';
import { CustomerService } from 'src/app/modules/customer/services/customer.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { InvoiceNumberData } from './InvoiceNumberData';
import { CustomerSelectTableDialogComponent } from 'src/app/modules/invoice/customer-select-table-dialog/customer-select-table-dialog.component';
import { CustomerDialogTableSettings } from 'src/assets/model/TableSettings';
import { CustomerSearchComponent } from 'src/app/modules/invoice/customer-serach/customer-search.component';

@Component({
  selector: 'app-unbalanced-invoices-navigation-filter-form',
  templateUrl: './unbalanced-invoices-navigation-filter-form.component.html',
  styleUrls: ['./unbalanced-invoices-navigation-filter-form.component.scss']
})
export class UnbalancedInvoicesNavigationFilterFormComponent implements OnInit, IInlineManager {
  @Input()
  public editDisabled!: boolean

  @Input()
  public invoiceNumberData$: BehaviorSubject<InvoiceNumberData | undefined> = new BehaviorSubject<InvoiceNumberData | undefined>(undefined)

  @Output()
  public refreshClicked = new EventEmitter<UnbalancedInvoicesFilterFormData | undefined>(undefined)

  @Output()
  public pageReady = new EventEmitter<void>()

  IsTableFocused: boolean = false

  private localStorageKey: string

  get isEditModeOff(): boolean {
    return !this.keyboardService.isEditModeActivated
  }

  isLoading: boolean = false

  readonly SearchButtonId: string = 'button-search';
  customerData?: Customer;
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

  @Input()
  public set componentFormData(formData: UnbalancedInvoicesFilterFormData | undefined) {
    if (!formData) {
      return
    }
    this.filterForm.patchValue(formData)
  }
  public get componentFormData() {
    const controls = this.filterForm.controls

    const formData = {
      CustomerID: HelperFunctions.ToOptionalInt(this.customerData?.id),
      Incoming: controls['Incoming'].value,
      Expired: controls['Expired'].value,
      InvoiceDeliveryDateFrom: controls['InvoiceDeliveryDateFrom'].value,
      InvoiceDeliveryDateTo: controls['InvoiceDeliveryDateTo'].value,
      InvoiceIssueDateFrom: controls['InvoiceIssueDateFrom'].value,
      InvoiceIssueDateTo: controls['InvoiceIssueDateTo'].value,
      PaymentDateFrom: controls['PaymentDateFrom'].value,
      PaymentDateTo: controls['PaymentDateTo'].value,
    } as UnbalancedInvoicesFilterFormData
    return formData
  }

  public TileCssClass = TileCssClass

  public filterForm!: FormGroup
  public filterFormId = 'stock-document-filter-form'
  filterFormNav!: InlineTableNavigatableForm
  outInvFormNav$ = new BehaviorSubject<InlineTableNavigatableForm[]>([])

  //#region Date getters

  get fromDeliveryDateValue(): Date | undefined {
    if (!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceDeliveryDateFrom'].value;
    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }
  get toDeliveryDateValue(): Date | undefined {
    if (!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceDeliveryDateTo'].value;
    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get fromIssueDateValue(): Date | undefined {
    if (!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceIssueDateFrom'].value;
    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }
  get toIssueDateValue(): Date | undefined {
    if (!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceIssueDateTo'].value;
    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get fromPaymentDateValue(): Date | undefined {
    if (!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['PaymentDateFrom'].value;
    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }
  get toPaymentDateValue(): Date | undefined {
    if (!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['PaymentDateTo'].value;
    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  //#endregion Date getters

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
    private readonly dialogService: BbxDialogServiceService
  ) {
    this.localStorageKey = 'unbalanced-invoices-navigation-manager-filter.' + tokenService.user?.id ?? 'everyone'

    this.filterForm = new FormGroup({
      Incoming: new FormControl(false, [Validators.required]),
      Expired: new FormControl(false, [Validators.required]),

      InvoiceDeliveryDateFrom: new FormControl('', [
        this.validateFromDeliveryDate.bind(this),
        validDate,
        Validators.required
      ]),
      InvoiceDeliveryDateTo: new FormControl('', [
        this.validateToDeliveryDate.bind(this),
        validDate
      ]),
      InvoiceIssueDateFrom: new FormControl('', [
        this.validateFromIssueDate.bind(this),
        validDate
      ]),
      InvoiceIssueDateTo: new FormControl('', [
        this.validateToIssueDate.bind(this),
        validDate
      ]),
      PaymentDateFrom: new FormControl('', [
        this.validateFromPaymentDate.bind(this),
        validDate
      ]),
      PaymentDateTo: new FormControl('', [
        this.validateToPaymentDate.bind(this),
        validDate
      ]),

      InvoiceNumber: new FormControl(undefined, []),
      CustomerInvoiceNumber: new FormControl(undefined, []),

      CustomerSearch: new FormControl(undefined, []),
      CustomerName: new FormControl(undefined, []),
      CustomerAddress: new FormControl(undefined, []),
      CustomerTaxNumber: new FormControl(undefined, []),
    });
  }

  private AddSearchButtonToFormMatrix(): void {
    this.filterFormNav.Matrix[this.filterFormNav.Matrix.length - 1].push(this.SearchButtonId);
  }

  public async ngOnInit(): Promise<void> {
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

    this.invoiceNumberData$.subscribe({
      next: data => {
        if (data) {
          this.filterForm.controls['InvoiceNumber'].setValue(data.InvoiceNumber)
          this.filterForm.controls['CustomerInvoiceNumber'].setValue(data.CustomerInvoiceNumber)
        } else {
          this.filterForm.controls['InvoiceNumber'].setValue(undefined)
          this.filterForm.controls['CustomerInvoiceNumber'].setValue(undefined)
        }
      }
    })

    setTimeout(async () => {
      this.filterFormNav.GenerateAndSetNavMatrices(true, undefined, true)
      this.filterFormNav.InnerJumpOnEnter = true
      this.filterFormNav.OuterJump = true
      this.customerSearch.searchFormNav.attachDirection = AttachDirection.DOWN
      this.customerSearch.searchFormNav.GenerateAndSetNavMatrices(true, undefined, true)
      this.customerSearch.searchFormNav.Matrix[0].push(this.SearchButtonId)

      this.keyboardService.SetCurrentNavigatable(this.filterFormNav)

      console.trace(this.keyboardService.AroundHere)

      this.pageReady.emit()

      this.keyboardService.SetCurrentNavigatable(this.filterFormNav)
      this.keyboardService.SelectFirstTile()
      this.keyboardService.ClickCurrentElement()

      this.loadFilters()

      const filter = this.localStorage.get<UnbalancedInvoicesFilterFormData>(this.localStorageKey)

      if (filter) {
        this.filterForm.patchValue(filter)
        this.Refresh()
      }

      setTimeout(() => {
        this.cs.CloseAllHeaderMenuTrigger.next(true)
      }, 500);
    }, 500);
  }

  private loadFilters(): void {
    const filter = this.localStorage.get<UnbalancedInvoicesFilterFormData>(this.localStorageKey)

    if (!filter) {
      return
    }

    this.loadMiscFilters(filter)
    this.loadDatesFromFilter(filter)
    this.loadCustomerFilter(filter)
  }

  private loadCustomerFilter(filter: UnbalancedInvoicesFilterFormData): void {
    const setControlValue = (filterValue: any, control: AbstractControl) => {
      if (!filterValue) {
        return
      }
      control.setValue(filterValue)
    }

    this.customerSearch.search(filter.CustomerSearch)
  }

  private loadMiscFilters(filter: UnbalancedInvoicesFilterFormData): void {
    const setControlValue = (filterValue: any, control: AbstractControl) => {
      if (!filterValue) {
        return
      }
      control.setValue(filterValue)
    }

    const controls = this.filterForm.controls

    setControlValue(filter.Incoming, controls['Incoming'])
    setControlValue(filter.Expired, controls['Expired'])
  }

  private loadDatesFromFilter(filter: UnbalancedInvoicesFilterFormData): void {
    const setControlValue = (filterValue: string, control: AbstractControl) => {
      if (!filterValue) {
        return
      }
      control.setValue(filterValue)
    }

    const controls = this.filterForm.controls

    setControlValue(filter.InvoiceDeliveryDateFrom, controls['InvoiceDeliveryDateFrom'])
    setControlValue(filter.InvoiceDeliveryDateTo, controls['InvoiceDeliveryDateTo'])
    setControlValue(filter.InvoiceDeliveryDateTo, controls['InvoiceDeliveryDateTo'])
    setControlValue(filter.InvoiceIssueDateFrom, controls['InvoiceIssueDateFrom'])
    setControlValue(filter.InvoiceIssueDateTo, controls['InvoiceIssueDateTo'])
    setControlValue(filter.PaymentDateFrom, controls['PaymentDateFrom'])
    setControlValue(filter.PaymentDateTo, controls['PaymentDateTo'])
  }

  public Refresh(): void {
    this.localStorage.put(this.localStorageKey, this.filterForm.value)
    this.refreshClicked.emit(this.componentFormData)
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

  //#endregion Customer

  //#region Validation

  private validateFromDeliveryDate(control: AbstractControl): any {
    if (this.toDeliveryDateValue === undefined) {
      return null;
    }
    let fromDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let toDeliveryDateValue = HelperFunctions.GetDateIfDateStringValid(this.toDeliveryDateValue.toDateString());
    const wrong = fromDate?.isAfter(toDeliveryDateValue, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }
  private validateToDeliveryDate(control: AbstractControl): any {
    if (this.fromDeliveryDateValue === undefined) {
      return null;
    }
    let toDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let fromDeliveryDateValue = HelperFunctions.GetDateIfDateStringValid(this.fromDeliveryDateValue.toDateString());
    const wrong = toDate?.isBefore(fromDeliveryDateValue, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  private validateFromIssueDate(control: AbstractControl): any {
    if (this.toIssueDateValue === undefined) {
      return null;
    }
    let fromDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let toIssueDateValue = HelperFunctions.GetDateIfDateStringValid(this.toIssueDateValue.toDateString());
    const wrong = fromDate?.isAfter(toIssueDateValue, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }
  private validateToIssueDate(control: AbstractControl): any {
    if (this.fromIssueDateValue === undefined) {
      return null;
    }
    let toDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let fromIssueDateValue = HelperFunctions.GetDateIfDateStringValid(this.fromIssueDateValue.toDateString());
    const wrong = toDate?.isBefore(fromIssueDateValue, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  private validateFromPaymentDate(control: AbstractControl): any {
    if (this.toPaymentDateValue === undefined) {
      return null;
    }
    let fromDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let toPaymentDateValue = HelperFunctions.GetDateIfDateStringValid(this.toPaymentDateValue.toDateString());
    const wrong = fromDate?.isAfter(toPaymentDateValue, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }
  private validateToPaymentDate(control: AbstractControl): any {
    if (this.fromPaymentDateValue === undefined) {
      return null;
    }
    let toDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let fromPaymentDateValue = HelperFunctions.GetDateIfDateStringValid(this.fromPaymentDateValue.toDateString());
    const wrong = toDate?.isBefore(fromPaymentDateValue, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  //#endregion Validation

  //#region Unimplemented

  ChoseDataForFormByTaxtNumber(): void {
    throw new Error('Method not implemented.');
  }

  public ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    throw new Error('Method not implemented.');
  }

  ChooseDataForCustomerForm(): void {
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

  //#region customer search component

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
