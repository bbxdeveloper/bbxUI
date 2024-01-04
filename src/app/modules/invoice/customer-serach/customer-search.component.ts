import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {GetCustomersParamListModel} from "../../customer/models/GetCustomersParamListModel";
import {CustomerService} from "../../customer/services/customer.service";
import {CustomerDiscountService} from "../../customer-discount/services/customer-discount.service";
import {CommonService} from "../../../services/common.service";
import {Customer} from "../../customer/models/Customer";
import {CustDiscountForGet} from "../../customer-discount/models/CustDiscount";
import {Subscription} from "rxjs";
import {KeyboardModes, KeyboardNavigationService} from "../../../services/keyboard-navigation.service";
import {CustomerSelectTableDialogComponent} from "../customer-select-table-dialog/customer-select-table-dialog.component";
import {CustomerDialogTableSettings} from "../../../../assets/model/TableSettings";
import {BbxDialogServiceService} from "../../../services/bbx-dialog-service.service";
import {TaxNumberSearchCustomerEditDialogComponent} from "../tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component";

@Component({
  selector: 'app-customer-serach',
  templateUrl: './customer-search.component.html',
  styleUrls: ['./customer-search.component.scss']
})
export class CustomerSearchComponent implements OnInit, OnDestroy {
  @Input() withDiscounts = false

  @Output() customerChanged = new EventEmitter<[Customer, boolean]>()
  @Output() customerDiscountsChanged = new EventEmitter<CustDiscountForGet[]>(true)
  @Output() loadingChanged = new EventEmitter<boolean>()

  private _searchByTaxtNumber: boolean = false;
  public get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  private set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    // this.buyerFormNav.GenerateAndSetNavMatrices(false, true);
  }

  private Subscription_FillFormWithFirstAvailableCustomer?: Subscription

  private customerInputFilterString = ''

  constructor(
    private readonly customerService: CustomerService,
    private readonly customerDiscountService: CustomerDiscountService,
    private readonly commonService: CommonService,
    private readonly cdref: ChangeDetectorRef,
    private readonly keyboardNavigationService: KeyboardNavigationService,
    private readonly dialogService: BbxDialogServiceService,
  ) { }

  public ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.Subscription_FillFormWithFirstAvailableCustomer && !this.Subscription_FillFormWithFirstAvailableCustomer.closed) {
      this.Subscription_FillFormWithFirstAvailableCustomer.unsubscribe()
    }
  }

  public FillFormWithFirstAvailableCustomer(event: any): void {
    if (!!this.Subscription_FillFormWithFirstAvailableCustomer && !this.Subscription_FillFormWithFirstAvailableCustomer.closed) {
      this.Subscription_FillFormWithFirstAvailableCustomer.unsubscribe();
    }

    this.customerInputFilterString = event.target.value ?? '';

    this.loadingChanged.emit(true)

    this.Subscription_FillFormWithFirstAvailableCustomer = this.customerService.GetAll({
      IsOwnData: false, PageNumber: '1', PageSize: '1', SearchString: this.customerInputFilterString, OrderBy: 'customerName'
    } as GetCustomersParamListModel).subscribe({
      next: async res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          const customer = res.data[0]
          // this.cachedCustomerName = res.data[0].customerName;
          // this.searchByTaxtNumber = false;

          const shouldNavigate = false
          this.customerChanged.emit([customer, shouldNavigate])

          if (this.withDiscounts) {
            this.loadingChanged.emit(true)
            await this.loadCustomerDiscounts(customer.id)
            this.loadingChanged.emit(false)
          }
        } else {
          // if (this.customerInputFilterString.length >= 8 &&
          //   this.IsNumber(this.customerInputFilterString)) {
          //   this.searchByTaxtNumber = true;
          // } else {
          //   this.searchByTaxtNumber = false;
          // }
          // this.buyerFormNav.FillForm({}, ['customerSearch']);
        }
      },
      error: (err) => {
        this.commonService.HandleError(err);
        this.loadingChanged.emit(false)
        this.searchByTaxtNumber = false;
      },
      complete: () => {
        this.loadingChanged.emit(false)
      },
    });
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

    const dialogRef = this.dialogService.open(CustomerSelectTableDialogComponent, {
      context: {
        searchString: this.customerInputFilterString,
        allColumns: CustomerDialogTableSettings.CustomerSelectorDialogAllColumns,
        colDefs: CustomerDialogTableSettings.CustomerSelectorDialogColDefs
      }
    });
    dialogRef.onClose.subscribe(async (customer: Customer) => {
      if (!customer) {
        return;
      }

      const shouldNavigate = true
      this.customerChanged.emit([customer, shouldNavigate])

      if (this.withDiscounts) {
        this.loadingChanged.emit(true)
        await this.loadCustomerDiscounts(customer.id)
        this.loadingChanged.emit(false)
      }
    });
  }

  public createCustomer(): void {
    this.keyboardNavigationService.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(TaxNumberSearchCustomerEditDialogComponent, {
      context: {
        createCustomer: true
      },
      closeOnEsc: false
    });
    dialogRef.onClose.subscribe({
      next: (customer: Customer) => {
        if (!!customer) {
          const shouldNavigate = true
          this.customerChanged.emit([customer, shouldNavigate])
        }
      },
      error: err => {
        this.commonService.HandleError(err);
      }
    });
  }
}
