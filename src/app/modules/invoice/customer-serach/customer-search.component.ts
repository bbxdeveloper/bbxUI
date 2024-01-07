import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {GetCustomersParamListModel} from "../../customer/models/GetCustomersParamListModel";
import {CustomerService} from "../../customer/services/customer.service";
import {CustomerDiscountService} from "../../customer-discount/services/customer-discount.service";
import {CommonService} from "../../../services/common.service";
import {Customer} from "../../customer/models/Customer";
import {CustDiscountForGet} from "../../customer-discount/models/CustDiscount";
import {debounceTime, distinctUntilChanged, map, Subscription, switchMap, tap} from "rxjs";
import {KeyboardModes, KeyboardNavigationService} from "../../../services/keyboard-navigation.service";
import {CustomerSelectTableDialogComponent} from "../customer-select-table-dialog/customer-select-table-dialog.component";
import {CustomerDialogTableSettings} from "../../../../assets/model/TableSettings";
import {BbxDialogServiceService} from "../../../services/bbx-dialog-service.service";
import {TaxNumberSearchCustomerEditDialogComponent} from "../tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component";
import {EditCustomerDialogComponent} from "../../shared/edit-customer-dialog/edit-customer-dialog.component";
import {StatusService} from "../../../services/status.service";
import {Constants} from "../../../../assets/util/Constants";
import {HelperFunctions} from "../../../../assets/util/HelperFunctions";
import {GetCustomerByTaxNumberParams} from "../../customer/models/GetCustomerByTaxNumberParams";
import {BbxToastrService} from "../../../services/bbx-toastr-service.service";
import {FormControl, FormGroup} from "@angular/forms";
import {AttachDirection, TileCssClass} from "../../../../assets/model/navigation/Navigatable";
import {InlineTableNavigatableForm} from "../../../../assets/model/navigation/InlineTableNavigatableForm";
import {IInlineManager} from "../../../../assets/model/IInlineManager";

@Component({
  selector: 'app-customer-search',
  templateUrl: './customer-search.component.html',
  styleUrls: ['./customer-search.component.scss']
})
export class CustomerSearchComponent implements OnInit, OnDestroy {
  @Input() withDiscounts = false
  @Input() customer: Customer|undefined

  @Input() canCreate = true
  @Input() canEdit = true
  @Input() canGetFromNav = true
  @Input() searchFormId = 'customer-search-form'

  @Output() customerChanged = new EventEmitter<[Customer, boolean]>()
  @Output() customerDiscountsChanged = new EventEmitter<CustDiscountForGet[]>(true)
  @Output() loadingChanged = new EventEmitter<boolean>()
  @Output() focusIn = new EventEmitter<string>()
  @Output() focusOut = new EventEmitter<string>()

  private _searchByTaxNumber: boolean = false;
  public get searchByTaxNumber(): boolean { return this._searchByTaxNumber; }
  private set searchByTaxNumber(value: boolean) {
    if (value === this._searchByTaxNumber) {
      return
    }

    this._searchByTaxNumber = value;
    this.cdref.detectChanges();
    this.searchFormNav.GenerateAndSetNavMatrices(false, true);
  }

  TileCssClass = TileCssClass

  public searchForm: FormGroup
  public searchFormNav: InlineTableNavigatableForm

  private subscription: Subscription|undefined

  constructor(
    private readonly customerService: CustomerService,
    private readonly customerDiscountService: CustomerDiscountService,
    private readonly commonService: CommonService,
    private readonly cdref: ChangeDetectorRef,
    private readonly keyboardNavigationService: KeyboardNavigationService,
    private readonly dialogService: BbxDialogServiceService,
    private readonly statusService: StatusService,
    private readonly toasterService: BbxToastrService,
  ) {
    this.searchForm = new FormGroup({
      customerSearch: new FormControl('')
    })

    this.searchFormNav = new InlineTableNavigatableForm(
      this.searchForm,
      this.keyboardNavigationService,
      this.cdref,
      [],
      this.searchFormId,
      AttachDirection.DOWN,
      {} as IInlineManager
    )

    this.searchFormNav.OuterJump = true
  }

  public ngOnInit(): void {
    let search = ''
    this.subscription = this.searchForm.get('customerSearch')?.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => this.loadingChanged.emit(true)),
        tap((filter: string) => search = filter),
        map((filter: string) => ({
          IsOwnData: false,
          PageNumber: '1',
          PageSize: '1',
          SearchString: filter,
          OrderBy: 'customerName'
        } as GetCustomersParamListModel)),
        switchMap(request => this.customerService.GetAll(request)),
        tap(() => this.loadingChanged.emit(false)),
      )
      .subscribe({
        next: async res => {
          if (!!res && res.data !== undefined && res.data.length > 0) {
            const customer = res.data[0]
            // this.cachedCustomerName = res.data[0].customerName;
            this.searchByTaxNumber = false;

            this.raiseCustomerChanged(customer, false)

            if (this.withDiscounts) {
              this.loadingChanged.emit(true)
              await this.loadCustomerDiscounts(customer.id)
              this.loadingChanged.emit(false)
            }
          } else {
            this.searchByTaxNumber = search.length >= 8 && HelperFunctions.IsNumber(search)

            //this.buyerFormNav.FillForm({}, ['customerSearch']);
          }
        },
        error: (err) => {
          this.commonService.HandleError(err);
          this.loadingChanged.emit(false)
          this.searchByTaxNumber = false;
        },
        complete: this.loadingChanged.emit.bind(this, false)
    })
  }

  ngOnDestroy(): void {
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe()
    }
  }

  protected async loadCustomerDiscounts(customerId: number): Promise<void> {
    try {
      const customerDiscounts = await this.customerDiscountService?.getByCustomerAsync({ CustomerID: customerId }) ?? []

      this.customerDiscountsChanged.emit(customerDiscounts)
    }
    catch (error) {
      this.commonService.HandleError(error)
    }
  }

  public chooseDataForCustomerForm(): void {
    this.keyboardNavigationService.setEditMode(KeyboardModes.NAVIGATION);

    const filter = this.searchForm.get('customerSearch')?.value
    const dialogRef = this.dialogService.open(CustomerSelectTableDialogComponent, {
      context: {
        searchString: filter,
        allColumns: CustomerDialogTableSettings.CustomerSelectorDialogAllColumns,
        colDefs: CustomerDialogTableSettings.CustomerSelectorDialogColDefs
      }
    });
    dialogRef.onClose.subscribe(async (customer: Customer) => {
      if (!customer) {
        return;
      }

      this.raiseCustomerChanged(customer, true)

      if (this.withDiscounts) {
        this.loadingChanged.emit(true)
        await this.loadCustomerDiscounts(customer.id)
        this.loadingChanged.emit(false)
      }
    });
  }

  public createCustomer(): void {
    if (!this.canCreate) {
      return
    }

    this.keyboardNavigationService.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(TaxNumberSearchCustomerEditDialogComponent, {
      context: {
        createCustomer: true
      },
      closeOnEsc: false
    });
    dialogRef.onClose.subscribe({
      next: (customer: Customer) => {
        if (customer) {
          this.raiseCustomerChanged(customer, true)
        }
      },
      error: err => {
        this.commonService.HandleError(err);
      }
    });
  }

  public editCustomer(): void {
    if (!this.canEdit) {
      return
    }

    if (!this.customer || !this.customer.id) {
      return
    }

    const dialog = this.dialogService.open(EditCustomerDialogComponent, {
      context: {
        customerId: this.customer.id
      }
    })
    dialog.onClose.subscribe(refresh => {
      if (!refresh) {
        return
      }

      const request = {
        ID: this.customer!.id,
        PageSize: '1',
        OrderBy: 'customerName'
      } as GetCustomersParamListModel

      this.statusService.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING])
      this.customerService.GetAll(request)
        .subscribe({
          next: res => {
            if (!res.succeeded) {
              this.commonService.HandleError(res.errors)
            }

            if (res.data && res.data.length > 0) {
              this.raiseCustomerChanged(res.data[0], false)
            }
          },
          error: error => {
            this.commonService.HandleError(error)
            this.statusService.pushProcessStatus(Constants.BlankProcessStatus)
          },
          complete: () => {
            this.statusService.pushProcessStatus(Constants.BlankProcessStatus)
          }
        })
    })
  }

  public ChoseDataForFormByTaxNumber(): void {
    this.loadingChanged.emit(true)

    const filter = this.searchForm.get('customerSearch')?.value
    const request = { Taxnumber: filter } as GetCustomerByTaxNumberParams

    this.customerService.GetByTaxNumber(request).subscribe({
      next: async res => {
        if (!res || !res.data || !res.data.customerName || res.data.customerName.length === 0) {
          this.toasterService.showError(Constants.MSG_ERROR_CUSTOMER_NOT_FOUND_BY_TAX_ID)

          return
        }

        this.keyboardNavigationService.setEditMode(KeyboardModes.NAVIGATION);

        const customer = res.data
        customer.taxpayerNumber = `${customer.taxpayerId}-${customer.vatCode ?? ''}-${customer.countyCode ?? ''}`

        this.openTaxNumberSearchCustomerEditDialog(customer)
      },
      error: (err) => {
        this.commonService.HandleError(err)
        this.loadingChanged.emit(false)
      },
      complete: () => {
        this.loadingChanged.emit(false)
      },
    });
  }

  private openTaxNumberSearchCustomerEditDialog(customer: Customer): void {
    const dialogRef = this.dialogService.open(TaxNumberSearchCustomerEditDialogComponent, {
      context: {
        data: customer
      },
      closeOnEsc: false
    });
    dialogRef.onClose.subscribe({
      next: (customer: Customer) => this.raiseCustomerChanged(customer, true),
      error: err => this.commonService.HandleError(err)
    });
  }

  private raiseCustomerChanged(customer: Customer, navigate: boolean): void {
    this.customerChanged.emit([customer, navigate])
  }

  public onFormSearchFocused(): void {
    this.focusIn.emit('customerSearch')
  }

  public onFormSearchBlurred(): void {
    this.focusOut.emit('customerSearch')
  }
}
