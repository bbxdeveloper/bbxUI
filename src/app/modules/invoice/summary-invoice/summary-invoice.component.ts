import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NbTable, NbSortDirection, NbTreeGridDataSourceBuilder, NbToastrService, NbSortRequest } from '@nebular/theme';
import { of, BehaviorSubject, Subscription, lastValueFrom, pairwise } from 'rxjs';
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
import { Actions, GetFooterCommandListFromKeySettings, GetUpdatedKeySettings, KeyBindings, MinusDeliveryNoteKeySettings, SummaryInvoiceKeySettings } from 'src/assets/util/KeyBindings';
import { CustomerDialogTableSettings, PendingDeliveryInvoiceSummaryDialogTableSettings } from 'src/assets/model/TableSettings';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';
import { TableKeyDownEvent, isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { CustomersHasPendingInvoiceComponent } from '../customers-has-pending-invoice/customers-has-pending-invoice.component';
import { PendingDeliveryInvoiceSummary } from '../models/PendingDeliveriInvoiceSummary';
import { PendingDeliveryNoteItem } from '../models/PendingDeliveryNoteItem';
import { InvoiceStatisticsService } from '../services/invoice-statistics.service';
import { InvoiceBehaviorFactoryService } from '../services/invoice-behavior-factory.service';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { PartnerLockService } from 'src/app/services/partner-lock.service';
import { PartnerLockHandlerService } from 'src/app/services/partner-lock-handler.service';
import { ChooseSummaryInvoiceProductRequest, CodeFieldChangeRequest, ProductCodeManagerServiceService } from 'src/app/services/product-code-manager-service.service';
import { BaseInvoiceManagerComponent } from '../base-invoice-manager/base-invoice-manager.component';
import { EditCustomerDialogManagerService } from '../../shared/services/edit-customer-dialog-manager.service';
import { InvoiceTypes } from '../models/InvoiceTypes';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

@Component({
  selector: 'app-summary-invoice',
  templateUrl: './summary-invoice.component.html',
  styleUrls: ['./summary-invoice.component.scss'],
  providers: [PartnerLockHandlerService, PartnerLockService, InvoiceBehaviorFactoryService]
})
export class SummaryInvoiceComponent extends BaseInvoiceManagerComponent implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  buyerData!: Customer;

  private Subscription_FillFormWithFirstAvailableCustomer?: Subscription;

  cachedCustomerName?: string;

  customerInputFilterString: string = '';

  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.buyerFormNav.GenerateAndSetNavMatrices(false, true);
  }

  override colsToIgnore: string[] = ["productDescription", "lineNetAmount", "lineGrossAmount",
    "unitOfMeasureX", 'unitPrice', 'rowNetPrice','rowGrossPriceRounded'];
  requiredCols: string[] = ['productCode', 'quantity'];
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
      defaultValue: '', type: 'number', mask: "",
      colWidth: "100px", textAlign: "right", fInputType: 'formatted-number',
      checkIfReadonly: (row: TreeGridNode<InvoiceLine>) => HelperFunctions.isEmptyOrSpaces(row.data.productCode),
    },
    { // unitofmeasureX show, post unitofmeasureCode
      label: 'Me.e.', objectKey: 'unitOfMeasureX', colKey: 'unitOfMeasureX',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "80px", textAlign: "right"
    },
    {
      label: 'Ár', objectKey: 'unitPrice', colKey: 'unitPrice',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
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

  workNumbers: string[] = []

  override outInvFormId: string = "outgoing-invoice-form";
  outInvFormNav$: BehaviorSubject<InlineTableNavigatableForm[]> = new BehaviorSubject<InlineTableNavigatableForm[]>([]);

  override buyerFormId: string = "buyer-form";

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

  override KeySetting: Constants.KeySettingsDct = SummaryInvoiceKeySettings;
  override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  formKeyRows: any = {
    "customerSearch": {
      Action: Actions.Create,
      Row: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner felvétele', KeyType: Constants.KeyTypes.Fn }
    }
  }

  private originalCustomerID: number = -1

  private editCustomerDialogSubscription = this.editCustomerDialog.refreshedCustomer.subscribe(customer => {
    this.buyerData = customer
    this.cachedCustomerName = customer.customerName;
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
    statusService: StatusService,
    productService: ProductService,
    status: StatusService,
    sideBarService: BbxSidebarService,
    khs: KeyboardHelperService,
    activatedRoute: ActivatedRoute,
    router: Router,
    bbxToasterService: BbxToastrService,
    behaviorFactory: InvoiceBehaviorFactoryService,
    tokenService: TokenStorageService,
    productCodeManagerService: ProductCodeManagerServiceService,
    printAndDownLoadService: PrintAndDownloadService,
    protected readonly custDiscountService: CustomerDiscountService,
    public readonly invoiceStatisticsService: InvoiceStatisticsService,
    editCustomerDialog: EditCustomerDialogManagerService,
  ) {
    super(dialogService, footerService, dataSourceBuilder, invoiceService,
      customerService, cdref, kbS, simpleToastrService, bbxToastrService,
      cs, statusService, productService, status, sideBarService, khs,
      activatedRoute, router, bbxToasterService, behaviorFactory, tokenService,
      productCodeManagerService, printAndDownLoadService, editCustomerDialog)
    this.preventF12 = true
    this.activatedRoute.url.subscribe(params => {
      this.mode = behaviorFactory.create(params[0].path)
      this.path = params[0].path

      if (this.mode.invoiceType === InvoiceTypes.DNO || this.mode.invoiceType === InvoiceTypes.DNI) {
        this.KeySetting = MinusDeliveryNoteKeySettings
        this.commands = GetFooterCommandListFromKeySettings(this.KeySetting)
      }

      if (this.mode.incoming) {
        const unitPrice = this.colDefs.find(x => x.objectKey === 'unitPrice')
        if (unitPrice) {
          unitPrice.label = this.mode.unitPriceColumnTitle
        }
      }

      this.InitialSetup()
      this.isPageReady = true;
    })
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
      invoiceDiscountPercent: 0,
      deliveryNoteCorrection: this.mode.deliveryNoteCorrection
    });

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    if (this.outInvForm === undefined) {
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
        invoiceOrdinal: new FormControl('', []), // in post response
        notice: new FormControl('', []),
      });
      if (this.mode.incoming) {
        this.outInvForm.addControl('customerInvoiceNumber', new FormControl('', [
          Validators.required
        ]));
      }
    } else {
      this.outInvForm.reset(undefined);
    }

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

    this.outInvFormNav = new InlineTableNavigatableForm(
      this.outInvForm,
      this.kbS,
      this.cdref,
      [this.outGoingInvoiceData],
      this.outInvFormId,
      AttachDirection.DOWN,
      this
    );

    this.buyerFormNav!.OuterJump = true;
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

  override RecalcNetAndVat(): void {
    this.invoiceStatisticsService.InvoiceLines = this.dbData;

    this.outGoingInvoiceData.invoiceLines = this.dbData.filter(x => !x.data.IsUnfinished()).map(x => x.data);

    this.outGoingInvoiceData.invoiceNetAmount = this.outGoingInvoiceData.invoiceLines
      .map(x => HelperFunctions.ToFloat(x.rowNetPriceRounded))
      .reduce((sum, current) => sum + current, 0);

    this.outGoingInvoiceData.invoiceVatAmount = this.outGoingInvoiceData.invoiceLines
      .map(x => HelperFunctions.ToFloat(x.lineVatAmount))
      .reduce((sum, current) => sum + current, 0);

    let _paymentMethod = this.mode.Delivery ? this.DeliveryPaymentMethod :

    HelperFunctions.PaymentMethodToDescription(this.outInvForm.controls['paymentMethod'].value, this.paymentMethods);

    // Csak gyűjtőszámlánál
    this.outGoingInvoiceData.lineGrossAmount = this.outGoingInvoiceData.invoiceLines
      .map(x => HelperFunctions.ToFloat(x.rowDiscountedGrossPrice))
      .reduce((sum, current) => sum + current, 0);

    if (_paymentMethod === "CASH" && this.outGoingInvoiceData.currencyCode === CurrencyCodes.HUF) {
      this.outGoingInvoiceData.lineGrossAmount = HelperFunctions.CashRound(this.outGoingInvoiceData.lineGrossAmount);
    } else {
      this.outGoingInvoiceData.lineGrossAmount = HelperFunctions.Round(this.outGoingInvoiceData.lineGrossAmount);
    }

    this.outGoingInvoiceData.invoiceNetAmount = HelperFunctions.Round2(this.outGoingInvoiceData.invoiceNetAmount, 1);
    this.outGoingInvoiceData.invoiceVatAmount = HelperFunctions.Round(this.outGoingInvoiceData.invoiceVatAmount);
  }

  override HandleGridCodeFieldEnter(event: any, row: TreeGridNode<InvoiceLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!event) {
      this.bbxToastrService.close();
      event.stopPropagation();
    }
    console.log('[HandleGridCodeFieldEnter]: editmode off: ', this.editDisabled);
    if (this.editDisabled) {
      const colDef = this.colDefs.find(x => x.objectKey === objectKey)
      if (colDef?.fReadonly) {
        return
      }

      this.dbDataTable.HandleGridEnter(row, rowPos, objectKey, colPos, inputId, fInputType);
    } else {
      //this.TableCodeFieldChanged(row.data, rowPos, row, rowPos, objectKey, colPos, inputId, fInputType);
      this.productCodeManagerService.TableCodeFieldChanged({
        dbDataTable: this.dbDataTable,
        productToGridProductConversionCallback: this.ProductToInvoiceLine.bind(this),
        changedData: row.data,
        index: rowPos,
        row: row,
        rowPos: rowPos,
        objectKey: objectKey,
        colPos: colPos,
        inputId: inputId,
        fInputType: fInputType,
        path: this.path,
        onComplete: this.RecalcNetAndVat.bind(this)
      } as CodeFieldChangeRequest)
    }
  }

  override TableRowDataChanged(changedData?: any, index?: number, col?: string): void {
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

    if (col === 'quantity' && index !== null && index !== undefined) {
      const validationResult = this.mode.validateQuantity(changedData.quantity, changedData.limit)

      if (!validationResult) {
        changedData.quantity = HelperFunctions.ToInt(changedData.quantity)
        changedData.Save()
        return
      }

      setTimeout(() => {
        this.bbxToastrService.show(
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
    this.AfterViewInitSetup();
  }
  private AfterViewInitSetup(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    if (this.mode.isSummaryInvoice) {
      this.buyerFormNav.GenerateAndSetNavMatrices(true);
    }

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

    this.InitFormDefaultValues();

    setTimeout(() => {
      this.kbS.SetCurrentNavigatable(this.buyerFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);

      this.cdref.detectChanges();
      const dialog = this.dialogService.open(CustomersHasPendingInvoiceComponent, {
        context: {
          searchString: this.customerInputFilterString,
          allColumns: PendingDeliveryInvoiceSummaryDialogTableSettings.AllColumns,
          colDefs: PendingDeliveryInvoiceSummaryDialogTableSettings.ColDefs,
          incoming: this.mode.incoming,
          partnerLock: this.mode.partnerLock
        },
        closeOnEsc: false,
        closeOnBackdropClick: false
      });

      dialog.onClose.subscribe({ next: this.customerSelected.bind(this) })
    }, 500);
  }

  private async customerSelected(x: PendingDeliveryInvoiceSummary) {
    if (!x) {
      return;
    }

    try {
      const customer = await lastValueFrom(this.customerService.Get({ ID: x.customerID }))

      this.originalCustomerID = customer.id

      if (this.mode.useCustomersPaymentMethod) {
        this.outInvForm.controls['paymentMethod'].setValue(customer.defPaymentMethodX)
      }

      this.SetDataForForm(customer)
    }
    catch(error) {
      this.cs.HandleError(error)
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

    if (this.mode.incoming) {
      this.outGoingInvoiceData.customerInvoiceNumber = this.outInvForm.controls['customerInvoiceNumber'].value;
    }

    this.outGoingInvoiceData.notice = this.outInvForm.controls['notice'].value;

    this.outGoingInvoiceData.invoiceDeliveryDate = this.outInvForm.controls['invoiceDeliveryDate'].value;
    this.outGoingInvoiceData.invoiceIssueDate = this.outInvForm.controls['invoiceIssueDate'].value;
    this.outGoingInvoiceData.paymentDate = this.outInvForm.controls['paymentDate'].value;

    this.outGoingInvoiceData.paymentMethod = this.mode.isSummaryInvoice
      ? HelperFunctions.PaymentMethodToDescription(this.outInvForm.controls['paymentMethod'].value, this.paymentMethods)
      : this.mode.paymentMethod

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
    this.outGoingInvoiceData.invoiceCorrection = this.mode.invoiceCorrection

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
    if (this.dbData.find(x => !x.data.IsUnfinished()) === undefined) {
      this.bbxToastrService.show(
        `Legalább egy érvényesen megadott tétel szükséges a mentéshez.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
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
        isDiscountVisible: false,
        forceDisableOutgoingDelivery: true,
        negativeDiscount: !this.mode.isSummaryInvoice,
        checkCustomerLimit: this.mode.checkCustomerLimit,
        customer: this.buyerData,
        Incoming: this.mode.incoming
      }
    });
    dialogRef.onClose.subscribe((res?: OutGoingInvoiceFullData) => {
      console.log("Selected item: ", res);

      if (!res) {
        this.isSaveInProgress = false;
        setTimeout(() => {
          this.kbS.SetCurrentNavigatable(this.dbDataTable)
          this.kbS.SelectFirstTile()
          this.kbS.setEditMode(KeyboardModes.NAVIGATION)
        }, 200)
        return
      }

      this.outGoingInvoiceData.invoiceDiscountPercent = res.invoiceDiscountPercent;
      const request = this.UpdateOutGoingData();

      this.status.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);
      this.invoiceService.CreateOutgoing(request).subscribe({
        next: async d => {
          try {
            if (!!d.data) {
              console.log('Save response: ', d);

              if (!!d.data) {
                this.outInvForm.controls['invoiceOrdinal'].setValue(d.data.invoiceNumber ?? '');
              }

              this.mode.partnerLock?.unlockCustomer()

              this.simpleToastrService.show(
                Constants.MSG_SAVE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );

              this.dbDataTable.RemoveEditRow();
              this.kbS.SelectFirstTile();

              this.isSaveInProgress = true;

              this.status.pushProcessStatus(Constants.BlankProcessStatus);

              await this.printAndDownLoadService.openPrintDialog({
                DialogTitle: Constants.TITLE_PRINT_INVOICE,
                DefaultCopies: 1,
                MsgError: `A ${d.data?.invoiceNumber ?? ''} számla nyomtatása közben hiba történt.`,
                MsgCancel: `A ${d.data?.invoiceNumber ?? ''} számla nyomtatása nem történt meg.`,
                MsgFinish: `A ${d.data?.invoiceNumber ?? ''} számla nyomtatása véget ért.`,
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
          this.status.pushProcessStatus(Constants.BlankProcessStatus);
          this.cs.HandleError(err);
          this.isSaveInProgress = false;
        },
        complete: () => {
          this.isSaveInProgress = false;
        }
      });
    });
  }

  async HandleProductChoose(res: Product, wasInNavigationMode: boolean): Promise<void> {
    if (!!res) {
      this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
      if (!wasInNavigationMode) {
        let currentRow = this.dbDataTable.FillCurrentlyEditedRow({ data: await this.ProductToInvoiceLine(res) }, ['productCode']);
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
    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
    return of().toPromise();
  }

  ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    this.productCodeManagerService.ChooseDataForTableRow({
      dbDataTable: this.dbDataTable,
      dbData: this.dbData,
      rowIndex: rowIndex,
      wasInNavigationMode: wasInNavigationMode,
      productToInvoiceLine: this.ProductToInvoiceLine.bind(this),
      data: this.outGoingInvoiceData,
      path: this.path,
      mode: this.mode,
      originalCustomerID: this.originalCustomerID,
      fillTableWithDataCallback: this.fillTableWithPendingNotes.bind(this)
    } as ChooseSummaryInvoiceProductRequest);
  }

  private PendingDeliveryNoteToInvoiceLine(value: PendingDeliveryNoteItem): InvoiceLine {
    const line = new InvoiceLine(this.requiredCols)
    line.productCode = value.productCode
    line.productDescription = value.lineDescription
    line.quantity = value.quantity
    line.unitOfMeasure = value.unitOfMeasure
    line.unitPrice = value.unitPrice
    line.vatRateCode = value.vatRateCode
    line.lineNetAmount = value.lineNetAmount
    line.vatRate = value.vatPercentage
    line.unitOfMeasureX = value.unitOfMeasureX
    line.relDeliveryNoteInvoiceLineID = value.relDeliveryNoteInvoiceLineID
    line.invoiceNumber = value.invoiceNumber
    line.workNumber = value.workNumber
    line.unitPriceDiscounted = value.unitPriceDiscounted
    line.limit = value.quantity

    line.DeafultFieldList = ['productCode', 'quantity']
    line.Save()

    return line
  }

  private fillTableWithPendingNotes(notes: PendingDeliveryNoteItem[]): void {
    this.kbS.SetCurrentNavigatable(this.dbDataTable)

    notes.forEach(note => {
      const invoiceDeliveryDate = new Date(note.invoiceDeliveryDate)
      const relDeliveryDate = new Date(note.relDeliveryDate)

      if (relDeliveryDate < invoiceDeliveryDate) {
        this.outGoingInvoiceData.invoiceDeliveryDate = note.relDeliveryDate
      }

      if (!this.mode.isSummaryInvoice) {
        note.quantity = -note.quantity
      }

      const checkedNote = this.dbData.find(x => x.data.relDeliveryNoteInvoiceLineID === note.relDeliveryNoteInvoiceLineID)
      if (checkedNote) {
        note.quantity += checkedNote.data.quantity

        const index = this.dbData.indexOf(checkedNote)
        this.dbData.splice(index, 1)
      }
    })

    const existingNotes = this.dbData
      .filter(x => !!x.data.relDeliveryNoteInvoiceLineID)
      .map(x => x.data)

    this.dbData = notes
      .map(x => this.PendingDeliveryNoteToInvoiceLine(x))
      .concat(existingNotes)
      .map(x => ({ data: x, uid: this.nextUid() }))

    this.dbData.sort((a, b) => {
      const aProperty = a.data.invoiceNumber + a.data.productCode
      const bProperty = b.data.invoiceNumber + b.data.productCode

      if (aProperty > bProperty)
        return 1

      if (aProperty < bProperty)
        return -1

      return 0
    })

    this.generateWorkNumbers()

    this.RefreshTable()

    if (this.mode.autoFillCustomerInvoiceNumber) {
      this.autoFillOrUpdateInvoiceNumber()
    }

    this.UpdateOutGoingData()

    if (notes.length === 1) {
      const index = this.dbData.findIndex(x => x.data.relDeliveryNoteInvoiceLineID === notes[0].relDeliveryNoteInvoiceLineID)

      const elementId = 'PRODUCT-2-' + index

      this.kbS.SelectElement(elementId)
      this.kbS.ClickElement(elementId)
    }
  }

  private autoFillOrUpdateInvoiceNumber(resetField: boolean = false): void {
    const invoiceNumberControl = this.outInvForm.controls['customerInvoiceNumber']

    if (resetField) {
      invoiceNumberControl.setValue(undefined)
    }

    var customerInvoiceNumberString = invoiceNumberControl.value

    this.dbData.forEach(item => {
      if (item.data.IsUnfinished()) {
        return
      }

      const note = item.data
      if (customerInvoiceNumberString.includes(note.invoiceNumber)) {
        return
      }
      
      if (customerInvoiceNumberString.length > 0) {
        customerInvoiceNumberString += `,${note.invoiceNumber}`
      } else {
        customerInvoiceNumberString = note.invoiceNumber ?? ''
      }
    })

    invoiceNumberControl.setValue(customerInvoiceNumberString)
  }

  private generateWorkNumbers(): void {
    let _workNumbers = this.dbData.filter(x => !!x.data.workNumber)
      .map(x => x.data.workNumber)

    if (_workNumbers.find(x => !HelperFunctions.isEmptyOrSpaces(x)) === undefined ||
        HelperFunctions.isEmptyOrSpaces(this.workNumbers.join(''))) {
        return
    }

    const workNumbersAsString = () => 'M.Sz.: ' + this.workNumbers.join(', ')

    const noticeControl = this.outInvForm.get('notice')
    const existingNotice = noticeControl?.value as string ?? ''

    const existingWorkNumbers = !!this.workNumbers ? workNumbersAsString() : ''
    const otherNotes = existingNotice
      .substring(existingWorkNumbers.length)
      .trim()

    this.workNumbers = [...new Set(_workNumbers)]

    const notice = this.workNumbers.length > 0
      ? workNumbersAsString() + ' ' + otherNotes
      : otherNotes

    noticeControl?.setValue(notice.trim())
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
    dialogRef.onClose.subscribe((res: Customer) => {
      console.log("Selected item: ", res);
      if (!!res) {
        this.buyerData = res;

        if (this.mode.useCustomersPaymentMethod) {
          this.outInvForm.controls['paymentMethod'].setValue(this.buyerData.defPaymentMethodX)
        }

        this.kbS.SetCurrentNavigatable(this.outInvFormNav);
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

  private async GetPartnerDiscountForProduct(productGroupCode: string): Promise<number | undefined> {
    let discount: number | undefined = undefined;

    if (this.buyerData === undefined || this.buyerData.id === undefined) {
      this.bbxToastrService.show(
        Constants.MSG_DISCOUNT_CUSTOMER_MUST_BE_CHOSEN,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return discount;
    }

    await lastValueFrom(this.custDiscountService.GetByCustomer({ CustomerID: this.buyerData.id ?? -1 }))
      .then(discounts => {
        if (discounts) {
          const res = discounts.find(x => x.productGroupCode == productGroupCode)?.discount;
          discount = res !== undefined ? (res / 100.0) : undefined;
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => {})
    return discount;
  }

  override async ProductToInvoiceLine(product: Product): Promise<InvoiceLine> {
    const res = new InvoiceLine(this.requiredCols);

    res.productCode = product.productCode!;

    res.productDescription = product.description ?? '';

    res.quantity = 0;

    product.productGroup = !!product.productGroup ? product.productGroup : '-';
    res.noDiscount = product.noDiscount;
    if (!product.noDiscount && !this.mode.incoming) {
      const discountForPrice = await this.GetPartnerDiscountForProduct(product.productGroup.split("-")[0]);
      if (discountForPrice !== undefined) {
        const discountedPrice = product.unitPrice2! * discountForPrice;
        res.unitPrice = product.unitPrice2! - discountedPrice;
        res.custDiscounted = true;
      } else {
        res.unitPrice = product.unitPrice2!;
      }
    } else {
      res.unitPrice = product.unitPrice2!;
    }

    res.vatRateCode = product.vatRateCode;

    res.vatRate = product.vatPercentage ?? 1;

    res.ReCalc();

    res.unitOfMeasure = product.unitOfMeasure;
    res.unitOfMeasureX = product.unitOfMeasureX;

    return res;
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
      next: res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.buyerData = res.data[0];
          this.cachedCustomerName = res.data[0].customerName;
          this.searchByTaxtNumber = false;

          if (this.mode.useCustomersPaymentMethod) {
            this.outInvForm.controls['paymentMethod'].setValue(this.buyerData.defPaymentMethodX)
          }

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

  /////////////////////////////////////////////
  ////////////// KEYBOARD EVENTS //////////////
  /////////////////////////////////////////////

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
        case KeyBindings.F3: {
          HelperFunctions.StopEvent(_event);
          return;
        }
        case this.KeySetting[Actions.Delete].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event);
            return;
          }
          _event.preventDefault();
          HelperFunctions.confirm(this.dialogService, HelperFunctions.StringFormat(Constants.MSG_CONFIRMATION_DELETE_PARAM, event.Row.data), () => {
            this.dbDataTable?.HandleGridDelete(_event, event.Row, event.RowPos, event.ObjectKey)

            this.generateWorkNumbers()
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
        case this.KeySetting[Actions.Edit].KeyCode: {
          if (!isForm) {
            return;
          }
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          HelperFunctions.StopEvent(event)

          this.editCustomer(this.buyerData)
          break;
        }
      }
    }
  }

}
