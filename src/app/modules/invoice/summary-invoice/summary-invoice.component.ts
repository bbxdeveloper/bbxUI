import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NbTable, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
import { of, lastValueFrom, pairwise, tap, Subject, switchMap, map, EMPTY } from 'rxjs';
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
import { Customer, isTaxPayerNumberEmpty } from '../../customer/models/Customer';
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { CreateOutgoingInvoiceRequest, OutGoingInvoiceFullData, OutGoingInvoiceFullDataToRequest } from '../models/CreateOutgoingInvoiceRequest';
import { InvoiceLine } from '../models/InvoiceLine';
import { InvoiceService } from '../services/invoice.service';
import { SaveDialogComponent } from '../save-dialog/save-dialog.component';
import { ProductService } from '../../product/services/product.service';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { Actions, GetFooterCommandListFromKeySettings, GetUpdatedKeySettings, KeyBindings, MinusDeliveryNoteKeySettings, SummaryInvoiceKeySettings } from 'src/assets/util/KeyBindings';
import { PendingDeliveryInvoiceSummaryDialogTableSettings } from 'src/assets/model/TableSettings';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';
import { TableKeyDownEvent, isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { CurrencyCode, CurrencyCodes } from '../../system/models/CurrencyCode';
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
import { InvoiceTypes } from '../models/InvoiceTypes';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import {CustomerSearchComponent} from "../customer-serach/customer-search.component";
import { SystemService } from '../../system/services/system.service';
import { GetExchangeRateParamsModel } from '../../system/models/GetExchangeRateParamsModel';
import moment from 'moment';

@Component({
  selector: 'app-summary-invoice',
  templateUrl: './summary-invoice.component.html',
  styleUrls: ['./summary-invoice.component.scss'],
  providers: [PartnerLockHandlerService, PartnerLockService, InvoiceBehaviorFactoryService]
})
export class SummaryInvoiceComponent extends BaseInvoiceManagerComponent implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  @ViewChild('customerSearch')
  private customerSearch!: CustomerSearchComponent

  buyerData!: Customer;

  customerInputFilterString: string = '';

  currencyVisible = false
  currencyCodesData: CurrencyCode[] = []
  exchangeQuery = new Subject<CurrencyCodes>()

  override colsToIgnore: string[] = ["productDescription", "unitOfMeasureX", 'unitPrice', 'rowNetPrice','rowGrossPriceRounded'];
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

  get invoiceIssueDateValue(): Date | undefined {
    if (!this.outInvForm) {
      return undefined;
    }
    const tmp = this.outInvForm.controls['invoiceIssueDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get invoiceDeliveryDateValue(): Date | undefined {
    if (!this.outInvForm) {
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
    custDiscountService: CustomerDiscountService,
    public readonly invoiceStatisticsService: InvoiceStatisticsService,
    private readonly systemService: SystemService,
  ) {
    super(dialogService, footerService, dataSourceBuilder, invoiceService,
      customerService, cdref, kbS, simpleToastrService, bbxToastrService,
      cs, productService, status, sideBarService, khs,
      activatedRoute, router, tokenService,
      productCodeManagerService, printAndDownLoadService, custDiscountService)
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

      this.updateInvFormBasedOnMode()

      this.isPageReady = true;
    })
  }

  /**
   * Additional form adjustments based on the determined behavior mode.
   */
  private updateInvFormBasedOnMode(): void {
    if (this.mode.Delivery) {
      // No paymentDate needed, invoiceDeliveryDate will be used
      this.outInvForm.controls['paymentDate'] = new FormControl('', []);
    }
    this.outInvFormNav.GenerateAndSetNavMatrices(false, true, true)
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

    this.outInvForm = new FormGroup({
      paymentMethod: new FormControl('', [Validators.required]),
      invoiceDeliveryDate: new FormControl('', [
        Validators.required,
        validDate
      ]),
      invoiceIssueDate: new FormControl('', [
        Validators.required,
        validDate
      ]),
      paymentDate: new FormControl('', [
        Validators.required,
        this.validatePaymentDate.bind(this),
        validDate
      ]),
      invoiceOrdinal: new FormControl('', []), // in post response
      notice: new FormControl('', []),
      currency: new FormControl(''),
      exchangeRate: new FormControl(''),
    });

    this.outInvForm.controls['currency'].valueChanges
      .pipe(
        switchMap((value: string) => {
          const currency = this.currencyCodesData.find(x => x.text === value)

          return currency ? of(currency.value as CurrencyCodes) : EMPTY
        }),
        tap(currency => this.outGoingInvoiceData.currencyCode = currency),
        tap((value: CurrencyCodes) => {
          if (value !== CurrencyCodes.HUF) {
            this.currencyVisible = true

            this.exchangeQuery.next(value as CurrencyCodes)
          }
        })
      )
      .subscribe()

    if (this.mode.incoming) {
      this.outInvForm.addControl('customerInvoiceNumber', new FormControl('', [
        Validators.required
      ]));
    }

    this.outInvFormNav = new InlineTableNavigatableForm(
      this.outInvForm,
      this.kbS,
      this.cdref,
      [this.outGoingInvoiceData],
      this.outInvFormId,
      AttachDirection.DOWN,
      this
    );

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
    if (this.mode.Delivery) {
      this.outInvForm.controls['invoiceDeliveryDate'].setValue(HelperFunctions.GetDateString(0, 0, 0));
    }
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
    })

    this.customerService.GetAll({ IsOwnData: false, OrderBy: 'customerName' }).subscribe({
      next: d => {
        // Possible buyers
        this.buyersData = d.data!;
        this.customerSearch.searchFormNav.Setup(this.buyersData)
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
    this.isLoading = true
    this.systemService.GetAllCurrencyCodes()
      .subscribe({
        next: codes => this.currencyCodesData = codes,
        error: (error) => {
          this.cs.HandleError(error)
          this.isLoading = true
        },
        complete: () => this.isLoading = false
      })

    this.exchangeQuery
      .pipe(
        tap(() => this.isLoading = true),
        map((currencyCode: CurrencyCodes) => ({
          Currency: currencyCode.toString(),
          ExchengeRateDate: moment().format('YYYY-MM-DD')
        } as GetExchangeRateParamsModel)),
        switchMap(request => this.systemService.GetExchangeRate(request)),
        tap(() => this.isLoading = false),
        tap(value => this.outInvForm.controls['exchangeRate'].setValue(value)),
        tap(() => this.outInvFormNav.GenerateAndSetNavMatrices(false)),
        tap(value => this.outGoingInvoiceData.exchangeRate = value)
      )
      .subscribe({
        next: () => {},
        error: error => {
          this.cs.HandleError(error)
          this.isLoading = false
        },
        complete: () => this.isLoading = false
      })

    this.fS.pushCommands(this.commands);
  }

  ngAfterViewInit(): void {
    this.AfterViewInitSetup();
  }
  private AfterViewInitSetup(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    if (this.mode.isSummaryInvoice) {
      this.customerSearch.searchFormNav.GenerateAndSetNavMatrices(true)
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
      this.kbS.SetCurrentNavigatable(this.customerSearch.searchFormNav)
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

      dialog.onClose.subscribe(this.customerSelected.bind(this))
    }, 500);
  }

  private async customerSelected(x: PendingDeliveryInvoiceSummary) {
    if (!x) {
      return;
    }

    this.outInvForm.controls['currency'].setValue(x.currencyCodeX)

    try {
      const customer = await lastValueFrom(this.customerService.Get({ ID: x.customerID }))

      this.originalCustomerID = customer.id

      if (this.mode.useCustomersPaymentMethod) {
        this.outInvForm.controls['paymentMethod'].setValue(customer.defPaymentMethodX)
      }

      this.buyerData = customer

      this.kbS.SetCurrentNavigatable(this.outInvFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);
    }
    catch(error) {
      this.cs.HandleError(error)
    }
  }

  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();

    this.mode.partnerLock?.unlockCustomer()
  }

  private UpdateOutGoingData(): CreateOutgoingInvoiceRequest<InvoiceLine> {
    this.outGoingInvoiceData.customerID = this.buyerData.id;

    if (this.mode.incoming) {
      this.outGoingInvoiceData.customerInvoiceNumber = this.outInvForm.controls['customerInvoiceNumber'].value;
    }

    this.outGoingInvoiceData.notice = this.outInvForm.controls['notice'].value;

    this.outGoingInvoiceData.invoiceDeliveryDate = this.outInvForm.controls['invoiceDeliveryDate'].value;
    this.outGoingInvoiceData.invoiceIssueDate = this.outInvForm.controls['invoiceIssueDate'].value;

    if (this.mode.Delivery) {
      this.outGoingInvoiceData.paymentDate = this.outInvForm.controls['invoiceDeliveryDate'].value;
    } else {
      this.outGoingInvoiceData.paymentDate = this.outInvForm.controls['paymentDate'].value;
    }

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
    this.outInvForm.markAllAsTouched();

    let valid = true;
    if (this.buyerData.id === undefined) {
      this.bbxToastrService.showError(`Nincs megadva vevő.`);
      valid = false;
    }
    else if (this.mode.invoiceType === InvoiceTypes.INV &&
      !this.buyerData.privatePerson &&
      (isTaxPayerNumberEmpty(this.buyerData) && HelperFunctions.isEmptyOrSpaces(this.buyerData.thirdStateTaxId))) {

      this.bbxToastrService.showError(Constants.MSG_ERROR_TAX_PAYER_NUMBER_IS_EMPTY)
      valid = false
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
                DefaultCopies: Constants.OutgoingIncomingInvoiceDefaultPrintCopy,
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
      this.status.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
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
    this.status.pushProcessStatus(Constants.BlankProcessStatus);
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
      fillTableWithDataCallback: this.fillTableWithPendingNotes.bind(this),
      showWorkNumber: !this.mode.incoming,
    } as ChooseSummaryInvoiceProductRequest);
  }

  private async PendingDeliveryNoteToInvoiceLine(value: PendingDeliveryNoteItem): Promise<InvoiceLine> {
    const line = new InvoiceLine(this.requiredCols)

    const productData = await this.productService.getProductByCodeAsync({ ProductCode: value.productCode } as GetProductByCodeRequest)
    if (productData && productData.productCode) {
      const warehouseID = this.tokenService.wareHouse?.id
      line.realQty = productData.stocks?.find(x => x.warehouseID === warehouseID)?.realQty ?? 0
    }

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

  private async fillTableWithPendingNotes(notes: PendingDeliveryNoteItem[]): Promise<void> {
    this.kbS.SetCurrentNavigatable(this.dbDataTable)

    notes.forEach(note => {
      const invoiceDeliveryDate = new Date(note.invoiceDeliveryDate)
      const relDeliveryDate = new Date(note.relDeliveryDate)

      if (relDeliveryDate < invoiceDeliveryDate) {
        this.outGoingInvoiceData.invoiceDeliveryDate = note.relDeliveryDate
      }

      if (!this.mode.Delivery) {
        const formVal = this.outInvForm.controls['invoiceDeliveryDate'].value
        const deliveryDateString = HelperFunctions.GetDateStringFromDate(relDeliveryDate.toDateString())

        if (!HelperFunctions.isEmptyOrSpaces(formVal)) {
          const formDeliveryDate = new Date(formVal)
          if (formDeliveryDate < relDeliveryDate) {
            this.outInvForm.controls['invoiceDeliveryDate'].setValue(deliveryDateString);
          }
        } else {
          this.outInvForm.controls['invoiceDeliveryDate'].setValue(deliveryDateString);
        }
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

    let nonExistingNotes = []
    for (let i = 0; i < notes.length; i++) {
      const invoiceLine = await this.PendingDeliveryNoteToInvoiceLine(notes[i])
      nonExistingNotes.push(invoiceLine)
    }

    this.dbData = nonExistingNotes
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

  ChooseDataForCustomerForm(): void {}

  RefreshData(): void { }

  private async GetPartnerDiscountForProduct(productGroupCode: string): Promise<number | undefined> {
    let discount: number | undefined = undefined;

    if (this.buyerData === undefined || this.buyerData.id === undefined) {
      this.bbxToastrService.showError(Constants.MSG_DISCOUNT_CUSTOMER_MUST_BE_CHOSEN);
      return discount;
    }

    if (!this.customerDiscountService) {
      return undefined
    }

    await lastValueFrom(this.customerDiscountService.GetByCustomer({ CustomerID: this.buyerData.id ?? -1 }))
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

    res.realQty = product.activeStockRealQty ?? 0

    return res;
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
      }
    }
  }

  public customerChanged([customer, shouldNavigate]: [Customer, boolean]): void {
    this.buyerData = customer

    if (this.mode.useCustomersPaymentMethod) {
      this.outInvForm.controls['paymentMethod'].setValue(this.buyerData.defPaymentMethodX)
    }

    if (this.dbData.findIndex(x => x.data.custDiscounted) !== -1) {
      this.bbxToastrService.showSuccess(Constants.MSG_WARNING_CUSTDISCOUNT_PREV, true);
    }

    if (shouldNavigate) {
      this.kbS.SetCurrentNavigatable(this.outInvFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);
    }
  }
}
