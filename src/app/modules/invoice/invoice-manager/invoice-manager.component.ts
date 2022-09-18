import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NbTable, NbSortDirection, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService, NbSortRequest } from '@nebular/theme';
import { Observable, of, startWith, map, BehaviorSubject, Subscription } from 'rxjs';
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
import { todaysDate, validDate } from 'src/assets/model/Validators';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { CustomerSelectTableDialogComponent } from '../customer-select-table-dialog/customer-select-table-dialog.component';
import { CreateOutgoingInvoiceRequest } from '../models/CreateOutgoingInvoiceRequest';
import { InvoiceLine } from '../models/InvoiceLine';
import { PaymentMethod } from '../models/PaymentMethod';
import { ProductSelectTableDialogComponent } from '../product-select-table-dialog/product-select-table-dialog.component';
import { InvoiceService } from '../services/invoice.service';
import { SaveDialogComponent } from '../save-dialog/save-dialog.component';
import { SumData } from '../models/SumData';
import { ProductService } from '../../product/services/product.service';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { TaxNumberSearchCustomerEditDialogComponent } from '../tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { GetCustomerByTaxNumberParams } from '../../customer/models/GetCustomerByTaxNumberParams';
import { CountryCode } from '../../customer/models/CountryCode';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { UtilityService } from 'src/app/services/utility.service';
import { OneTextInputDialogComponent } from '../../shared/one-text-input-dialog/one-text-input-dialog.component';
import { Actions, GetFooterCommandListFromKeySettings, InvoiceKeySettings, InvoiceManagerKeySettings, IsKeyFunctionKey, KeyBindings } from 'src/assets/util/KeyBindings';
import { CustomerDialogTableSettings, ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';

@Component({
  selector: 'app-invoice-manager',
  templateUrl: './invoice-manager.component.html',
  styleUrls: ['./invoice-manager.component.scss']
})
export class InvoiceManagerComponent extends BaseInlineManagerComponent<InvoiceLine> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  private InvoiceType: string = "";
  private Incoming: boolean = false;

  private Subscription_FillFormWithFirstAvailableCustomer?: Subscription;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  cachedCustomerName?: string;

  senderData!: Customer;
  buyerData!: Customer;

  buyersData: Customer[] = [];
  filteredBuyerOptions$: Observable<string[]> = of([]);

  paymentMethods: PaymentMethod[] = [];
  _paymentMethods: string[] = [];
  paymentMethodOptions$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  outGoingInvoiceData!: CreateOutgoingInvoiceRequest;

  customerInputFilterString: string = '';

  isPageReady = false;

  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.buyerFormNav.GenerateAndSetNavMatrices(false, true);
  }

  override colsToIgnore: string[] = ["productDescription", "lineNetAmount", "lineGrossAmount", "unitOfMeasureX"];
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
      colWidth: "30%", textAlign: "left", fInputType: 'code-field'
    },
    {
      label: 'Megnevezés', objectKey: 'productDescription', colKey: 'productDescription',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "70%", textAlign: "left",
    },
    {
      label: 'Mennyiség', objectKey: 'quantity', colKey: 'quantity',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "100px", textAlign: "right", fInputType: 'formatted-number-integer'
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

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  exporterForm!: FormGroup;

  outInvForm!: FormGroup;
  outInvFormId: string = "outgoing-invoice-form";
  outInvFormNav!: InlineTableNavigatableForm;
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

  // CountryCode
  countryCodes: CountryCode[] = [];

  public KeySetting: Constants.KeySettingsDct = InvoiceManagerKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvoiceLine>>,
    private seInv: InvoiceService,
    private seC: CustomerService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private simpleToastrService: NbToastrService,
    private bbxToastrService: BbxToastrService,
    cs: CommonService,
    sts: StatusService,
    private productService: ProductService,
    private utS: UtilityService,
    private status: StatusService,
    sideBarService: BbxSidebarService,
    khs: KeyboardHelperService,
    private activatedRoute: ActivatedRoute
  ) {
    super(dialogService, kbS, fS, cs, sts, sideBarService, khs);
    this.InitialSetup();
    this.activatedRoute.url.subscribe(params => {
      this.SetModeBasedOnRoute(params);
    })
    this.isPageReady = true;
  }

  private SetModeBasedOnRoute(params: UrlSegment[]): void {
    console.log("ActivatedRoute: ", params[0].path);
    const path = params[0].path;
    if (path === 'invoice') {
      this.InvoiceType = 'INV';
      this.Incoming = false;
    } else if (path === 'outgoing-delivery-note-income') {
      this.InvoiceType = 'DNI';
      this.Incoming = false;
    }
    console.log("InvoiceType: ", this.InvoiceType);
    console.log("Incoming: ", this.Incoming);
  }

  private Reset(): void {
    console.log(`Reset.`);
    this.kbS.ResetToRoot();
    this.InitialSetup();
    this.AfterViewInitSetup();
  }

  private InitialSetup(): void {
    this.dbDataTableId = "invoice-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    // Init form and table content - empty
    this.senderData = {} as Customer;
    this.buyerData = {} as Customer;

    this.outGoingInvoiceData = {
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
      paymentMethod: ''
    } as CreateOutgoingInvoiceRequest;

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    if (this.exporterForm === undefined) {
      this.exporterForm = new FormGroup({
        customerName: new FormControl('', []),
        zipCodeCity: new FormControl('', []),
        additionalAddressDetail: new FormControl('', []),
        customerBankAccountNumber: new FormControl('', []),
        taxpayerNumber: new FormControl('', []),
        comment: new FormControl('', []),
      });
    } else {
      this.exporterForm.reset(undefined);
    }

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
          todaysDate,
          validDate
        ]),
        paymentDate: new FormControl('', [
          Validators.required,
          this.validatePaymentDateMinMax.bind(this),
          validDate
        ]),
        invoiceOrdinal: new FormControl('', []), // in post response
        notice: new FormControl('', []),
      });
    } else {
      this.outInvForm.reset(undefined);
    }

    if (this.buyerForm === undefined) {
      this.buyerForm = new FormGroup({
        customerSearch: new FormControl('', []),
        customerName: new FormControl('', [Validators.required]),
        zipCodeCity: new FormControl('', []),
        additionalAddressDetail: new FormControl('', []),
        customerBankAccountNumber: new FormControl('', []),
        taxpayerNumber: new FormControl('', []),
        comment: new FormControl('', []),
      });
    } else {
      this.buyerForm.reset(undefined);
    }

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
    const wrong = new Date(control.value) > this.invoiceIssueDateValue;
    return wrong ? { maxDate: { value: control.value } } : null;
  }

  // paymentDate
  validatePaymentDateMinMax(control: AbstractControl): any {
    if (this.invoiceIssueDateValue === undefined || this.invoiceDeliveryDateValue === undefined) {
      return null;
    }
    const _date = new Date(control.value);
    const wrong = _date < this.invoiceIssueDateValue || _date > this.invoiceDeliveryDateValue;
    return wrong ? { minMaxDate: { value: control.value } } : null;
  }

  InitFormDefaultValues(): void {
    this.outInvForm.controls['invoiceIssueDate'].setValue(HelperFunctions.GetDateString(0,0,0));
    this.outInvForm.controls['invoiceDeliveryDate'].setValue(HelperFunctions.GetDateString(0, 0, 0));
    this.outInvForm.controls['paymentDate'].setValue(HelperFunctions.GetDateString(0, 0, 0));

    this.outInvForm.controls['invoiceIssueDate'].valueChanges.subscribe({
      next: p => {
        this.outInvForm.controls['invoiceDeliveryDate'].setValue(this.outInvForm.controls['invoiceDeliveryDate'].value);
        this.outInvForm.controls['invoiceDeliveryDate'].markAsTouched();

        this.outInvForm.controls['paymentDate'].setValue(this.outInvForm.controls['paymentDate'].value);
        this.outInvForm.controls['paymentDate'].markAsTouched();
      }
    });
  }

  ToFloat(p: any): number {
    return p !== undefined || p === '' || p === ' ' ? parseFloat((p + '').replace(' ', '')) : 0;
  }

  RecalcNetAndVat(): void {
    this.outGoingInvoiceData.invoiceLines = this.dbData.filter(x => !x.data.IsUnfinished()).map(x => x.data);

    this.outGoingInvoiceData.invoiceNetAmount =
      this.outGoingInvoiceData.invoiceLines
        .map(x => this.ToFloat(x.unitPrice) * this.ToFloat(x.quantity))
        .reduce((sum, current) => sum + current, 0);

    this.outGoingInvoiceData.lineGrossAmount =
      this.outGoingInvoiceData.invoiceLines
        .map(x => (this.ToFloat(x.unitPrice) * this.ToFloat(x.quantity)) + this.ToFloat(x.lineVatAmount + ''))
        .reduce((sum, current) => sum + current, 0);
  }

  HandleGridCodeFieldEnter(event: any, row: TreeGridNode<InvoiceLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!event) {
      this.bbxToastrService.close();
      event.stopPropagation();
    }
    console.log('[HandleGridCodeFieldEnter]: editmode off: ', this.editDisabled);
    if (this.editDisabled) {
      this.dbDataTable.HandleGridEnter(row, rowPos, objectKey, colPos, inputId, fInputType);
      setTimeout(() => {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.kbS.ClickCurrentElement();
      }, 50);
    } else {
      this.TableCodeFieldChanged(row.data, rowPos, row, rowPos, objectKey, colPos, inputId, fInputType);
    }
  }

  private TableCodeFieldChanged(changedData: any, index: number, row: TreeGridNode<InvoiceLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!changedData && !!changedData.productCode && changedData.productCode.length > 0) {
      this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: product => {
          console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

          if (!!product && !!product?.productCode) {
            this.dbDataTable.FillCurrentlyEditedRow({ data: this.ProductToInvoiceLine(product) });
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            this.dbDataTable.MoveNextInTable();
            setTimeout(() => {
              this.kbS.setEditMode(KeyboardModes.EDIT);
              this.kbS.ClickCurrentElement();
            }, 200);
          } else {
            this.bbxToastrService.show(
              Constants.MSG_NO_PRODUCT_FOUND,
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
          }
        },
        error: err => {
          this.RecalcNetAndVat();
        }
      });
    }
  }

  TableRowDataChanged(changedData?: any, index?: number, col?: string): void {
    if (!!changedData && !!changedData.productCode) {
      if ((!!col && col === 'productCode') || col === undefined) {
        this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
          next: product => {
            console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

            if (index !== undefined) {
              let tmp = this.dbData[index].data;

              tmp.productDescription = product.description ?? '';

              product.vatPercentage = product.vatPercentage === 0 ? 0.27 : product.vatPercentage;
              tmp.vatRate = (product.vatPercentage ?? 1) + '';
              product.vatRateCode = product.vatRateCode === null || product.vatRateCode === undefined || product.vatRateCode === '' ? '27%' : product.vatRateCode;
              tmp.vatRateCode = product.vatRateCode;

              tmp.lineNetAmount = this.ToFloat(tmp.unitPrice) * this.ToFloat(tmp.quantity);
              tmp.lineVatAmount = this.ToFloat(tmp.lineNetAmount) * this.ToFloat(tmp.vatRate);
              tmp.lineGrossAmount = this.ToFloat(tmp.lineVatAmount) + this.ToFloat(tmp.lineNetAmount);

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

          tmp.lineNetAmount = this.ToFloat(tmp.unitPrice) * this.ToFloat(tmp.quantity);
          tmp.lineVatAmount = this.ToFloat(tmp.lineNetAmount) * this.ToFloat(tmp.vatRate);
          tmp.lineGrossAmount = this.ToFloat(tmp.lineVatAmount) + this.ToFloat(tmp.lineNetAmount);

          // console.log('--------------');
          // console.log('Calculation:');
          // console.log(tmp);
          // console.log('this.ToFloat(tmp.price): ',this.ToFloat(tmp.price));
          // console.log('this.ToFloat(tmp.quantity): ', this.ToFloat(tmp.quantity));
          // console.log('this.ToFloat(tmp.vatRate): ', this.ToFloat(tmp.vatRate));
          // console.log('tmp.lineGrossAmount: ', tmp.lineGrossAmount);
          // console.log('tmp.lineNetAmount: ', tmp.lineNetAmount);
          // console.log('tmp.lineVatAmount: ', tmp.lineVatAmount);
          // console.log('this.ToFloat(tmp.lineNetAmount): ', this.ToFloat(tmp.lineNetAmount));
          // console.log('this.ToFloat(tmp.lineVatAmount): ', this.ToFloat(tmp.lineVatAmount));
          // console.log('--------------');

          this.dbData[index].data = tmp;

          this.dbDataDataSrc.setData(this.dbData);
        }

        this.RecalcNetAndVat();
      }
    }
  }

  refresh(): void {
    const tempPaymentSubscription = this.seInv.GetTemporaryPaymentMethod().subscribe({
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
    this.seInv.GetPaymentMethods().subscribe({
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

    this.seC.GetAllCountryCodes().subscribe({
      next: (data) => {
        if (!!data) this.countryCodes = data;
      },
      error: (err) => {
        this.cs.HandleError(err);
      }
    });

    this.seC.GetAll({ IsOwnData: false }).subscribe({
      next: d => {
        // Possible buyers
        this.buyersData = d.data!;
        this.buyerFormNav.Setup(this.buyersData);
        console.log('Buyers: ', d);

        // Set filters
        this.filteredBuyerOptions$ = this.buyerForm.controls['customerName'].valueChanges
          .pipe(
            startWith(''),
            map((filterString: any) => this.filterBuyers(filterString)),
          );

        // Products
        this.dbData = [];
        this.dbDataDataSrc.setData(this.dbData);

        this.seC.GetAll({ IsOwnData: true }).subscribe({
          next: d => {
            // Exporter form
            this.senderData = d.data?.filter(x => x.isOwnData)[0] ?? {} as Customer;
            console.log('Exporter: ', d);
            this.exporterForm = new FormGroup({
              customerName: new FormControl(this.senderData.customerName ?? '', []),
              zipCodeCity: new FormControl((this.senderData.postalCode ?? '') + ' ' + (this.senderData.city ?? ''), []),
              additionalAddressDetail: new FormControl(this.senderData.additionalAddressDetail ?? '', []),
              customerBankAccountNumber: new FormControl(this.senderData.customerBankAccountNumber ?? '', []),
              taxpayerNumber: new FormControl(this.senderData.taxpayerNumber ?? '', []),
              comment: new FormControl(this.senderData.comment ?? '', []),
            });

            this.table?.renderRows();
            this.RefreshTable();

            this.isLoading = false;
          },
          error: (err) => {
            this.cs.HandleError(err); this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
            // this.Refresh();
          },
        });
      },
      error: (err) => {
        this.cs.HandleError(err); this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
        // this.Refresh();
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
  }

  private UpdateOutGoingData(): void {
    this.outGoingInvoiceData.customerID = this.buyerData.id;
    
    this.outGoingInvoiceData.notice = this.outInvForm.controls['notice'].value;
    
    this.outGoingInvoiceData.invoiceDeliveryDate = this.outInvForm.controls['invoiceDeliveryDate'].value;
    this.outGoingInvoiceData.invoiceIssueDate = this.outInvForm.controls['invoiceIssueDate'].value;
    this.outGoingInvoiceData.paymentDate = this.outInvForm.controls['paymentDate'].value;
    
    this.outGoingInvoiceData.paymentMethod =
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
    
    this.outGoingInvoiceData.currencyCode = 'HUF';
    this.outGoingInvoiceData.exchangeRate = 1;

    this.outGoingInvoiceData.warehouseCode = '001';

    this.outGoingInvoiceData.incoming = this.Incoming;
    this.outGoingInvoiceData.invoiceType = this.InvoiceType;

    console.log('[UpdateOutGoingData]: ', this.outGoingInvoiceData, this.outInvForm.controls['paymentMethod'].value);
  }

  printReport(id: any, copies: number): void {
    this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_CMD]);
    this.utS.execute(
      Constants.CommandType.PRINT_INVOICE, Constants.FileExtensions.PDF,
      {
        "section": "Szamla",
        "fileType": "pdf",
        "report_params":
        {
          "id": id,
          "invoiceNumber": null
        },
        // "copies": copies,
        "data_operation": Constants.DataOperation.PRINT_BLOB
      } as Constants.Dct);
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
        data: this.outGoingInvoiceData
      }
    });
    dialogRef.onClose.subscribe((res: SumData) => {
      console.log("Selected item: ", res);
      this.status.pushProcessStatus(Constants.GeneralSavingStatuses[0]);
      if (!!res) {
        this.isLoading = true;
        this.seInv.CreateOutgoing(this.outGoingInvoiceData).subscribe({
          next: d => {
            this.status.pushProcessStatus(Constants.BlankProcessStatus);
            //this.isSilentLoading = false;
            if (!!d.data) {
              console.log('Save response: ', d);

              if (!!d.data) {
                this.outInvForm.controls['invoiceOrdinal'].setValue(d.data.invoiceNumber ?? '');
              }
              
              this.simpleToastrService.show(
                Constants.MSG_SAVE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
              this.isLoading = false;

              this.dbDataTable.RemoveEditRow();
              this.kbS.SelectFirstTile();

              this.isSaveInProgress = true;

              const dialogRef = this.dialogService.open(OneTextInputDialogComponent, {
                context: {
                  title: 'Számla Nyomtatása',
                  inputLabel: 'Példányszám',
                  defaultValue: 1
                }
              });
              dialogRef.onClose.subscribe({
                next: res => {
                  console.log("OneTextInputDialogComponent: ", res);
                  if (res.answer && HelperFunctions.ToInt(res.value) > 0) {
                    let commandEndedSubscription = this.utS.CommandEnded.subscribe({
                      next: cmdEnded => {
                        console.log(`CommandEnded received: ${cmdEnded?.ResultCmdType}`);

                        if (cmdEnded?.ResultCmdType === Constants.CommandType.PRINT_REPORT) {
                          this.Reset();

                          this.simpleToastrService.show(
                            `A ${d.data?.invoiceNumber ?? ''} számla nyomtatása véget ért.`,
                            Constants.TITLE_INFO,
                            Constants.TOASTR_SUCCESS_5_SEC
                          );
                          commandEndedSubscription.unsubscribe();
                        }

                        this.isLoading = false;
                        this.isSaveInProgress = false;
                      },
                      error: cmdEnded => {
                        console.log(`CommandEnded error received: ${cmdEnded?.CmdType}`);
                        
                        this.isLoading = false;
                        this.isSaveInProgress = false;
                        
                        this.bbxToastrService.show(
                          `A ${d.data?.invoiceNumber ?? ''} számla nyomtatása közben hiba történt.`,
                          Constants.TITLE_ERROR,
                          Constants.TOASTR_ERROR
                          );
                          this.isLoading = false;
                          this.isSaveInProgress = false;

                          commandEndedSubscription.unsubscribe();
                      }
                    });
                    this.isLoading = true;
                    this.printReport(d.data?.id, res.value);
                  } else {
                    this.simpleToastrService.show(
                      `A ${d.data?.invoiceNumber ?? ''} számla nyomtatása nem történt meg.`,
                      Constants.TITLE_INFO,
                      Constants.TOASTR_SUCCESS_5_SEC
                    );
                    this.isLoading = false;
                    this.isSaveInProgress = false;
                    this.Reset();
                  }
                }
              });
            } else {
              this.cs.HandleError(d.errors);
              this.isLoading = false;
              this.isSaveInProgress = false;
            }
          },
          error: err => {
            this.status.pushProcessStatus(Constants.BlankProcessStatus);
            this.cs.HandleError(err);
            this.isLoading = false;
            this.isSaveInProgress = false;
          },
          complete: () => {
            this.isLoading = false;
            this.isSaveInProgress = false;
          }
        });
      } else {
        this.isLoading = false;
        this.isSaveInProgress = false;
      }
    });
  }

  ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    console.log("Selecting InvoiceLine from avaiable data.");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.dbDataTable.editedRow?.data.productCode ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs
      }
    });
    dialogRef.onClose.subscribe((res: Product) => {
      console.log("Selected item: ", res);
      if (!!res) {
        if (!wasInNavigationMode) {
          this.dbDataTable.FillCurrentlyEditedRow({ data: this.ProductToInvoiceLine(res) });
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
    });
  }

  ChooseDataForForm(): void {
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
        this.buyerFormNav.FillForm(res);

        this.kbS.SetCurrentNavigatable(this.outInvFormNav);
        this.kbS.SelectFirstTile();
        this.kbS.setEditMode(KeyboardModes.EDIT);
      }
    });
  }

  RefreshData(): void { }

  ProductToInvoiceLine(p: Product): InvoiceLine {
    let res = new InvoiceLine();

    res.productCode = p.productCode!;

    res.productDescription = p.description ?? '';

    res.quantity = 0;
    
    res.unitPrice = p.unitPrice1!;
    
    res.vatRateCode = p.vatRateCode;

    res.lineVatAmount = p.vatPercentage ?? 10;
    res.lineNetAmount = this.ToFloat(res.quantity) * this.ToFloat(res.unitPrice);
    res.lineGrossAmount = res.lineVatAmount * res.lineNetAmount;

    res.unitOfMeasure = p.unitOfMeasure;
    res.unitOfMeasureX = p.unitOfMeasureX;

    console.log('ProductToInvoiceLine res: ', res);

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
    
    this.Subscription_FillFormWithFirstAvailableCustomer = this.seC.GetAll({
      IsOwnData: false, PageNumber: '1', PageSize: '1', SearchString: this.customerInputFilterString
    } as GetCustomersParamListModel).subscribe({
      next: res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.buyerData = res.data[0];
          this.cachedCustomerName = res.data[0].customerName;
          this.buyerFormNav.FillForm(res.data[0], ['customerSearch']);
          this.searchByTaxtNumber = false;
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

  private PrepareCustomer(data: Customer): Customer {
    console.log('Before: ', data);

    data.customerBankAccountNumber = data.customerBankAccountNumber ?? '';
    data.taxpayerNumber = (data.taxpayerId + (data.countyCode ?? '')) ?? '';

    if (data.countryCode !== undefined && this.countryCodes.length > 0) {
      data.countryCode = this.countryCodes.find(x => x.value == data.countryCode)?.text ?? '';
    }

    return data;
  }

  override SetDataForForm(data: any): void {
    if (!!data) {
      this.buyerData = data as Customer;
      this.buyerFormNav.FillForm(data);

      this.kbS.SetCurrentNavigatable(this.outInvFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);
    }
  }

  ChoseDataForFormByTaxtNumber(): void {
    console.log("Selecting Customer from avaiable data by taxtnumber.");

    this.isLoading = true;

    this.seC.GetByTaxNumber({ Taxnumber: this.customerInputFilterString } as GetCustomerByTaxNumberParams).subscribe({
      next: res => {
        if (!!res && !!res.data && !!res.data.customerName && res.data.customerName.length > 0) {
          this.kbS.setEditMode(KeyboardModes.NAVIGATION);

          const dialogRef = this.dialogService.open(TaxNumberSearchCustomerEditDialogComponent, {
            context: {
              data: this.PrepareCustomer(res.data)
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
          this.bbxToastrService.show(res.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
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

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (!this.isSaveInProgress && event.ctrlKey && event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return;
      }
      this.Save();
      return;
    }
  }
}
