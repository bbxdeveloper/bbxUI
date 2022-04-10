import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NbTable, NbSortDirection, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
import { Observable, of, startWith, map } from 'rxjs';
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
import { maxDate, minDate, todaysDate } from 'src/assets/model/Validators';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { CustomerSelectTableDialogComponent } from '../customer-select-table-dialog/customer-select-table-dialog.component';
import { CreateOutgoingInvoiceRequest } from '../models/CreateOutgoingInvoiceRequest';
import { InvoiceLine } from '../models/InvoiceLine';
import { PaymentMethod } from '../models/PaymentMethod';
import { ProductSelectTableDialogComponent } from '../product-select-table-dialog/product-select-table-dialog.component';
import { InvoiceService } from '../services/invoice.service';
import { createMask } from '@ngneat/input-mask';

@Component({
  selector: 'app-invoice-manager',
  templateUrl: './invoice-manager.component.html',
  styleUrls: ['./invoice-manager.component.scss']
})
export class InvoiceManagerComponent extends BaseInlineManagerComponent<InvoiceLine> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  senderData: Customer;
  buyerData: Customer;

  buyersData: Customer[] = [];
  paymentMethods: PaymentMethod[] = [];

  outGoingInvoiceData: CreateOutgoingInvoiceRequest;

  filteredBuyerOptions$: Observable<string[]> = of([]);
  paymentMethodOptions$: Observable<string[]> = of([]);

  customerInputFilterString: string = '';

  numberInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0.0',
  });

  numberInputMaskInteger = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 0,
    digitsOptional: true,
    prefix: '',
    placeholder: '',
  });

  override colsToIgnore: string[] = ["productDescription", "lineNetAmount", "lineGrossAmount"];
  override allColumns = [
    'productCode',
    'productDescription',
    'quantity',
    'unitOfMeasure',
    'price',
    'lineNetAmount',
    'lineGrossAmount',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Termékkód', objectKey: 'productCode', colKey: 'productCode',
      defaultValue: '', type: 'string', mask: "AAA-ACCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
      colWidth: "20%", textAlign: "left", fInputType: 'code-field'
    },
    {
      label: 'Megnevezés', objectKey: 'productDescription', colKey: 'productDescription',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "20%", textAlign: "left",
    },
    {
      label: 'Mennyiség', objectKey: 'quantity', colKey: 'quantity',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "5%", textAlign: "left", fInputType: 'formatted-number-integer'
    },
    { // unitofmeasureX show, post unitofmeasureCode
      label: 'Mértékegység', objectKey: 'unitOfMeasure', colKey: 'unitOfMeasure',
      defaultValue: '', type: 'string', mask: "",
      colWidth: "15%", textAlign: "right"
    },
    {
      label: 'Ár', objectKey: 'price', colKey: 'price',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "15%", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Nettó', objectKey: 'lineNetAmount', colKey: 'lineNetAmount',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "15%", textAlign: "right", calc: (x: InvoiceLine) => x.price * x.quantity
    },
    {
      label: 'Bruttó', objectKey: 'lineGrossAmount', colKey: 'lineGrossAmount',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "15%", textAlign: "right", calc: (x: InvoiceLine) => x.lineNetAmount + x.lineVatAmount
    },
  ]
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  override readonly commands: FooterCommandInfo[] = [
    { key: 'F1', value: 'Súgó', disabled: false },
    { key: 'F2', value: 'Keresés', disabled: false },
    { key: 'F3', value: 'Új Partner', disabled: false },
    { key: 'F4', value: 'Számolás', disabled: false },
    { key: 'F5', value: 'Adóalany', disabled: false },
    { key: 'F6', value: 'Módosítás', disabled: false },
    { key: 'F7', value: 'GdprNy', disabled: false },
    { key: 'F8', value: 'GdprAd', disabled: false },
    { key: 'F9', value: '', disabled: false },
    { key: 'F10', value: '', disabled: false },
  ];

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  exporterForm: FormGroup;

  outInvForm: FormGroup;
  outInvFormId: string = "outgoing-invoice-form";
  outInvFormNav: InlineTableNavigatableForm;

  buyerForm: FormGroup;
  buyerFormId: string = "buyer-form";
  buyerFormNav: InlineTableNavigatableForm;

  private tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  get invoiceIssueDateValue(): Date | undefined {
    if (!!!this.outInvForm) {
      return undefined;
    }
    const tmp = this.outInvForm.controls['invoiceIssueDate'].value;

    // console.log(tmp, new Date(tmp));

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }

  get invoiceDeliveryDateValue(): Date | undefined {
    if (!!!this.outInvForm) {
      return undefined;
    }
    const tmp = this.outInvForm.controls['invoiceDeliveryDate'].value;

    // console.log(tmp, new Date(tmp));

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvoiceLine>>,
    private seInv: InvoiceService,
    private seC: CustomerService,
    private seW: WareHouseService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: NbToastrService,
    cs: CommonService,
    sts: StatusService
  ) {
    super(dialogService, kbS, fS, cs, sts);
    this.dbDataTableId = "invoice-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    // Init form and table content - empty
    this.senderData = {} as Customer;
    this.buyerData = {} as Customer;

    this.outGoingInvoiceData = {
      lineGrossAmount: 0,
      invoiceVatAmount: 0,
      invoiceNetAmount: 0,
      invoiceLines: [],
      warehouseCode: 0,
      customerID: -1,
      invoiceDeliveryDate: '',
      invoiceIssueDate: '',
      notice: '',
      paymentDate: '',
      paymentMethod: ''
    } as CreateOutgoingInvoiceRequest;

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.exporterForm = new FormGroup({
      customerName: new FormControl('', []),
      zipCodeCity: new FormControl('', []),
      additionalAddressDetail: new FormControl('', []),
      customerBankAccountNumber: new FormControl('', []),
      taxpayerNumber: new FormControl('', []),
      comment: new FormControl('', []),
    });
    this.outInvForm = new FormGroup({
      paymentMethod: new FormControl('', [Validators.required]),
      invoiceDeliveryDate: new FormControl('', [Validators.required, (this.validateInvoiceDeliveryDate.bind(this))]),
      invoiceIssueDate: new FormControl('', [Validators.required, todaysDate]),
      paymentDate: new FormControl('', [Validators.required, (this.validatePaymentDateMinMax.bind(this))]),
      invoiceOrdinal: new FormControl('', [Validators.required]), // in post response
      notice: new FormControl('', []),
    });
    this.buyerForm = new FormGroup({
      customerName: new FormControl('', [Validators.required]),
      zipCodeCity: new FormControl('', []),
      additionalAddressDetail: new FormControl('', []),
      customerBankAccountNumber: new FormControl('', []),
      taxpayerNumber: new FormControl('', []),
      comment: new FormControl('', []),
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
        return new InvoiceLine();
      },
      this
    );

    this.dbDataTable!.OuterJump = true;

    // Refresh data
    this.refresh();
  }

  // invoiceDeliveryDate
  validateInvoiceDeliveryDate(control: AbstractControl): any {
    if (this.invoiceIssueDateValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) < this.invoiceIssueDateValue;
    return wrong ? { minDate: { value: control.value } } : null;
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

  // validateInvoiceDeliveryDate(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const wrong = new Date(control.value) < minDate;
  //     return wrong ? { dateIsSmallerThanMin: { value: control.value } } : null;
  //   };
  // }

  // validatePaymentDate(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const wrong = new Date(control.value) > maxDate;
  //     return wrong ? { dateIsBiggerThanMax: { value: control.value } } : null;
  //   };
  // }

  InitFormDefaultValues(): void {
    const tmp = new Date();
    const year = tmp.getFullYear();

    let month = tmp.getMonth() + '';
    month = month.length === 1 ? '0' + month : month;

    let day = tmp.getDay() + '';
    day = day.length === 1 ? '0' + day : month;

    const dateStr = year + '-' + month + '-' + day;

    this.outInvForm.controls['invoiceIssueDate'].setValue(dateStr);
    this.outInvForm.controls['invoiceDeliveryDate'].setValue(dateStr);
    this.outInvForm.controls['paymentDate'].setValue(dateStr);

    this.outInvForm.controls['invoiceIssueDate'].valueChanges.subscribe({
      next: p => {
        this.outInvForm.controls['invoiceDeliveryDate'].setValue(this.outInvForm.controls['invoiceDeliveryDate'].value);
        this.outInvForm.controls['invoiceDeliveryDate'].markAsTouched();

        this.outInvForm.controls['paymentDate'].setValue(this.outInvForm.controls['paymentDate'].value);
        this.outInvForm.controls['paymentDate'].markAsTouched();
      }
    });
  }

  ToInt(p: any): number {
    return p !== undefined || p === '' || p === ' ' ? parseInt((p + '').trim()) : 0;
  }

  TableRowDataChanged(changedData?: any, index?: number): void {
    if (!!changedData) {
      // TODO: Calc in InvoiceLine before

      console.log('[TableRowDataChanged]: ', changedData);

      this.outGoingInvoiceData.invoiceLines = this.dbData.map(x => x.data);

      this.outGoingInvoiceData.invoiceNetAmount =
        this.outGoingInvoiceData.invoiceLines
          .map(x => this.ToInt(x.price) * this.ToInt(x.quantity))
          .reduce((sum, current) => sum + current, 0);

      this.outGoingInvoiceData.lineGrossAmount =
        this.outGoingInvoiceData.invoiceLines
          .map(x => (this.ToInt(x.price) * this.ToInt(x.quantity)) + this.ToInt(x.lineVatAmount + ''))
          .reduce((sum, current) => sum + current, 0);

      if (index !== undefined) {
        let tmp = this.dbData[index].data;
        tmp.lineNetAmount = this.ToInt(tmp.price) * this.ToInt(tmp.quantity);
        tmp.lineVatAmount = this.ToInt(tmp.lineNetAmount) * this.ToInt(tmp.vatRate);
        tmp.lineGrossAmount = this.ToInt(tmp.lineVatAmount) + this.ToInt(tmp.lineNetAmount);
      }
    }
  }

  refresh(): void {
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

        this.paymentMethodOptions$ = this.seInv.GetPaymentMethods().pipe(map(data => data.map(d => d.paymentMethodDescription)));

        this.seC.GetAll({ IsOwnData: true }).subscribe({
          next: d => {
            // Exporter form
            this.senderData = d.data?.filter(x => x.isOwnData)[0] ?? {} as Customer;
            console.log('Exporter: ', d);
            this.exporterForm = new FormGroup({
              customerName: new FormControl(this.senderData.customerName, []),
              zipCodeCity: new FormControl(this.senderData.postalCode + ' ' + this.senderData.city, []),
              additionalAddressDetail: new FormControl(this.senderData.additionalAddressDetail, []),
              customerBankAccountNumber: new FormControl(this.senderData.customerBankAccountNumber, []),
              taxpayerNumber: new FormControl(this.senderData.taxpayerNumber, []),
              comment: new FormControl(this.senderData.comment, []),
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
    if (this.isEditModeOff) {
      return [];
    }
    const filterValue = value.toLowerCase();
    return [""].concat(this.buyersData.map(x => x.customerName).filter(optionValue => optionValue.toLowerCase().includes(filterValue)));
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.InitFormDefaultValues();

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

    this.kbS.SetCurrentNavigatable(this.buyerFormNav);
    this.kbS.SelectFirstTile();

    this.cdref.detectChanges();
  }
  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();
  }

  private UpdateOutGoingData(): void {
    this.outGoingInvoiceData.customerID = this.buyerData.id;
    this.outGoingInvoiceData.invoiceDeliveryDate = this.outInvForm.controls['invoiceDeliveryDate'].value;
    this.outGoingInvoiceData.invoiceIssueDate = this.outInvForm.controls['invoiceIssueDate'].value;
    this.outGoingInvoiceData.notice = this.outInvForm.controls['notice'].value;
    this.outGoingInvoiceData.paymentDate = this.outInvForm.controls['paymentDate'].value;
    this.outGoingInvoiceData.paymentMethod = this.outInvForm.controls['paymentMethod'].value;
    this.outGoingInvoiceData.warehouseCode = 1;
    this.outGoingInvoiceData.invoiceNetAmount = 0;
    this.outGoingInvoiceData.invoiceVatAmount = 0;
  }

  Save(): void {
    if (this.outInvForm.invalid) {
      return;
    }

    this.UpdateOutGoingData();

    console.log('Save: ', this.outGoingInvoiceData);
    this.seInv.CreateOutgoing(this.outGoingInvoiceData).subscribe({
      next: d => {
        this.toastrService.show(
          Constants.MSG_SAVE_SUCCESFUL,
          Constants.TITLE_INFO,
          Constants.TOASTR_SUCCESS
        );
        this.isLoading = false;
      },
      error: err => {
        this.cs.HandleError(err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  ChooseDataForTableRow(rowIndex: number): void {
    console.log("Selecting InvoiceLine from avaiable data.");

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        allColumns: [
          'productCode',
          'description',
          'unitPrice1',
          'unitPrice2',
        ],
        colDefs: [
          {
            label: 'Kód',
            objectKey: 'productCode',
            colKey: 'productCode',
            defaultValue: '',
            type: 'string',
            fInputType: 'readonly',
            mask: '',
            colWidth: '15%',
            textAlign: 'center',
            navMatrixCssClass: TileCssClass,
          },
          {
            label: 'Megnevezés',
            objectKey: 'description',
            colKey: 'description',
            defaultValue: '',
            type: 'string',
            fInputType: 'text',
            mask: '',
            colWidth: '25%',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
          },
          {
            label: 'Elad ár 1',
            objectKey: 'unitPrice1',
            colKey: 'unitPrice1',
            defaultValue: '',
            type: 'string',
            fInputType: 'text',
            fRequired: true,
            mask: '',
            colWidth: '30%',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
          },
          {
            label: 'Elad ár 2',
            objectKey: 'unitPrice2',
            colKey: 'unitPrice2',
            defaultValue: '',
            type: 'string',
            fInputType: 'bool',
            fRequired: false,
            mask: '',
            colWidth: '25%',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
          }
        ]
      }
    });
    dialogRef.onClose.subscribe((res: Product) => {
      console.log("Selected item: ", res);
      if (!!res) {
        this.dbDataTable.FillCurrentlyEditedRow({ data: this.ProductToInvoiceLine(res) });
      }
    });
  }

  ChooseDataForForm(): void {
    console.log("Selecting Customer from avaiable data.");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(CustomerSelectTableDialogComponent, {
      context: {
        searchString: this.customerInputFilterString,
        allColumns: [
          'customerName', 'taxpayerNumber', 'postalCode', 'city', 'thirdStateTaxId'
        ],
        colDefs: [
          { label: 'Név', objectKey: 'customerName', colKey: 'customerName', defaultValue: '', type: 'string', fInputType: 'text', fRequired: true, mask: "", colWidth: "30%", textAlign: "left", navMatrixCssClass: TileCssClass },
          { label: 'Belföldi Adószám', objectKey: 'taxpayerNumber', colKey: 'taxpayerNumber', defaultValue: '', type: 'string', fInputType: 'text', mask: "0000000-0-00", colWidth: "40%", textAlign: "left", navMatrixCssClass: TileCssClass },
          { label: 'Irsz.', objectKey: 'postalCode', colKey: 'postalCode', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "25%", textAlign: "left", navMatrixCssClass: TileCssClass },
          { label: 'Város', objectKey: 'city', colKey: 'city', defaultValue: '', type: 'string', fInputType: 'text', fRequired: true, mask: "", colWidth: "25%", textAlign: "left", navMatrixCssClass: TileCssClass },
          { label: 'Külföldi Adószám', objectKey: 'thirdStateTaxId', colKey: 'thirdStateTaxId', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "25%", textAlign: "left", navMatrixCssClass: TileCssClass },
        ]
      }
    });
    dialogRef.onClose.subscribe((res: Customer) => {
      console.log("Selected item: ", res);
      if (!!res) {
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

    res.quantity = 0;

    res.lineNetAmount = 0;

    res.lineVatAmount = 0;
    res.vatRateCode = '';

    res.price = p.unitPrice1!;

    return res;
  }

  FillFormWithFirstAvailableCustomer(event: any): void {
    this.customerInputFilterString = event.target.value ?? '';
    this.isLoading = true;
    this.seC.GetAll({
      IsOwnData: false, PageNumber: '1', PageSize: '1', SearchString: this.customerInputFilterString
    } as GetCustomersParamListModel).subscribe({
      next: res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.buyerFormNav.FillForm(res.data[0], ['customerName']);
        } else {
          this.buyerFormNav.FillForm({}, ['customerName']);
          this.customerInputFilterString = '';
        }
      },
      error: (err) => {
        this.cs.HandleError(err); this.isLoading = false;
        this.customerInputFilterString = '';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == 'Enter') {
      this.Save();
    }
  }
}
