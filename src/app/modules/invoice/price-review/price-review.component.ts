import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NbTable, NbSortDirection, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService, NbSortRequest } from '@nebular/theme';
import { Observable, of, BehaviorSubject, Subscription, lastValueFrom, pairwise } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { AttachDirection, NavigatableForm as InlineTableNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { validDate } from 'src/assets/model/Validators';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CustomerService } from '../../customer/services/customer.service';
import { Product, getPriceByPriceType } from '../../product/models/Product';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { CustomerSelectTableDialogComponent } from '../customer-select-table-dialog/customer-select-table-dialog.component';
import { CreateOutgoingInvoiceRequest, OutGoingInvoiceFullData, OutGoingInvoiceFullDataToRequest } from '../models/CreateOutgoingInvoiceRequest';
import { InvoiceLine } from '../models/InvoiceLine';
import { PaymentMethod } from '../models/PaymentMethod';
import { InvoiceService } from '../services/invoice.service';
import { SaveDialogComponent } from '../save-dialog/save-dialog.component';
import { ProductService } from '../../product/services/product.service';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { TaxNumberSearchCustomerEditDialogComponent } from '../tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { GetCustomerByTaxNumberParams } from '../../customer/models/GetCustomerByTaxNumberParams';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { Actions, GetFooterCommandListFromKeySettings, GetUpdatedKeySettings, KeyBindings, PricePreviewKeySettings } from 'src/assets/util/KeyBindings';
import { CustomerDialogTableSettings, GetPendingDeliveryNotesDialogTableSettings } from 'src/assets/model/TableSettings';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';
import { TableKeyDownEvent, isTableKeyDownEvent, InputFocusChangedEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { GetPendingDeliveryNotesDialogComponent } from '../get-pending-delivery-notes-dialog/get-pending-delivery-notes-dialog.component';
import { PendingDeliveryNote } from '../models/PendingDeliveryNote';
import { GetInvoiceRequest } from '../models/GetInvoiceRequest';
import { ValidationMessage } from 'src/assets/util/ValidationMessages';
import { CustDiscountForGet } from '../../customer-discount/models/CustDiscount';
import { PricePreviewRequest } from '../models/PricePreviewRequest';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { InvoiceBehaviorFactoryService } from '../services/invoice-behavior-factory.service';
import { InvoiceBehaviorMode } from '../models/InvoiceBehaviorMode';
import { PartnerLockService } from 'src/app/services/partner-lock.service';
import { PartnerLockHandlerService } from 'src/app/services/partner-lock-handler.service';
import { EditCustomerDialogManagerService } from '../../shared/services/edit-customer-dialog-manager.service';
import { ProductStockInformationDialogComponent } from '../../shared/dialogs/product-stock-information-dialog/product-stock-information-dialog.component';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

@Component({
  selector: 'app-price-review',
  templateUrl: './price-review.component.html',
  styleUrls: ['./price-review.component.scss'],
  providers: [PartnerLockHandlerService, PartnerLockService, InvoiceBehaviorFactoryService]
})
export class PriceReviewComponent extends BaseInlineManagerComponent<InvoiceLine> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  private Subscription_FillFormWithFirstAvailableCustomer?: Subscription;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  cachedCustomerName?: string;

  senderData: Customer|undefined;
  buyerData!: Customer;

  buyersData: Customer[] = [];
  filteredBuyerOptions$: Observable<string[]> = of([]);

  paymentMethods: PaymentMethod[] = [];
  _paymentMethods: string[] = [];
  paymentMethodOptions$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  outGoingInvoiceData!: OutGoingInvoiceFullData;

  customerInputFilterString: string = '';

  isPageReady = false;

  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.buyerFormNav.GenerateAndSetNavMatrices(false, true);
  }

  override colsToIgnore: string[] = ["productDescription", "unitOfMeasureX", 'quantity', 'rowNetPrice','rowGrossPriceRounded'];
  override allColumns = [
    'productCode',
    'productDescription',
    'quantity',
    'unitOfMeasureX',
    'unitPrice',
    'rowNetPrice',
    'rowGrossPriceRounded',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Termékkód', objectKey: 'productCode', colKey: 'productCode',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "30%", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create, fReadonly: true,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Megnevezés', objectKey: 'productDescription', colKey: 'productDescription',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "70%", textAlign: "left",
    },
   {
      label: 'Mennyiség', objectKey: 'quantity', colKey: 'quantity',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "100px", textAlign: "right", fInputType: 'formatted-number'
    },
    { // unitofmeasureX show, post unitofmeasureCode
      label: 'Me.e.', objectKey: 'unitOfMeasureX', colKey: 'unitOfMeasureX',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "80px", textAlign: "right"
    },
    {
      label: 'Ár', objectKey: 'unitPrice', colKey: 'unitPrice',
      defaultValue: '', type: 'number', mask: "", fReadonly: false,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number',
      checkIfReadonly: (row: TreeGridNode<InvoiceLine>) => HelperFunctions.isEmptyOrSpaces(row.data.productCode),
    },
    {
      label: 'Nettó', objectKey: 'rowNetPrice', colKey: 'rowNetPrice',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Bruttó', objectKey: 'rowGrossPriceRounded', colKey: 'rowGrossPriceRounded',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
  ]

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  outInvForm!: FormGroup;
  outInvFormId: string = "outgoing-invoice-form";
  outInvFormNav$: BehaviorSubject<InlineTableNavigatableForm[]> = new BehaviorSubject<InlineTableNavigatableForm[]>([]);

  buyerForm!: FormGroup;
  buyerFormId: string = "buyer-form";
  buyerFormNav!: InlineTableNavigatableForm;

  private tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  get editDisabled() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT && !this.isLoading && !this.isSaveInProgress;
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

  public KeySetting: Constants.KeySettingsDct = PricePreviewKeySettings;
  override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  formKeyRows: any = {
    "customerSearch": {
      Action: Actions.Create,
      Row: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner felvétele', KeyType: Constants.KeyTypes.Fn }
    }
  }

  // private originalCustomerID: number = -1

  private invoiceId: number = -1
  public mode!: InvoiceBehaviorMode

  private editCustomerDialogSubscription = this.editCustomerDialog.refreshedCustomer.subscribe(customer => {
    this.buyerData = customer
    this.cachedCustomerName = customer.customerName;
    this.searchByTaxtNumber = false;
  })

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvoiceLine>>,
    private readonly invoiceService: InvoiceService,
    private readonly customerService: CustomerService,
    private readonly cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private readonly simpleToastrService: NbToastrService,
    private readonly bbxToastrService: BbxToastrService,
    cs: CommonService,
    sts: StatusService,
    private readonly productService: ProductService,
    private readonly printAndDownLoadService: PrintAndDownloadService,
    sideBarService: BbxSidebarService,
    khs: KeyboardHelperService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly custDiscountService: CustomerDiscountService,
    private readonly tokenService: TokenStorageService,
    private readonly bbxToasterService: BbxToastrService,
    router: Router,
    behaviorFactory: InvoiceBehaviorFactoryService,
    private readonly editCustomerDialog: EditCustomerDialogManagerService,
  ) {
    super(dialogService, kbS, fS, cs, sts, sideBarService, khs, router);
    this.preventF12 = true
    this.activatedRoute.url.subscribe(params => {
      this.mode = behaviorFactory.create(params[0].path)
      this.InitialSetup();
      this.isPageReady = true;
    })
  }

  public currentRealQty(): number | string {
    if (!this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      return 0;
    }

    return this.dbDataTable?.data[this.kbS.p.y]?.data.realQty ?? 0;
  }

  public inlineInputFocusChanged(event: InputFocusChangedEvent): void {
    if (!event.Focused) {
      this.dbData.forEach(x => x.data.ReCalc());
      this.RecalcNetAndVat();
    }

    if (event?.FieldDescriptor?.keySettingsRow && event?.FieldDescriptor?.keyAction) {
      if (event.Focused) {
        let k = GetUpdatedKeySettings(this.KeySetting, event.FieldDescriptor.keySettingsRow, event.FieldDescriptor.keyAction);
        this.commands = GetFooterCommandListFromKeySettings(k);
        this.fS.pushCommands(this.commands);
      } else {
        let k = this.KeySetting;
        this.commands = GetFooterCommandListFromKeySettings(k);
        this.fS.pushCommands(this.commands);
      }
    }
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
    })

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.setupOutInvForm()

    this.buyerForm = new FormGroup({
      customerSearch: new FormControl('', []),
    });

    this.buyerFormNav = new InlineTableNavigatableForm(
      this.buyerForm,
      this.kbS,
      this.cdref,
      this.buyersData,
      this.buyerFormId,
      AttachDirection.DOWN,
      this
    );

    this.buyerFormNav!.OuterJump = true;

    console.log('new InvoiceLine(): ', new InvoiceLine());

    this.dbDataTable = new InlineEditableNavigatableTable(
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      () => {
        return new InvoiceLine();
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

  private setupOutInvForm(): void {
    if (this.outInvForm) {
      this.outInvForm.reset(undefined)
      return
    }

    this.outInvForm = new FormGroup({
      paymentMethod: new FormControl('', [Validators.required]),
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
      invoiceNumber: new FormControl('', []), // in post response
      notice: new FormControl('', []),
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
    if (this.invoiceIssueDateValue === undefined) {
      return null;
    }

    let deliveryDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let issueDate = HelperFunctions.GetDateIfDateStringValid(this.invoiceIssueDateValue.toDateString());

    const wrong = deliveryDate?.isAfter(issueDate, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  validateInvoiceIssueDate(control: AbstractControl): any {
    if (this.invoiceDeliveryDateValue === undefined) {
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
    this.outInvForm.controls['invoiceIssueDate'].setValue(HelperFunctions.GetDateString(0,0,0));
    this.outInvForm.controls['invoiceDeliveryDate'].setValue(HelperFunctions.GetDateString(0, 0, 0));
    this.outInvForm.controls['paymentDate'].setValue(HelperFunctions.GetDateString(0, 0, 0));

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

  RecalcNetAndVat(): void {
    // this.invoiceStatisticsService.InvoiceLines = this.dbData;

    this.outGoingInvoiceData.invoiceLines = this.dbData.map(x => x.data);

    this.outGoingInvoiceData.invoiceNetAmount = this.outGoingInvoiceData.invoiceLines
      .map(x => HelperFunctions.ToFloat(x.rowNetPrice))
      .reduce((sum, current) => sum + current, 0);

    this.outGoingInvoiceData.invoiceVatAmount = this.outGoingInvoiceData.invoiceLines
      .map(x => HelperFunctions.ToFloat(x.lineVatAmount))
      .reduce((sum, current) => sum + current, 0);

    let _paymentMethod = this.mode.Delivery ? this.DeliveryPaymentMethod :

    HelperFunctions.PaymentMethodToDescription(this.outInvForm.controls['paymentMethod'].value, this.paymentMethods);

    // Csak gyűjtőszámlánál
    this.outGoingInvoiceData.lineGrossAmount = this.outGoingInvoiceData.invoiceLines
      .map(x => HelperFunctions.ToFloat(x.rowGrossPrice))
      .reduce((sum, current) => sum + current, 0);

    if (_paymentMethod === "CASH" && this.outGoingInvoiceData.currencyCode === CurrencyCodes.HUF) {
      this.outGoingInvoiceData.lineGrossAmount = HelperFunctions.CashRound(this.outGoingInvoiceData.lineGrossAmount);
    } else {
      this.outGoingInvoiceData.lineGrossAmount = HelperFunctions.Round(this.outGoingInvoiceData.lineGrossAmount);
    }

    this.outGoingInvoiceData.invoiceNetAmount = HelperFunctions.Round2(this.outGoingInvoiceData.invoiceNetAmount, 1);
    this.outGoingInvoiceData.invoiceVatAmount = HelperFunctions.Round(this.outGoingInvoiceData.invoiceVatAmount);
  }

  // Kell ez a metódus különben a termékkód mező írható lesz
  public HandleGridCodeFieldEnter(event: any, row: TreeGridNode<InvoiceLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!event) {
      this.bbxToastrService.close();
      event.stopPropagation();
    }
    if (this.editDisabled) {
      const colDef = this.colDefs.find(x => x.objectKey === objectKey)
      if (colDef?.fReadonly) {
        return
      }

      this.dbDataTable.HandleGridEnter(row, rowPos, objectKey, colPos, inputId, fInputType);
    }
  }

  public isRowInErrorState(row: TreeGridNode<InvoiceLine>): boolean {
    return row.data.priceReview
  }

  public TableRowDataChanged(changedData?: any, index?: number, col?: string): void {
    if (!changedData && !changedData.productCode) {
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
      }

      this.RecalcNetAndVat();
    }

    if (col === 'unitPrice' && index !== null && index !== undefined) {
      if (changedData.unitPrice > 0) {
        changedData.priceReview = false
        changedData.Save()

        return
      }

      this.bbxToastrService.show(
        ValidationMessage.ErrorMin,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      )

      this.dbData[index].data.Restore()
    }

    if (col === 'quantity' && index !== null && index !== undefined) {
      const validationResult = this.mode.validateQuantity(changedData.quantity, changedData.limit)

      if (!validationResult) {
        changedData.quantity = HelperFunctions.ToInt(changedData.quantity)
        changedData.Save()
        return
      }

      setTimeout(() => {
        this.bbxToasterService.show(
          validationResult,
          Constants.TITLE_ERROR,
          Constants.TOASTR_ERROR
        )
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
    })

    this.customerService.GetAll({ IsOwnData: false, OrderBy: 'customerName' }).subscribe({
      next: d => {
        // Possible buyers
        this.buyersData = d.data!;
        this.buyerFormNav.Setup(this.buyersData);
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
    if (this.editDisabled) {
      return [];
    }
    const filterValue = value.toLowerCase();
    return [""].concat(this.buyersData.map(x => x.customerName).filter(optionValue => optionValue.toLowerCase().includes(filterValue)));
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }

  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.buyerFormNav.GenerateAndSetNavMatrices(true);
    // this.outInvFormNav.GenerateAndSetNavMatrices(true);

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

    this.InitFormDefaultValues();

    setTimeout(() => {
      this.kbS.SetCurrentNavigatable(this.buyerFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);

      this.cdref.detectChanges();
      const dialog = this.dialogService.open(GetPendingDeliveryNotesDialogComponent, {
        context: {
          allColumns: GetPendingDeliveryNotesDialogTableSettings.AllColumns,
          colDefs: GetPendingDeliveryNotesDialogTableSettings.ColDefs,
          partnerLock: this.mode.partnerLock
        },
        closeOnEsc: false,
        closeOnBackdropClick: false
      })
      dialog.onClose.subscribe(this.fillPageWithData.bind(this))
    }, 500);
  }

  private async fillPageWithData(result: PendingDeliveryNote): Promise<void> {
    if (!result) {
      return
    }

    this.isLoading = true

    try {
      const response = await this.invoiceService.Get({
        id: result.invoiceID,
        fullData: true
      } as GetInvoiceRequest)

      this.invoiceId = response.id

      this.buyerData = {
        id: response.customerID,
        customerName: response.customerName,
        postalCode: response.customerPostalCode,
        city: response.customerCity,
        additionalAddressDetail: response.customerAdditionalAddressDetail,
        customerBankAccountNumber: response.customerBankAccountNumber,
        taxpayerNumber: response.customerTaxpayerNumber,
        thirdStateTaxId: response.customerThirdStateTaxId,
        comment: response.CustomerComment,
        customerVatStatus: response.customerVatStatus,
      } as Customer

      const controls = this.outInvForm.controls
      controls['invoiceDeliveryDate'].setValue(response.invoiceDeliveryDate)
      controls['invoiceIssueDate'].setValue(response.invoiceIssueDate)
      controls['invoiceNumber'].setValue(response.invoiceNumber)
      controls['paymentDate'].setValue(response.paymentDate)

      this.outGoingInvoiceData.invoiceDiscountPercent = response.invoiceDiscountPercent

      for (let i = 0; i < response.invoiceLines.length; i++) {
        const currentLine = response.invoiceLines[i]
        const productData = await this.productService.getProductByCodeAsync({ ProductCode: currentLine.productCode } as GetProductByCodeRequest)
        if (productData && productData.productCode) {
          const warehouseID = this.tokenService.wareHouse?.id
          response.invoiceLines[i].realQty = productData.stocks?.find(x => x.warehouseID === warehouseID)?.realQty ?? 0
        }
      }

      this.dbData = response.invoiceLines
        .map(x => ({ data: Object.assign(new InvoiceLine(), x), uid: this.nextUid() }))

      // vatPercentage is missing from the model but we get it from the backend
      // we have vatRate
      this.dbData.forEach(x => {
        x.data.vatRate = (x.data as any).vatPercentage;
        x.data.productDescription = (x.data as any).lineDescription

        x.data.Save()
      })

      this.dbDataDataSrc.setData(this.dbData)

      this.RefreshTable()

      this.RecalcNetAndVat()
    }
    catch (error) {
      this.cs.HandleError(error)
    }
    finally {
      this.isLoading = false
    }
  }

  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();

    this.mode.partnerLock?.unlockCustomer()

    this.editCustomerDialogSubscription.unsubscribe()
  }

  private UpdateOutGoingData(): CreateOutgoingInvoiceRequest<InvoiceLine> {
    this.outGoingInvoiceData.customerID = this.buyerData.id;

    this.outGoingInvoiceData.notice = this.outInvForm.controls['notice'].value;

    this.outGoingInvoiceData.invoiceDeliveryDate = this.outInvForm.controls['invoiceDeliveryDate'].value;
    this.outGoingInvoiceData.invoiceIssueDate = this.outInvForm.controls['invoiceIssueDate'].value;
    this.outGoingInvoiceData.paymentDate = this.outInvForm.controls['paymentDate'].value;

    this.outGoingInvoiceData.paymentMethod = HelperFunctions.PaymentMethodToDescription(this.outInvForm.controls['paymentMethod'].value, this.paymentMethods)

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

    console.log('[UpdateOutGoingData]: ', this.outGoingInvoiceData, this.outInvForm.controls['paymentMethod'].value);

    this.outGoingInvoiceData.loginName = this.tokenService.user?.name
    this.outGoingInvoiceData.username = this.tokenService.user?.loginName

    return OutGoingInvoiceFullDataToRequest(this.outGoingInvoiceData, false);
  }

  Save(): void {
    this.buyerForm.markAllAsTouched();
    this.outInvForm.markAllAsTouched();

    let valid = true;
    if (this.buyerForm.invalid) {
      this.bbxToastrService.show(
        `Nincs megadva vevő.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      valid = false;
    }
    if (this.outInvForm.invalid) {
      this.bbxToastrService.show(
        `Teljesítési időpont, vagy más számlával kapcsolatos adat nincs megadva.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      valid = false;
    }

    if (!valid) {
      return;
    }

    this.outInvForm.controls['invoiceNumber'].reset();

    this.UpdateOutGoingData();

    console.log('Save: ', this.outGoingInvoiceData);

    this.isSaveInProgress = true;

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(SaveDialogComponent, {
      context: {
        data: this.outGoingInvoiceData,
        isDiscountVisible: true,
        forceDisableOutgoingDelivery: true,
        Incoming: this.mode.incoming,
        checkCustomerLimit: this.mode.checkCustomerLimit
      }
    });
    dialogRef.onClose.subscribe(async (res?: OutGoingInvoiceFullData) => {
      console.log("Selected item: ", res);
      if (!res) {
        this.isSaveInProgress = false;
        this.kbS.setEditMode(KeyboardModes.NAVIGATION)
        return
      }

      try {
        this.isSaveInProgress = true
        this.status.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING])

        const request = {
          customerID: this.buyerData.id,
          id: this.invoiceId,
          invoiceLines: this.dbData
            .filter(x => x.data.productCode && x.data.productCode !== '')
            .map(x => ({
              id: parseInt(x.data.id!),
              unitPrice: x.data.unitPrice
            }))
        } as PricePreviewRequest

        const response = await this.invoiceService.pricePreview(request)

        this.status.pushProcessStatus(Constants.BlankProcessStatus)

        this.mode.partnerLock?.unlockCustomer()

        this.simpleToastrService.show(
          Constants.MSG_SAVE_SUCCESFUL,
          Constants.TITLE_INFO,
          Constants.TOASTR_SUCCESS_5_SEC
        );

        await this.printAndDownLoadService.openPrintDialog({
          DialogTitle: Constants.TITLE_PRINT_INVOICE,
          DefaultCopies: Constants.OutgoingIncomingInvoiceDefaultPrintCopy,
          MsgError: `A ${response.data?.invoiceNumber ?? ''} számla nyomtatása közben hiba történt.`,
          MsgCancel: `A ${response.data?.invoiceNumber ?? ''} számla nyomtatása nem történt meg.`,
          MsgFinish: `A ${response.data?.invoiceNumber ?? ''} számla nyomtatása véget ért.`,
          Obs: this.invoiceService.GetReport.bind(this.invoiceService),
          Reset: this.DelayedReset.bind(this),
          ReportParams: {
            "id": response.data?.id,
            "copies": 1 // Ki lesz töltve dialog alapján
          } as Constants.Dct,
          DialogClasses: Constants.INVOICE_PRINT_DIALOG_MARGIN_CLASS
        } as PrintDialogRequest)
      }
      catch (error) {
        this.cs.HandleError(error)
        this.status.pushProcessStatus(Constants.BlankProcessStatus)
      }
      finally {
        this.isSaveInProgress = false
      }
    });
  }

  // Invoked when user presses F2 on the search field
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
    dialogRef.onClose.subscribe((res: Customer) => {
      console.log("Selected item: ", res);
      if (!!res) {
        this.buyerData = res;

        this.kbS.SelectFirstTile();
        this.kbS.setEditMode(KeyboardModes.EDIT);

        if (this.dbData.findIndex(x => x.data.custDiscounted) !== -1) {
          this.simpleToastrService.show(
            Constants.MSG_WARNING_CUSTDISCOUNT_PREV,
            Constants.TITLE_INFO,
            Constants.TOASTR_SUCCESS_5_SEC
          );
        }
      }
    });
  }

  RefreshData(): void { }

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
      next: res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.buyerData = res.data[0];
          this.cachedCustomerName = res.data[0].customerName;
          this.searchByTaxtNumber = false;

          if (this.dbData.findIndex(x => x.data.custDiscounted) !== -1) {
            this.simpleToastrService.show(
              Constants.MSG_WARNING_CUSTDISCOUNT_PREV,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
          }
        } else {
          if (this.customerInputFilterString.length >= 8 &&
          this.IsNumber(this.customerInputFilterString)) {
            this.searchByTaxtNumber = true;
          } else {
            this.searchByTaxtNumber = false;
          }
          this.buyerFormNav.FillForm({}, ['customerSearch']);
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
    data.taxpayerNumber = (data.taxpayerId + (data.vatCode ?? '') + (data.countyCode ?? '')) ?? '';

    const countryCodes = await lastValueFrom(this.customerService.GetAllCountryCodes());

    if (data.countryCode !== undefined && !!countryCodes && countryCodes.length > 0) {
      data.countryCode = countryCodes.find(x => x.value == data.countryCode)?.text ?? '';
    }

    return data;
  }

  override SetDataForForm(data: any): void {
    if (!!data) {
      this.buyerData = { ...data as Customer };

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

              if (this.dbData.findIndex(x => x.data.custDiscounted) !== -1) {
                this.simpleToastrService.show(
                  Constants.MSG_WARNING_CUSTDISCOUNT_PREV,
                  Constants.TITLE_INFO,
                  Constants.TOASTR_SUCCESS_5_SEC
                );
              }
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

  ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void { }

  /////////////////////////////////////////////
  ////////////// KEYBOARD EVENTS //////////////
  /////////////////////////////////////////////

  @HostListener('window:keydown.f9', ['$event'])
  public recalculatePricesDialog(event: Event): void {
    HelperFunctions.confirm(this.dialogService, 'Eladási árak frissítése?', async () => {
      const data = await this.getDiscountsAndProducts()

      if (data) {
        const [customerDiscounts, products] = data

        this.recalcuatePrices(customerDiscounts, products)
      }
    })
  }

  private async getDiscountsAndProducts(): Promise<[CustDiscountForGet[], Product[]] | undefined> {
    try {
      this.isLoading = true

      const discountRequest = this.custDiscountService.getByCustomerAsync({ CustomerID: this.buyerData.id })

      const requests = this.dbData
        .filter(x => x.data.productCode && x.data.productCode !== '')
        .map(x => this.productService.getProductByCodeAsync({ ProductCode: x.data.productCode }))

      const customerDiscounts = await discountRequest
      const products = await Promise.all(requests)

      return [customerDiscounts, products]
    }
    catch (error) {
      this.cs.HandleError(error)
    }
    finally {
      this.isLoading = false
    }

    return undefined
  }

  private recalcuatePrices(customerDiscounts: CustDiscountForGet[], products: Product[]): void {
    for (const { data: invoiceLine } of this.dbData) {
      const product = products.find(x => x.id == invoiceLine.productID)

      if (!product || !product.unitPrice2)
        return

      const unitPrice = getPriceByPriceType(product, this.buyerData.unitPriceType)

      if (product.noDiscount) {
        invoiceLine.unitPrice = unitPrice
        return
      }

      const customerDiscount = customerDiscounts.find(x => x.productGroupCode === product.productGroupCode)

      const discount = customerDiscount?.discount ?? 0;

      invoiceLine.unitPrice = unitPrice - unitPrice * discount / 100
      invoiceLine.priceReview = false

      invoiceLine.Save()
    }
  }

  protected editCustomer(): void {
    if (this.kbS.IsCurrentNavigatable(this.buyerFormNav)) {
      this.editCustomerDialog.open(this.buyerData?.id)
    }
  }

  protected async openProductStockInformationDialog(productCode: string): Promise<void> {
    this.status.waitForLoad(true)

    try {
      const product = await this.productService.getProductByCodeAsync({ ProductCode: productCode })

      this.status.waitForLoad(false)

      this.dialogService.open(ProductStockInformationDialogComponent, {
        context: {
          product: product
        }
      })
    }
    catch (error) {
      this.cs.HandleError(error)
    }
    finally {
      this.status.waitForLoad(false)
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
        case this.KeySetting[Actions.ToggleForm].KeyCode: {
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
        case this.KeySetting[Actions.Edit].KeyCode: {
          HelperFunctions.StopEvent(event)

          this.editCustomer()

          break;
        }
      }
    }
  }

}
