import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NbTable, NbSortDirection, NbTreeGridDataSourceBuilder, NbToastrService, NbSortRequest } from '@nebular/theme';
import { of, Subscription, lastValueFrom, pairwise } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { AttachDirection, NavigatableForm as InlineTableNavigatableForm } from 'src/assets/model/navigation/Nav';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { validDate } from 'src/assets/model/Validators';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { CustomerSelectTableDialogComponent } from '../customer-select-table-dialog/customer-select-table-dialog.component';
import { CreateOutgoingInvoiceRequest, OutGoingInvoiceFullData, OutGoingInvoiceFullDataToRequest } from '../models/CreateOutgoingInvoiceRequest';
import { InvoiceLine } from '../models/InvoiceLine';
import { InvoiceService } from '../services/invoice.service';
import { SaveDialogComponent } from '../save-dialog/save-dialog.component';
import { ProductService } from '../../product/services/product.service';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { TaxNumberSearchCustomerEditDialogComponent } from '../tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { GetCustomerByTaxNumberParams } from '../../customer/models/GetCustomerByTaxNumberParams';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { Actions, GetFooterCommandListFromKeySettings, GetUpdatedKeySettings, InvoiceIncomeManagerKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';
import { CustomerDialogTableSettings } from 'src/assets/model/TableSettings';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TableKeyDownEvent, isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { InvoicePriceChangeDialogComponent } from '../invoice-price-change-dialog/invoice-price-change-dialog.component';
import { ProductPriceChange } from '../models/ProductPriceChange';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { InvoiceBehaviorFactoryService } from '../services/invoice-behavior-factory.service';
import { PartnerLockService } from 'src/app/services/partner-lock.service';
import { PartnerLockHandlerService } from 'src/app/services/partner-lock-handler.service';
import { BaseInvoiceManagerComponent } from '../base-invoice-manager/base-invoice-manager.component';
import { ChooseProductRequest, ProductCodeManagerServiceService } from 'src/app/services/product-code-manager-service.service';
import { EditCustomerDialogManagerService } from '../../shared/services/edit-customer-dialog-manager.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';

@Component({
  selector: 'app-invoice-income-manager',
  templateUrl: './invoice-income-manager.component.html',
  styleUrls: ['./invoice-income-manager.component.scss'],
  providers: [PartnerLockHandlerService, PartnerLockService, InvoiceBehaviorFactoryService]
})
export class InvoiceIncomeManagerComponent extends BaseInvoiceManagerComponent implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  private Subscription_FillFormWithFirstAvailableCustomer?: Subscription;

  cachedCustomerName?: string;
  buyerData!: Customer;

  customerInputFilterString: string = '';

  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.activeFormNav.GenerateAndSetNavMatrices(false, true);
  }

  override colsToIgnore: string[] = ["productDescription", "lineNetAmount", "lineGrossAmount", "unitOfMeasureX"];
  requiredCols: string[] = ['productCode', 'quantity'];
  override allColumns = [
    'productCode',
    'productDescription',
    'quantity',
    'unitOfMeasureX',
    'unitPrice',
    'lineNetAmount',
    'lineGrossAmount',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Termékkód', objectKey: 'productCode', colKey: 'productCode',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "30%", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Megnevezés', objectKey: 'productDescription', colKey: 'productDescription',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "70%", textAlign: "left",
    },
    {
      label: 'Mennyiség', objectKey: 'quantity', colKey: 'quantity',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "100px", textAlign: "right", fInputType: 'formatted-number'
    },
    { // unitofmeasureX show, post unitofmeasureCode
      label: 'Me.e.', objectKey: 'unitOfMeasureX', colKey: 'unitOfMeasureX',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "80px", textAlign: "right"
    },
    {
      label: 'Besz.Ár', objectKey: 'unitPrice', colKey: 'unitPrice',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Nettó', objectKey: 'lineNetAmount', colKey: 'lineNetAmount',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Bruttó', objectKey: 'lineGrossAmount', colKey: 'lineGrossAmount',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
  ]
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  override outInvFormId: string = "outgoing-invoice-form";

  activeForm!: FormGroup;
  activeFormId: string = "buyer-form";
  activeFormNav!: InlineTableNavigatableForm;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  get invoiceIssueDateValue(): Date | undefined {
    if (!!!this.outInvForm) {
      return undefined;
    }
    const tmp = this.outInvForm.controls['invoiceIssueDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get invoiceDeliveryDateValue(): Date | undefined {
    if (!!!this.outInvForm) {
      return undefined;
    }
    const tmp = this.outInvForm.controls['invoiceDeliveryDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  override KeySetting: Constants.KeySettingsDct = InvoiceIncomeManagerKeySettings;
  override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  formKeyRows: any = {
    "customerSearch": {
      Action: Actions.Create,
      Row: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner felvétele', KeyType: Constants.KeyTypes.Fn }
    }
  }

  private editCustomerDialogSubscription = this.editCustomerDialog.refreshedCustomer.subscribe(customer => {
    this.buyerData = customer
    this.cachedCustomerName = customer.customerName;
    this.buyerFormNav.FillForm(customer, ['customerSearch']);
    this.buyerForm.controls['zipCodeCity'].setValue(this.buyerData.postalCode + " " + this.buyerData.city);
    this.searchByTaxtNumber = false;
  })

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    footerService: FooterService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvoiceLine>>,
    invoiceService: InvoiceService,
    customerService: CustomerService,
    cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    simpleToastrService: NbToastrService,
    bbxToastrService: BbxToastrService,
    cs: CommonService,
    productService: ProductService,
    status: StatusService,
    sideBarService: BbxSidebarService,
    khs: KeyboardHelperService,
    activatedRoute: ActivatedRoute,
    router: Router,
    behaviorFactory: InvoiceBehaviorFactoryService,
    tokenService: TokenStorageService,
    productCodeManagerService: ProductCodeManagerServiceService,
    printAndDownLoadService: PrintAndDownloadService,
    editCustomerDialog: EditCustomerDialogManagerService,
    customerDiscountService: CustomerDiscountService,
  ) {
    super(dialogService, footerService, dataSourceBuilder, invoiceService,
      customerService, cdref, kbS, simpleToastrService, bbxToastrService,
      cs, productService, status, sideBarService, khs,
      activatedRoute, router, behaviorFactory, tokenService,
      productCodeManagerService, printAndDownLoadService, editCustomerDialog, customerDiscountService)

    this.preventF12 = true
    this.InitialSetup();
    this.activatedRoute.url.subscribe(params => {
      this.mode = behaviorFactory.create(params[0].path)
      this.path = params[0].path
    })
    this.isPageReady = true;
  }

  public override onFormSearchFocused(event?: any, formFieldName?: string): void {
    this.customerSearchFocused = true;

    if (formFieldName && this.formKeyRows[formFieldName]) {
      let k = GetUpdatedKeySettings(this.KeySetting, this.formKeyRows[formFieldName].Row, this.formKeyRows[formFieldName].Action);
      this.commands = GetFooterCommandListFromKeySettings(k);
      this.fS.pushCommands(this.commands);
    }
  }
  public override onFormSearchBlurred(event?: any, formFieldName?: string): void {
    this.customerSearchFocused = false;

    if (formFieldName && this.formKeyRows[formFieldName]) {
      let k = this.KeySetting;
      this.commands = GetFooterCommandListFromKeySettings(k);
      this.fS.pushCommands(this.commands);
    }
  }

  private InitialSetup(): void {
    this.dbDataTableId = "invoice-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    // Init form and table content - empty
    this.senderData = {} as Customer;
    this.buyerData = {} as Customer;

    this.outGoingInvoiceData = new OutGoingInvoiceFullData({
      lineGrossAmount: 0.0,
      invoiceVatAmount: 0.0,
      invoiceNetAmount: 0.0,
      invoiceLines: [],
      warehouseCode: '0',
      customerID: -1,
      invoiceDeliveryDate: '',
      invoiceIssueDate: '',
      notice: '',
      paymentDate: '',
      paymentMethod: '',
      exchangeRate: 1,
      currencyCode: CurrencyCodes.HUF,
      invoiceDiscountPercent: 0
    });

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    if (this.outInvForm === undefined) {
      this.outInvForm = new FormGroup({
        paymentMethod: new FormControl('', [Validators.required]),
        customerInvoiceNumber: new FormControl('', [
          Validators.required
        ]),
        invoiceDeliveryDate: new FormControl('', [
          Validators.required,
          this.validateInvoiceDeliveryDate.bind(this),
          validDate
        ]),
        invoiceIssueDate: new FormControl('', [
          Validators.required,
          this.validateInvoiceIssueDate.bind(this),
          validDate
        ]),
        paymentDate: new FormControl('', [
          Validators.required,
          this.validatePaymentDate.bind(this),
          validDate
        ]),
        invoiceOrdinal: new FormControl('', []), // in post response
        notice: new FormControl('', []),
      });
    } else {
      this.outInvForm.reset(undefined);
    }

    this.activeForm = new FormGroup({
      customerSearch: new FormControl('', []),
    });

    this.activeFormNav = new InlineTableNavigatableForm(
      this.activeForm,
      this.kbS,
      this.cdref,
      this.buyersData,
      this.activeFormId,
      AttachDirection.DOWN,
      this
    );

    this.outInvFormNav = new InlineTableNavigatableForm(
      this.outInvForm,
      this.kbS,
      this.cdref,
      [this.outGoingInvoiceData],
      this.outInvFormId,
      AttachDirection.DOWN,
      this
    );

    this.activeFormNav!.OuterJump = true;
    this.outInvFormNav!.OuterJump = true;

    this.dbDataTable = new InlineEditableNavigatableTable(
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      () => {
        return new InvoiceLine(this.requiredCols);
      },
      this
    );

    this.dbDataTable!.OuterJump = true;

    // Refresh data
    this.refresh();

    this.outInvForm.controls["paymentMethod"].valueChanges.subscribe({
      next: v => {
        this.RecalcNetAndVat();
      }
    });
  }

  changeSort(sortRequest: NbSortRequest): void {
    this.dbDataDataSrc.sort(sortRequest);
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;

    setTimeout(() => {
      this.dbDataTable?.GenerateAndSetNavMatrices(false, true);
    }, 50);
  }

  getDirection(column: string): NbSortDirection {
    if (column === this.sortColumn) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  // invoiceDeliveryDate
  validateInvoiceDeliveryDate(control: AbstractControl): any {
    if (this.invoiceIssueDateValue === undefined || this.mode.incoming) {
      return null;
    }

    let deliveryDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let issueDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceIssueDateValue.toDateString());

    const wrong = deliveryDate?.isAfter(issueDate, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  validateInvoiceIssueDate(control: AbstractControl): any {
    if (this.invoiceDeliveryDateValue === undefined || this.mode.incoming) {
      return null;
    }

    let issueDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let deliveryDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceDeliveryDateValue.toDateString());

    const wrong = issueDate?.isBefore(deliveryDate, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  // paymentDate
  validatePaymentDate(control: AbstractControl): any {
    if (this.invoiceIssueDateValue === undefined) {
      return null;
    }

    let paymentDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let issueDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceIssueDateValue.toString());

    const wrong = paymentDate?.isBefore(issueDate, "day");
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  InitFormDefaultValues(): void {
    const dateStr = HelperFunctions.GenerateTodayFormFieldDateString();

    this.outInvForm.controls['invoiceIssueDate'].setValue(dateStr);
    this.outInvForm.controls['invoiceDeliveryDate'].setValue(dateStr);
    this.outInvForm.controls['paymentDate'].setValue(dateStr);

    this.outInvForm.controls['invoiceDeliveryDate'].valueChanges
      .pipe(pairwise())
      .subscribe({
        next: ([oldValue, newValue]: [string, string]) => {
          if (oldValue !== newValue) {
            this.outInvForm.controls['invoiceIssueDate'].updateValueAndValidity()
            this.outInvForm.controls['paymentDate'].updateValueAndValidity()
          }
        }
      });

    this.outInvForm.controls['invoiceIssueDate'].valueChanges
      .pipe(pairwise())
      .subscribe({
        next: ([oldValue, newValue]: [string, string]) => {
          if (oldValue !== newValue) {
            this.outInvForm.controls['invoiceDeliveryDate'].updateValueAndValidity()
            this.outInvForm.controls['paymentDate'].updateValueAndValidity()
          }
        }
      });
  }

  ToFloat(p: any): number {
    return p !== undefined || p === '' || p === ' ' ? parseFloat((p + '').replace(' ', '')) : 0;
  }

  override TableRowDataChanged(changedData?: any, index?: number, col?: string): void {
    if (!changedData || !changedData.productCode) {
      return
    }

    if (index === undefined) {
      return
    }

    if ((!!col && col === 'productCode') || col === undefined) {
      this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: product => {
          console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

          if (index !== undefined) {
            let tmp = this.dbData[index].data;

            tmp.productDescription = product.description ?? '';

            product.vatPercentage = product.vatPercentage === 0 ? 0.27 : product.vatPercentage;
            tmp.vatRate = product.vatPercentage ?? 1;
            product.vatRateCode = product.vatRateCode === null || product.vatRateCode === undefined || product.vatRateCode === '' ? '27%' : product.vatRateCode;
            tmp.vatRateCode = product.vatRateCode;

            tmp.ReCalc();

            this.dbData[index].data = tmp;

            this.dbDataDataSrc.setData(this.dbData);
          }

          this.RecalcNetAndVat();
        },
        error: err => {
          this.RecalcNetAndVat();
        }
      });
    } else {
      if (index !== undefined) {
        let tmp = this.dbData[index].data;

        tmp.ReCalc();

        this.dbData[index].data = tmp;

        this.dbDataDataSrc.setData(this.dbData);

        if (col === 'unitPrice' && index !== null && index !== undefined) {
          changedData.Save()
        }
      }

      this.RecalcNetAndVat();
    }

    const canSuggestPriceChange = () => {
      return (changedData.unitPrice < changedData.latestSupplyPrice || changedData.unitPrice > changedData.latestSupplyPrice)
        && changedData.unitPrice !== changedData.previousUnitPrice;
    }

    if (col === 'unitPrice' && index >= 0 && canSuggestPriceChange()) {
      changedData.previousUnitPrice = changedData.unitPrice

      this.suggestPriceChange(this.dbData[index].data, false)

      changedData.Save()
    }

    if (col === 'quantity' && index !== null && index !== undefined) {
      const validationResult = this.mode.validateQuantity(changedData.quantity)

      if (!validationResult) {
        changedData.quantity = HelperFunctions.ToInt(changedData.quantity)
        changedData.Save()
        return
      }

      setTimeout(() => {
        this.bbxToastrService.showError(validationResult)
      }, 0);
      this.dbData[index].data.Restore()

      this.dbDataTable.ClickByObjectKey('quantity')
    }
  }

  refresh(): void {
    const tempPaymentSubscription = this.invoiceService.GetTemporaryPaymentMethod().subscribe({
      next: d => {
        console.log('[GetTemporaryPaymentMethod]: ', d);
        this.paymentMethods = d;
        this._paymentMethods = this.paymentMethods.map(x => x.text) ?? [];
        this.paymentMethodOptions$.next(this._paymentMethods);
        if (this._paymentMethods.length > 0) {
          this.outInvForm.controls['paymentMethod'].setValue(this._paymentMethods[0])
        }
      }
    });
    this.invoiceService.GetPaymentMethods().subscribe({
      next: d => {
        if (!!tempPaymentSubscription && !tempPaymentSubscription.closed) {
          tempPaymentSubscription.unsubscribe();
        }
        console.log('[GetPaymentMethods]: ', d);
        this.paymentMethods = d;
        this._paymentMethods = this.paymentMethods.map(x => x.text) ?? [];
        this.paymentMethodOptions$.next(this._paymentMethods);
        if (this._paymentMethods.length > 0) {
          this.outInvForm.controls['paymentMethod'].setValue(this._paymentMethods[0])
        }
      },
      error: (err) => {
        this.cs.HandleError(err);
      },
      complete: () => { },
    });

    this.customerService.GetAll({ IsOwnData: false, OrderBy: 'customerName' }).subscribe({
      next: d => {
        // Possible buyers
        this.buyersData = d.data!;
        this.activeFormNav.Setup(this.buyersData);
        console.log('Buyers: ', d);

        // Products
        this.dbData = [];
        this.dbDataDataSrc.setData(this.dbData);

        this.customerService.GetAll({ IsOwnData: true, OrderBy: 'customerName' }).subscribe({
          next: d => {
            this.senderData = d.data?.filter(x => x.isOwnData)[0] ?? {} as Customer;

            this.table?.renderRows();
            this.RefreshTable();

            this.isLoading = false;
          },
          error: (err) => {
            this.cs.HandleError(err); this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        this.cs.HandleError(err); this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private filterBuyers(value: string): string[] {
    if (this.isEditModeOff) {
      return [];
    }
    const filterValue = value.toLowerCase();
    return [""].concat(this.buyersData.map(x => x.customerName).filter(optionValue => optionValue.toLowerCase().includes(filterValue)));
  }

  public ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }

  public ngAfterViewInit(): void {
    this.AfterViewInitSetup();
  }

  private AfterViewInitSetup(): void {
    this.InitFormDefaultValues();

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.activeFormNav.GenerateAndSetNavMatrices(true);
    this.outInvFormNav.GenerateAndSetNavMatrices(true);

    this.dbDataTable?.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore,
      'PRODUCT'
    );
    this.dbDataTable?.GenerateAndSetNavMatrices(true);
    this.dbDataTable?.PushFooterCommandList();

    setTimeout(() => {
      this.kbS.SetCurrentNavigatable(this.activeFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);

      this.cdref.detectChanges();
    }, 500);
  }

  public ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();

    this.editCustomerDialogSubscription.unsubscribe()
  }

  private UpdateOutGoingData(): CreateOutgoingInvoiceRequest<InvoiceLine> {
    this.outGoingInvoiceData.customerID = this.buyerData.id;
    this.outGoingInvoiceData.customerInvoiceNumber = this.outInvForm.controls['customerInvoiceNumber'].value;

    this.outGoingInvoiceData.notice = this.outInvForm.controls['notice'].value;

    this.outGoingInvoiceData.invoiceDeliveryDate = this.outInvForm.controls['invoiceDeliveryDate'].value;
    this.outGoingInvoiceData.invoiceIssueDate = this.outInvForm.controls['invoiceIssueDate'].value;
    this.outGoingInvoiceData.paymentDate = this.outInvForm.controls['paymentDate'].value;

    this.outGoingInvoiceData.paymentMethod = this.mode.Delivery ? this.DeliveryPaymentMethod :
      HelperFunctions.PaymentMethodToDescription(this.outInvForm.controls['paymentMethod'].value, this.paymentMethods);

    this.outGoingInvoiceData.warehouseCode = '1';

    this.outGoingInvoiceData.invoiceNetAmount = 0;
    this.outGoingInvoiceData.invoiceVatAmount = 0;

    this.RecalcNetAndVat();

    for (let i = 0; i < this.outGoingInvoiceData.invoiceLines.length; i++) {
      this.outGoingInvoiceData.invoiceLines[i].unitPrice = HelperFunctions.ToFloat(this.outGoingInvoiceData.invoiceLines[i].unitPrice);
      this.outGoingInvoiceData.invoiceLines[i].quantity = HelperFunctions.ToFloat(this.outGoingInvoiceData.invoiceLines[i].quantity);
      this.outGoingInvoiceData.invoiceLines[i].lineNumber = HelperFunctions.ToInt(i + 1);
    }

    this.outGoingInvoiceData.currencyCode = CurrencyCodes.HUF;
    this.outGoingInvoiceData.exchangeRate = 1;

    this.outGoingInvoiceData.warehouseCode = this.tokenService.wareHouse?.warehouseCode ?? '';

    this.outGoingInvoiceData.incoming = this.mode.incoming;
    this.outGoingInvoiceData.invoiceType = this.mode.invoiceType;
    this.outGoingInvoiceData.invoiceCategory = this.mode.invoiceCategory

    console.log('[UpdateOutGoingData]: ', this.outGoingInvoiceData, this.outInvForm.controls['paymentMethod'].value);

    this.outGoingInvoiceData.loginName = this.tokenService.user?.name
    this.outGoingInvoiceData.username = this.tokenService.user?.loginName

    return OutGoingInvoiceFullDataToRequest(this.outGoingInvoiceData);
  }

  Save(): void {
    this.activeForm.markAllAsTouched();
    this.outInvForm.markAllAsTouched();

    let valid = true;
    if (this.activeForm.invalid) {
      this.bbxToastrService.showError(`Nincs megadva szállító.`);
      valid = false;
    }
    if (this.outInvForm.invalid) {
      this.bbxToastrService.showError(`Teljesítési időpont, vagy más számlával kapcsolatos adat nincs megadva.`);
      valid = false;
    }
    if (this.dbData.find(x => !x.data.IsUnfinished()) === undefined) {
      this.bbxToastrService.showError(`Legalább egy érvényesen megadott tétel szükséges a mentéshez.`);
      valid = false;
    }
    if (!valid) {
      return;
    }

    this.outInvForm.controls['invoiceOrdinal'].reset();

    this.UpdateOutGoingData();

    console.log('Save: ', this.outGoingInvoiceData);

    this.isSaveInProgress = true;

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(SaveDialogComponent, {
      context: {
        data: this.outGoingInvoiceData,
        Incoming: this.mode.incoming,
        checkCustomerLimit: this.mode.checkCustomerLimit
      }
    });
    dialogRef.onClose.subscribe((res?: OutGoingInvoiceFullData) => {
      console.log("Selected item: ", res);
      if (!!res) {
        this.outGoingInvoiceData.invoiceDiscountPercent = res.invoiceDiscountPercent;
        const request = this.UpdateOutGoingData();
        let ordinal = '';

        this.status.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);
        this.invoiceService.CreateOutgoing(request).subscribe({
          next: async d => {
            try {
              if (!!d.data) {
                console.log('Save response: ', d);

                if (!!d.data) {
                  this.outInvForm.controls['invoiceOrdinal'].setValue(d.data.invoiceNumber ?? '');
                  ordinal = d.data.invoiceNumber ?? '';
                }

                this.simpleToastrService.show(
                  Constants.MSG_SAVE_SUCCESFUL,
                  Constants.TITLE_INFO,
                  Constants.TOASTR_SUCCESS_5_SEC
                );

                this.dbDataTable.RemoveEditRow();
                this.kbS.SelectFirstTile();

                this.status.pushProcessStatus(Constants.BlankProcessStatus);

                await this.printAndDownLoadService.openPrintDialog({
                  DialogTitle: Constants.TITLE_PRINT_INVOICE,
                  DefaultCopies: Constants.OutgoingIncomingInvoiceDefaultPrintCopy,
                  MsgError: `A ${ordinal} számla nyomtatása közben hiba történt.`,
                  MsgCancel: `A ${ordinal} számla nyomtatása nem történt meg.`,
                  MsgFinish: `A ${ordinal} számla nyomtatása véget ért.`,
                  Obs: this.invoiceService.GetReport.bind(this.invoiceService),
                  Reset: this.DelayedReset.bind(this),
                  ReportParams: {
                    "id": d.data?.id,
                    "copies": 1 // Ki lesz töltve dialog alapján
                  } as Constants.Dct,
                  DialogClasses: Constants.INVOICE_PRINT_DIALOG_MARGIN_CLASS
                } as PrintDialogRequest);
              } else {
                this.cs.HandleError(d.errors);
                this.isSaveInProgress = false;
                this.status.pushProcessStatus(Constants.BlankProcessStatus);
              }
            } catch (error) {
              this.Reset()
              this.cs.HandleError(error)
              this.isSaveInProgress = false;
            }
          },
          error: err => {
            this.cs.HandleError(err);
            this.isSaveInProgress = false;
            this.status.pushProcessStatus(Constants.BlankProcessStatus);
          },
          complete: () => {
          }
        });
      } else {
        this.isSaveInProgress = false;
        setTimeout(() => {
          this.kbS.SelectFirstTile()
          this.kbS.setEditMode(KeyboardModes.NAVIGATION)
        }, 200)
      }
    });
  }

  async HandleProductChoose(res: Product, wasInNavigationMode: boolean): Promise<void> {
    if (!!res) {
      this.status.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
      if (!wasInNavigationMode) {
        const currentRow = this.dbDataTable.FillCurrentlyEditedRow({ data: await this.ProductToInvoiceLine(res) }, ['productCode']);
        currentRow?.data.Save('productCode');

        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.dbDataTable.MoveNextInTable();
        setTimeout(() => {
          this.kbS.setEditMode(KeyboardModes.EDIT);
          this.kbS.ClickCurrentElement();
        }, 200);
      } else {
        const index = this.dbDataTable.data.findIndex(x => x.data.productCode === res.productCode);
        if (index !== -1) {
          this.kbS.SelectElementByCoordinate(0, index);
        }
      }
    }
    else if (!wasInNavigationMode) {
      setTimeout(() => {
        this.kbS.setEditMode(KeyboardModes.EDIT)
        this.kbS.ClickCurrentElement()
      }, 200)
    }

    this.status.pushProcessStatus(Constants.BlankProcessStatus);
    return of().toPromise();
  }

  private suggestPriceChange(invoiceLine: InvoiceLine, useChangedPrices: boolean): void {
    let priceChange = undefined
    if (useChangedPrices && invoiceLine.newUnitPrice1 && invoiceLine.newUnitPrice2) {
      priceChange = {
        newUnitPrice1: invoiceLine.newUnitPrice1,
        newUnitPrice2: invoiceLine.newUnitPrice2,
      } as ProductPriceChange
    }

    const dialog = this.dialogService.open(InvoicePriceChangeDialogComponent, {
      context: {
        productCode: invoiceLine.productCode,
        newPrice: invoiceLine.unitPrice,
        priceChange: priceChange,
      },
      closeOnEsc: false
    })

    dialog.onClose.subscribe((priceChange: ProductPriceChange) => {
      this.kbS.setEditMode(KeyboardModes.NAVIGATION)

      if (!priceChange) {
        return
      }

      invoiceLine.newUnitPrice1 = priceChange.newUnitPrice1
      invoiceLine.newUnitPrice2 = priceChange.newUnitPrice2
    })
  }

  ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    this.productCodeManagerService.ChooseDataForTableRow({
      dbDataTable: this.dbDataTable,
      rowIndex: rowIndex,
      wasInNavigationMode: wasInNavigationMode,
      productToInvoiceLine: this.ProductToInvoiceLine.bind(this),
      data: this.outGoingInvoiceData,
      path: this.path
    } as ChooseProductRequest).subscribe({
      next: (selectedProduct: Product) => this.HandleProductChoose(selectedProduct, wasInNavigationMode)
    });
  }

  ChooseDataForCustomerForm(): void {
    console.log("Selecting Customer from avaiable data.");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(CustomerSelectTableDialogComponent, {
      context: {
        searchString: this.customerInputFilterString,
        allColumns: CustomerDialogTableSettings.CustomerSelectorDialogAllColumns,
        colDefs: CustomerDialogTableSettings.CustomerSelectorDialogColDefs
      }
    });
    dialogRef.onClose.subscribe(async (res: Customer) => {
      console.log("Selected item: ", res);
      if (!!res) {
        this.buyerData = res;

        this.isLoading = true
        await this.loadCustomerDiscounts(this.buyerData.id)
        this.isLoading = false

        this.kbS.SetCurrentNavigatable(this.outInvFormNav);
        this.kbS.SelectFirstTile();
        this.kbS.setEditMode(KeyboardModes.EDIT);
      }
    });
  }

  RefreshData(): void { }

  override async ProductToInvoiceLine(p: Product): Promise<InvoiceLine> {
    const res = new InvoiceLine(this.requiredCols)

    res.productCode = p.productCode!

    res.productDescription = p.description ?? ''

    res.quantity = 0

    p.productGroup = !!p.productGroup ? p.productGroup : '-'

    res.latestSupplyPrice = p.latestSupplyPrice

    res.unitPrice = p.latestSupplyPrice!

    res.vatRateCode = p.vatRateCode

    res.vatRate = p.vatPercentage ?? 1

    res.ReCalc()

    res.unitOfMeasure = p.unitOfMeasure
    res.unitOfMeasureX = p.unitOfMeasureX

    // console.log('ProductToInvoiceLine res: ', res)

    return res
  }

  IsNumber(val: string): boolean {
    let val2 = val.replace(' ', '');
    return !isNaN(parseFloat(val2));
  }

  FillFormWithFirstAvailableCustomer(event: any): void {
    if (!!this.Subscription_FillFormWithFirstAvailableCustomer && !this.Subscription_FillFormWithFirstAvailableCustomer.closed) {
      this.Subscription_FillFormWithFirstAvailableCustomer.unsubscribe();
    }
    this.customerInputFilterString = event.target.value ?? '';
    this.isLoading = true;
    this.Subscription_FillFormWithFirstAvailableCustomer = this.customerService.GetAll({
      IsOwnData: false, PageNumber: '1', PageSize: '1', SearchString: this.customerInputFilterString, OrderBy: 'customerName'
    } as GetCustomersParamListModel).subscribe({
      next: async res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.buyerData = res.data[0];
          this.cachedCustomerName = res.data[0].customerName;
          this.activeFormNav.FillForm(res.data[0], ['customerSearch']);
          this.searchByTaxtNumber = false;

          this.isLoading = true
          await this.loadCustomerDiscounts(this.buyerData.id)
          this.isLoading = false
        } else {
          if (this.customerInputFilterString.length >= 8 &&
            this.IsNumber(this.customerInputFilterString)) {
            this.searchByTaxtNumber = true;
          } else {
            this.searchByTaxtNumber = false;
          }
          this.activeFormNav.FillForm({}, ['customerSearch']);
        }
      },
      error: (err) => {
        this.cs.HandleError(err); this.isLoading = false;
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

    const countryCodes = await lastValueFrom(this.customerService.GetAllCountryCodes());

    if (data.countryCode !== undefined && !!countryCodes && countryCodes.length > 0) {
      data.countryCode = countryCodes.find(x => x.value == data.countryCode)?.text ?? '';
    }

    return data;
  }

  override SetDataForForm(data: any): void {
    if (!!data) {
      this.buyerData = { ...data as Customer };
      data.zipCodeCity = data.postalCode + ' ' + data.city;

      this.activeFormNav.FillForm(data);

      this.kbS.SetCurrentNavigatable(this.outInvFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);
    }
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
              this.SetDataForForm(res);
            },
            error: err => {
              this.cs.HandleError(err);
            }
          });
        } else {
          this.bbxToastrService.showError(Constants.MSG_ERROR_CUSTOMER_NOT_FOUND_BY_TAX_ID)
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

  /////////////////////////////////////////////
  ////////////// KEYBOARD EVENTS //////////////
  /////////////////////////////////////////////

  @HostListener('window:keydown.f9', ['$event'])
  public onF9(event: Event): void {
    if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
      return
    }

    const regex = /PRODUCT-\d+-(\d+)/
    const match = this.kbS.Here.match(regex)
    if (match) {
      const rowIndex = parseInt(match[1])

      if (rowIndex === this.dbData.length - 1) {
        setTimeout(() => {
          this.bbxToastrService.showError(Constants.MSG_CANNOT_ON_EDIT_ROW);
        }, 0);
      } else {
        this.suggestPriceChange(this.dbData[rowIndex].data, true)
      }
    }
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (!this.isSaveInProgress && event.ctrlKey && event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return;
      }
      this.Save();
      return;
    }
    this.HandleKeyDown(event);
  }

  public override HandleKeyDown(event: Event | TableKeyDownEvent, isForm: boolean = false): void {
    if (isTableKeyDownEvent(event)) {
      let _event = event.Event;
      if (_event.ctrlKey && _event.key !== 'Enter') {
        return
      }
      switch (_event.key) {
        case KeyBindings.F11: {
          _event.stopImmediatePropagation();
          _event.stopPropagation();
          _event.preventDefault();
          break
        }
        case this.KeySetting[Actions.Delete].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event);
            return;
          }
          _event.preventDefault();

          HelperFunctions.confirm(this.dialogService, HelperFunctions.StringFormat(Constants.MSG_CONFIRMATION_DELETE_PARAM, event.Row.data), () => {
            this.dbDataTable?.HandleGridDelete(_event, event.Row, event.RowPos, event.ObjectKey)
          });
          break;
        }
        case this.KeySetting[Actions.Search].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event);
            return;
          }
          _event.preventDefault();
          this.ChooseDataForTableRow(event.RowPos, event.WasInNavigationMode);
          break;
        }
        case this.KeySetting[Actions.Create].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event);
            return;
          }
          _event.preventDefault();
          this.CreateProduct(event.RowPos, product => {
            return this.HandleProductChoose(product, event.WasInNavigationMode);
          });
          break;
        }
        case this.KeySetting[Actions.Reset].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event)
            return
          }

          this.loadInvoiceItems()

          this.UpdateOutGoingData()

          break
        }
        case this.KeySetting[Actions.Refresh].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event)
            return
          }
          _event.preventDefault()

          if (this.kbS.p.y === this.dbData.length - 1) {
            break
          }

          const productCode = this.dbData[this.kbS.p.y].data.productCode
          this.openProductStockInformationDialog(productCode)
          break
        }
        case KeyBindings.Enter: {
          if (!this.isSaveInProgress && _event.ctrlKey && _event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
            if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
              _event.preventDefault();
              _event.stopImmediatePropagation();
              _event.stopPropagation();
              return;
            }
            this.Save();
            return;
          }
          break;
        }
      }
    }
    else {
      const _event = event as KeyboardEvent
      if (_event.ctrlKey && _event.key !== 'Enter') {
        return
      }
      switch ((event as KeyboardEvent).key) {
        case KeyBindings.F11: {
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
          break
        }
        case this.KeySetting[Actions.Search].KeyCode: {
          if (!isForm) {
            return;
          }
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          event.preventDefault();
          this.ChooseDataForCustomerForm();
          break;
        }
        case this.KeySetting[Actions.Create].KeyCode: {
          if (!isForm) {
            return;
          }
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          event.preventDefault();
          this.CreateCustomer(event);
          break;
        }
        case this.KeySetting[Actions.Lock].KeyCode: {
          if (!isForm) {
            return;
          }
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          HelperFunctions.StopEvent(event)

          if (this.kbS.IsCurrentNavigatable(this.activeFormNav)) {
            this.editCustomerDialog.open(this.buyerData?.id)
          }
          break;
        }
      }
    }
  }

}
