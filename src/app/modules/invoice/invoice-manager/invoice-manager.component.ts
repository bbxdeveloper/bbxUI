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
import { Product, getPriceByPriceType, isProduct } from '../../product/models/Product';
import { CustomerSelectTableDialogComponent } from '../customer-select-table-dialog/customer-select-table-dialog.component';
import { CreateOutgoingInvoiceRequest, OutGoingInvoiceFullData, OutGoingInvoiceFullDataToRequest } from '../models/CreateOutgoingInvoiceRequest';
import { InvoiceLine } from '../models/InvoiceLine';
import { InvoiceService } from '../services/invoice.service';
import { SaveDialogComponent } from '../save-dialog/save-dialog.component';
import { ProductService } from '../../product/services/product.service';
import { TaxNumberSearchCustomerEditDialogComponent } from '../tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { GetCustomerByTaxNumberParams } from '../../customer/models/GetCustomerByTaxNumberParams';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { Actions, GetFooterCommandListFromKeySettings, GetUpdatedKeySettings, InvoiceManagerKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';
import { CustomerDialogTableSettings } from 'src/assets/model/TableSettings';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';
import { TableKeyDownEvent, isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { InvoiceTypes } from '../models/InvoiceTypes';
import { InvoiceCategory } from '../models/InvoiceCategory';
import { InvoiceBehaviorFactoryService } from '../services/invoice-behavior-factory.service';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import moment from 'moment';
import { PartnerLockService } from 'src/app/services/partner-lock.service';
import { PartnerLockHandlerService } from 'src/app/services/partner-lock-handler.service';
import { BaseInvoiceManagerComponent } from '../base-invoice-manager/base-invoice-manager.component';
import { ChooseProductRequest, ProductCodeManagerServiceService } from 'src/app/services/product-code-manager-service.service';
import { EditCustomerDialogManagerService } from '../../shared/services/edit-customer-dialog-manager.service';
import { PaymentMethods, OfflinePaymentMethods } from '../models/PaymentMethod';
import { OfferService } from '../../offer/services/offer.service';
import { GetOfferParamsModel } from '../../offer/models/GetOfferParamsModel';
import { Offer } from '../../offer/models/Offer';
import { GetCustomerParamListModel } from '../../customer/models/GetCustomerParamListModel';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

@Component({
  selector: 'app-invoice-manager',
  templateUrl: './invoice-manager.component.html',
  styleUrls: ['./invoice-manager.component.scss'],
  providers: [PartnerLockHandlerService, PartnerLockService, InvoiceBehaviorFactoryService]
})
export class InvoiceManagerComponent extends BaseInvoiceManagerComponent implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  title: string = ''

  private Subscription_FillFormWithFirstAvailableCustomer?: Subscription;

  cachedCustomerName?: string;

  get buyerData(): Customer {
    return this.customerData
  }
  set buyerData(buyer: Customer) {
    this.customerData = buyer
    if (this.mode && !this.mode.incoming && this.mode.invoiceType === InvoiceTypes.INV && this.mode.invoiceCategory === InvoiceCategory.NORMAL) {
      this.outInvForm.controls['paymentDate'].setValue(HelperFunctions.GetDateString(buyer.paymentDays, 0, 0))
    }
  }

  customerInputFilterString: string = '';

  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.buyerFormNav.GenerateAndSetNavMatrices(false, true);
  }

  override colsToIgnore: string[] = ["productDescription", "lineNetAmount", "lineGrossAmount", "unitOfMeasureX"];
  requiredCols: string[] = ['productCode', 'quantity', 'unitPrice'];
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
      label: 'Ár', objectKey: 'unitPrice', colKey: 'unitPrice',
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

  override outInvFormId: string = "outgoing-invoice-form";
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

  override KeySetting: Constants.KeySettingsDct = InvoiceManagerKeySettings;
  override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  formKeyRows: any = {
    "customerSearch": {
      Action: Actions.Create,
      Row: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner felvétele', KeyType: Constants.KeyTypes.Fn }
    }
  }

  isPaymentDateInNavigation = true

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
    editCustomerDialog: EditCustomerDialogManagerService,
    private offerService: OfferService,
    private route: ActivatedRoute
  ) {
    super(dialogService, footerService, dataSourceBuilder, invoiceService,
      customerService, cdref, kbS, simpleToastrService, bbxToastrService,
      cs, productService, status, sideBarService, khs,
      activatedRoute, router, tokenService,
      productCodeManagerService, printAndDownLoadService, editCustomerDialog, custDiscountService)

    this.preventF12 = true
    this.InitialSetup();
    this.activatedRoute.url.subscribe(params => {
      this.mode = behaviorFactory.create(params[0].path)
      this.path = params[0].path
    })
    this.isPageReady = true;
  }

  private async handlePathParams(): Promise<void> {
    if (this.route.snapshot.queryParamMap.has('offerId')) {
      const offerId = parseInt(this.route.snapshot.queryParams['offerId'])
      await this.loadOffer(offerId)
    }
  }

  private async loadOffer(id: number): Promise<void> {
    this.status.waitForLoad(true)

    const offerData: Offer | void = await lastValueFrom(this.offerService.Get({ ID: id, FullData: true } as GetOfferParamsModel))
      .then(data => {
        return data
      })
      .catch(err => {
        this.cs.HandleError(err)
      })
      .finally(() => { })

    if (offerData) {
      const customer: Customer | void = await lastValueFrom(this.customerService.Get({ ID: offerData.customerID } as GetCustomerParamListModel))
        .then(data => {
          return data
        })
        .catch(err => {
          this.cs.HandleError(err)
        })
        .finally(() => { })

      if (customer) {
        this.SetDataForForm(customer)

        const controls = this.outInvForm.controls
        controls['paymentMethod'].setValue(customer.defPaymentMethodX)
        controls['invoiceIssueDate'].setValue(HelperFunctions.GetDateString(0, 0, 0))
        controls['notice'].setValue(`Árajánlat: ${offerData.offerNumberX}`)

        let invoiceLines: TreeGridNode<InvoiceLine>[] = []

        let notFoundCodes: string[] = []

        // offerData.offerLines.forEach won't work with await
        for (let i = 0; i < offerData.offerLines.length; i++) {
          const offerLine = offerData.offerLines[i]

          const product: Product | void = await lastValueFrom(this.productService.GetProductByCode({ ProductCode: offerLine.productCode } as GetProductByCodeRequest))
            .then(data => {
              return data
            })

          if (isProduct(product)) {
            let invoiceLine = { data: await this.ProductToInvoiceLine(product!) }

            invoiceLine.data.quantity = offerLine.quantity
            invoiceLine.data.unitPrice = offerLine.unitPrice

            invoiceLine.data.ReCalc()

            invoiceLines.push(invoiceLine)
          } else {
            notFoundCodes.push(offerLine.productCode)
          }
        }

        if (notFoundCodes.length > 0) {
          this.cs.ShowErrorMessage(Constants.ERROR_OFFER_TO_INVOICE_PRODUCTS_NOT_FOUND + notFoundCodes.join(', '))
        }

        this.dbDataTable.AddRange(invoiceLines, 'productCode')
        this.dbData = this.dbDataTable.data
        this.dbDataDataSrc.setData(this.dbData)

        this.RecalcNetAndVat()

        this.kbS.SetCurrentNavigatable(this.outInvFormNav)
        this.kbS.SelectFirstTile()
        this.kbS.ClickCurrentElement()
      }
    }

    this.status.waitForLoad(false)
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
    });

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

  }

  private setupOutInvForm(): void {
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

    const controls = this.outInvForm.controls

    controls["invoiceDeliveryDate"].valueChanges.subscribe({
      next: v => {
        const shouldSetPaymentDate = () => {
          const paymentMethod = this.paymentMethods.find(x => x.text === controls['paymentMethod']?.value ?? '')?.value

          return this.mode &&
            !this.mode.incoming &&
            this.mode.invoiceType === InvoiceTypes.INV &&
            this.mode.invoiceCategory === InvoiceCategory.NORMAL &&
            paymentMethod !== PaymentMethods.Cash
        }

        if (shouldSetPaymentDate()) {
          this.outInvForm.controls['paymentDate'].setValue(
            HelperFunctions.AddToDate(v, this.buyerData.paymentDays, 0, 0)
          )
        }
      }
    });

    controls['paymentMethod'].valueChanges
      .pipe(
        pairwise() // Get the previous value
      )
      .subscribe(([prevValue, value]: [string, string]) => {
        this.RecalcNetAndVat();

        if (this.mode?.invoiceType !== InvoiceTypes.INV) {
          return
        }

        const paymentMethod = this.paymentMethods.find(x => x.text === value)
        if (!paymentMethod) {
          return
        }

        if (paymentMethod.value === PaymentMethods.Cash || paymentMethod.value === PaymentMethods.Card) {
          controls['paymentDate'].setValue(controls['invoiceIssueDate'].value)
        }

        const prevPaymentMethod = this.paymentMethods.find(x => x.text === prevValue)
        if (prevPaymentMethod?.value !== PaymentMethods.Cash && paymentMethod.value === PaymentMethods.Cash) {
          this.isPaymentDateInNavigation = false

          setTimeout(() => this.outInvFormNav.GenerateAndSetNavMatrices(false), 100)
        }
        else if (prevPaymentMethod?.value === PaymentMethods.Cash && paymentMethod.value !== PaymentMethods.Cash) {
          this.isPaymentDateInNavigation = true

          setTimeout(() => this.outInvFormNav.GenerateAndSetNavMatrices(false), 100)
        }

        if (paymentMethod.value === PaymentMethods.Transfer) {
          const invoiceIssueDate = moment(controls['invoiceIssueDate'].value)
          invoiceIssueDate.add(this.buyerData?.paymentDays ?? 0, 'days')

          controls['paymentDate'].setValue(invoiceIssueDate.format('YYYY-MM-DD'))
        }
      })

    controls['invoiceIssueDate'].valueChanges.subscribe(value => {
      if (this.mode?.invoiceType !== InvoiceTypes.INV) {
        return
      }

      const paymentMethod = this.paymentMethods.find(x => x.text === controls['paymentMethod'].value)?.value
      if (!paymentMethod || paymentMethod !== PaymentMethods.Cash) {
        return
      }

      controls['paymentDate'].setValue(value)
    })

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

        // Set filters

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
  private async AfterViewInitSetup(): Promise<void> {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.buyerFormNav.GenerateAndSetNavMatrices(true);
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

    await this.handlePathParams()

    setTimeout(() => {
      this.kbS.SetCurrentNavigatable(this.buyerFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);

      this.cdref.detectChanges();
    }, 500);
  }
  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();

    this.editCustomerDialogSubscription.unsubscribe()

    this.mode.partnerLock?.unlockCustomer()
  }

  private UpdateOutGoingData(): CreateOutgoingInvoiceRequest<InvoiceLine> {
    this.outGoingInvoiceData.customerID = this.buyerData.id;

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
    this.buyerForm.markAllAsTouched();
    this.outInvForm.markAllAsTouched();

    let valid = true;
    if (this.buyerForm.invalid) {
      this.bbxToastrService.showError(`Nincs megadva vevő.`);
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

    let defaultDiscountPercent: number | undefined = undefined
    if (!this.mode.incoming) {
      switch (this.mode.invoiceType) {
        case InvoiceTypes.DNO:
        case InvoiceTypes.INV: {
          defaultDiscountPercent = this.customerData.latestDiscountPercent
          break;
        }
        default: {}
      }
    }

    const isOutGoingInvoice =
        !this.mode.incoming &&
        this.mode.invoiceCategory === InvoiceCategory.NORMAL &&
        this.mode.invoiceType === InvoiceTypes.INV

    if (isOutGoingInvoice) {
      this.mode.checkCustomerLimit = this.outGoingInvoiceData.paymentMethod !== OfflinePaymentMethods.Cash.value
    }

    const dialogRef = this.dialogService.open(SaveDialogComponent, {
      context: {
        data: this.outGoingInvoiceData,
        customer: this.buyerData,
        checkCustomerLimit: this.mode.checkCustomerLimit,
        defaultDiscountPercent: defaultDiscountPercent,
        Incoming: this.mode.incoming
      }
    });
    dialogRef.onClose.subscribe((res?: OutGoingInvoiceFullData) => {
      console.log("Selected item: ", res);
      if (!res) {
        this.isSaveInProgress = false;
        // Szerkesztés esetleges folytatása miatt
        setTimeout(() => {
          this.kbS.SetCurrentNavigatable(this.dbDataTable)
          this.kbS.SelectFirstTile();
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
            if (!d.data) {
              this.cs.HandleError(d.errors);
              this.isSaveInProgress = false;
              this.status.pushProcessStatus(Constants.BlankProcessStatus);

              return
            }

            console.log('Save response: ', d);

            if (!!d.data) {
              this.outInvForm.controls['invoiceOrdinal'].setValue(d.data.invoiceNumber ?? '');
            }

            this.bbxToastrService.showSuccess(Constants.MSG_SAVE_SUCCESFUL);

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
          } catch (error) {
            this.Reset()
            this.cs.HandleError(error)
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

  ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    this.productCodeManagerService.ChooseDataForTableRow({
      dbDataTable: this.dbDataTable,
      rowIndex: rowIndex,
      wasInNavigationMode: wasInNavigationMode,
      data: this.outGoingInvoiceData,
      path: this.path
    } as ChooseProductRequest).subscribe({
      next: (selectedProduct: Product) => this.HandleProductChoose(selectedProduct, wasInNavigationMode)
    })
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

        this.mode.partnerLock?.lockCustomer(this.buyerData.id)

        this.isLoading = true
        await this.loadCustomerDiscounts(this.buyerData.id)
        this.isLoading = false

        if (this.mode.useCustomersPaymentMethod) {
          this.outInvForm.controls['paymentMethod'].setValue(this.buyerData.defPaymentMethodX)
        }

        this.kbS.SetCurrentNavigatable(this.outInvFormNav);
        this.kbS.SelectFirstTile();
        this.kbS.setEditMode(KeyboardModes.EDIT);

        if (this.dbData.findIndex(x => x.data.custDiscounted) !== -1) {
          this.bbxToastrService.showSuccess(Constants.MSG_WARNING_CUSTDISCOUNT_PREV, true);
        }
      }
    });
  }

  RefreshData(): void { }

  protected override additionalRowDataChanged(changedData: InvoiceLine, index?: number | undefined, col?: string | undefined): void {
    if (index === undefined) {
      return
    }

    if (col === 'unitPrice') {
      changedData.unitPrice = HelperFunctions.currencyRound(changedData.unitPrice, this.outGoingInvoiceData.currencyCode)

      this.RecalcNetAndVat()

      changedData.Save()
    }
  }

  private GetPartnerDiscountForProduct(productGroupCode: string): number {
    if (this.buyerData === undefined || this.buyerData.id === undefined) {
      this.bbxToastrService.showError(Constants.MSG_DISCOUNT_CUSTOMER_MUST_BE_CHOSEN);

      return 0;
    }

    const res = this.customerDiscounts.find(x => x.productGroupCode == productGroupCode)?.discount
    const discount = res ? (res / 100.0) : 0

    return discount;
  }

  override async ProductToInvoiceLine(product: Product): Promise<InvoiceLine> {
    if (product.noDiscount) {
      setTimeout(() => this.bbxToastrService.showSuccess(Constants.MSG_ERROR_NO_DISCOUNT), 0)
    }

    const res = new InvoiceLine(this.requiredCols);

    res.productCode = product.productCode!;

    res.productDescription = product.description ?? '';

    res.quantity = 0;

    product.productGroup = !!product.productGroup ? product.productGroup : '-';
    res.noDiscount = product.noDiscount;

    let unitPrice: number
    if (this.buyerData) {
      unitPrice = getPriceByPriceType(product, this.buyerData.unitPriceType)
    }
    else {
      unitPrice = product.unitPrice2!
    }

    if (!product.noDiscount) {
      const discountForPrice = this.GetPartnerDiscountForProduct(product.productGroup.split("-")[0]);
      if (discountForPrice !== undefined) {
        const discountedPrice = unitPrice * discountForPrice;
        res.unitPrice = unitPrice - discountedPrice;
        res.custDiscounted = true;
        res.discount = discountForPrice * 100
      } else {
        res.unitPrice = unitPrice;
      }
    } else {
      res.unitPrice = unitPrice;
    }

    res.unitPrice = HelperFunctions.currencyRound(res.unitPrice, this.outGoingInvoiceData.currencyCode, true)

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
      next: async res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.buyerData = res.data[0];
          this.cachedCustomerName = res.data[0].customerName;
          this.searchByTaxtNumber = false;

          this.mode.partnerLock?.lockCustomer(this.buyerData.id)

          this.isLoading = true
          await this.loadCustomerDiscounts(this.buyerData.id)
          this.isLoading = false

          if (this.mode.useCustomersPaymentMethod) {
            this.outInvForm.controls['paymentMethod'].setValue(this.buyerData.defPaymentMethodX)
          }

          if (this.dbData.findIndex(x => x.data.custDiscounted) !== -1) {
            this.bbxToastrService.showSuccess(Constants.MSG_WARNING_CUSTDISCOUNT_PREV, true);
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
        case this.KeySetting[Actions.Edit].KeyCode: {
          if (!isForm) {
            return;
          }

          HelperFunctions.StopEvent(event)

          this.editCustomer()

          break;
        }
      }
    }
  }
}
