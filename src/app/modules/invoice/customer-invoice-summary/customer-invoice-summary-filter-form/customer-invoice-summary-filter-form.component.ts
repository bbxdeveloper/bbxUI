import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription, lastValueFrom } from 'rxjs';
import { validDate } from 'src/assets/model/Validators';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { WareHouse } from 'src/app/modules/warehouse/models/WareHouse';
import { WareHouseService } from 'src/app/modules/warehouse/services/ware-house.service';
import { CustomerInvoiceSummaryFilterFormData } from './CustomerInvoiceSummaryFilterFormData';
import { Customer } from 'src/app/modules/customer/models/Customer';
import { CustomerService } from 'src/app/modules/customer/services/customer.service';
import { NbDialogService } from '@nebular/theme';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { GetCustomerByTaxNumberParams } from 'src/app/modules/customer/models/GetCustomerByTaxNumberParams';
import { Constants } from 'src/assets/util/Constants';
import { TaxNumberSearchCustomerEditDialogComponent } from '../../tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { CountryCode } from 'src/app/modules/customer/models/CountryCode';
import { GetCustomersParamListModel } from 'src/app/modules/customer/models/GetCustomersParamListModel';
import { CustomerDialogTableSettings } from 'src/assets/model/TableSettings';
import { CustomerSelectTableDialogComponent } from '../../customer-select-table-dialog/customer-select-table-dialog.component';

@Component({
  selector: 'app-customer-invoice-summary-filter-form',
  templateUrl: './customer-invoice-summary-filter-form.component.html',
  styleUrls: ['./customer-invoice-summary-filter-form.component.scss']
})
export class CustomerInvoiceSummaryFilterFormComponent implements OnInit, IInlineManager {
  @Input()
  public editDisabled!: boolean

  @Output()
  public refreshClicked = new EventEmitter<CustomerInvoiceSummaryFilterFormData | undefined>(undefined)

  @Output()
  public pageReady = new EventEmitter<void>()

  isLoading: boolean = true;

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

  get isEditModeOff(): boolean {
    return !this.keyboardService.isEditModeActivated
  }
  
  public get formData() {
    const controls = this.filterForm.controls

    const WarehouseCode = this.warehouses.find(x => x.warehouseDescription === controls['WarehouseCode'].value)?.warehouseCode

    const formData = {
      WarehouseCode: WarehouseCode,
      Incoming: controls['Incoming'].value,
      CustomerID: this.customerData?.id,
      InvoiceDeliveryDateFrom: controls['InvoiceDeliveryDateFrom'].value,
      InvoiceDeliveryDateTo: controls['InvoiceDeliveryDateTo'].value
    } as CustomerInvoiceSummaryFilterFormData
    return formData
  }

  public TileCssClass = TileCssClass

  public filterForm!: FormGroup
  public filterFormId = 'stock-document-filter-form'
  filterFormNav!: InlineTableNavigatableForm
  outInvFormNav$ = new BehaviorSubject<InlineTableNavigatableForm[]>([])

  // WareHouse
  warehouses: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  // CountryCode
  countryCodes: CountryCode[] = [];
  
  get fromDateValue(): Date | undefined {
    if (!this.filterForm) {
      return undefined;
    }


    const tmp = this.filterForm.controls['InvoiceDeliveryDateFrom'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get toDateValue(): Date | undefined {
    if (!this.filterForm) {
      return undefined;
    }


    const tmp = this.filterForm.controls['InvoiceDeliveryDateTo'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  constructor(
    private readonly keyboardService: KeyboardNavigationService,
    private readonly wareHouseApi: WareHouseService,
    private readonly cs: CommonService,
    private readonly cdref: ChangeDetectorRef,
    private readonly customerService: CustomerService,
    private readonly dialogService: NbDialogService,
    private readonly bbxToastrService: BbxToastrService
  ) {
    this.filterForm = new FormGroup({
      Incoming: new FormControl(false, [Validators.required]),
      CustomerSearch: new FormControl(undefined, []),
      CustomerName: new FormControl(undefined, []),
      CustomerID: new FormControl(undefined, []),
      WarehouseCode: new FormControl(undefined, []),
      InvoiceDeliveryDateFrom: new FormControl(HelperFunctions.GetDateString(0,0,0), [
        Validators.required,
        this.validateFromDate.bind(this),
        validDate
      ]),
      InvoiceDeliveryDateTo: new FormControl('', [
        this.validateToDate.bind(this),
        validDate
      ])
    });
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
    }
  }

  public ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    throw new Error('Method not implemented.');
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
        this.keyboardService.SelectElementByCoordinate(0,3)
        this.keyboardService.ClickCurrentElement()
      }
    })
  }

  public RefreshData(): void {
    throw new Error('Method not implemented.');
  }

  IsTableFocused: boolean = false

  public TableRowDataChanged(changedData?: any, index?: number | undefined, col?: string | undefined): void {
    throw new Error('Method not implemented.');
  }

  public RecalcNetAndVat(): void {
    throw new Error('Method not implemented.');
  }

  private validateFromDate(control: AbstractControl): any {
    if (this.toDateValue === undefined) {
      return null;
    }

    let fromDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let toDateValue = HelperFunctions.GetDateIfDateStringValid(this.toDateValue.toDateString());

    const wrong = fromDate?.isAfter(toDateValue, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  private validateToDate(control: AbstractControl): any {
    if (this.fromDateValue === undefined) {
      return null;
    }

    let toDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let fromDateValue = HelperFunctions.GetDateIfDateStringValid(this.fromDateValue.toDateString());

    const wrong = toDate?.isBefore(fromDateValue, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
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

    const tempWh = this.wareHouseApi.GetTemporaryWarehouses()
    this.warehouses = tempWh;
    this.wareHouseData$.next(this.warehouses.map(x => x.warehouseDescription));

    await this.getAndSetWarehouses();

    this.filterFormNav.GenerateAndSetNavMatrices(true)

    this.keyboardService.SetCurrentNavigatable(this.filterFormNav)

    this.pageReady.emit()

    this.keyboardService.SetCurrentNavigatable(this.filterFormNav)
    this.keyboardService.SelectFirstTile()
    this.keyboardService.ClickCurrentElement()
  }

  public Refresh(): void {
    this.refreshClicked.emit(this.formData)
  }

  private SetCustomerFormFields(data?: Customer) {
    if (data === undefined) {
      this.filterForm.controls['CustomerName'].setValue(undefined);
      // this.filterForm.controls['CustomerAddress'].setValue(undefined);
      // this.filterForm.controls['CustomerTaxNumber'].setValue(undefined);
      return;
    }
    this.filterForm.controls['CustomerName'].setValue(data.customerName);
    // this.filterForm.controls['CustomerAddress'].setValue(data.postalCode + ', ' + data.city);
    // this.filterForm.controls['CustomerTaxNumber'].setValue(data.taxpayerNumber);
  }

  FillFormWithFirstAvailableCustomer(event: any): void {
    if (!!this.Subscription_FillFormWithFirstAvailableCustomer && !this.Subscription_FillFormWithFirstAvailableCustomer.closed) {
      this.Subscription_FillFormWithFirstAvailableCustomer.unsubscribe();
    }

    this.customerInputFilterString = event.target.value ?? '';

    if (this.customerInputFilterString.replace(' ', '') === '') {
      this.customerData = undefined;
      this.SetCustomerFormFields(undefined);
      this.isLoading = false
      return;
    }

    this.isLoading = true;
    this.Subscription_FillFormWithFirstAvailableCustomer = this.searchCustomer(this.customerInputFilterString)
  }

  private searchCustomer(term: string): Subscription {
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
    data.taxpayerNumber = (data.taxpayerId + (data.countyCode ?? '')) ?? '';

    const countryCodes = await lastValueFrom(this.customerService.GetAllCountryCodes());

    if (!!countryCodes && countryCodes.length > 0 && data.countryCode !== undefined && this.countryCodes.length > 0) {
      data.countryCode = this.countryCodes.find(x => x.value == data.countryCode)?.text ?? '';
    }

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
          this.bbxToastrService.show(res.errors?.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
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

  private AddSearchButtonToFormMatrix(): void {
    this.filterFormNav.Matrix[this.filterFormNav.Matrix.length - 1].push(this.SearchButtonId);
  }

}
