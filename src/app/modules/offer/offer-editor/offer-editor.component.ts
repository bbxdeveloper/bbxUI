import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NbTable, NbSortDirection, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService, NbSortRequest } from '@nebular/theme';
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
import { todaysDate } from 'src/assets/model/Validators';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { ProductService } from '../../product/services/product.service';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { GetCustomerByTaxNumberParams } from '../../customer/models/GetCustomerByTaxNumberParams';
import { CountryCode } from '../../customer/models/CountryCode';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { UtilityService } from 'src/app/services/utility.service';
import { CustomerSelectTableDialogComponent } from '../../invoice/customer-select-table-dialog/customer-select-table-dialog.component';
import { InvoiceLine } from '../../invoice/models/InvoiceLine';
import { PaymentMethod } from '../../invoice/models/PaymentMethod';
import { ProductSelectTableDialogComponent } from '../../invoice/product-select-table-dialog/product-select-table-dialog.component';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { TaxNumberSearchCustomerEditDialogComponent } from '../../invoice/tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { OfferLine, OfferLineFullData } from '../models/OfferLine';
import { OfferService } from '../services/offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GetOfferParamsModel } from '../models/GetOfferParamsModel';
import { Offer } from '../models/Offer';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { OfferUpdateDialogComponent } from '../offer-update-dialog/offer-update-dialog.component';
import { Actions, GetFooterCommandListFromKeySettings, KeyBindings, OfferEditorKeySettings, OfferNavKeySettings } from 'src/assets/util/KeyBindings';
import { OneNumberInputDialogComponent } from '../../shared/one-number-input-dialog/one-number-input-dialog.component';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-offer-editor',
  templateUrl: './offer-editor.component.html',
  styleUrls: ['./offer-editor.component.scss']
})
export class OfferEditorComponent extends BaseInlineManagerComponent<OfferLine> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['bold', 'italic'],
      ['fontSize']
    ]
  };


  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  cachedCustomerName?: string;

  buyerData!: Customer;

  buyersData: Customer[] = [];
  paymentMethods: PaymentMethod[] = [];

  offerData!: Offer;

  filteredBuyerOptions$: Observable<string[]> = of([]);
  paymentMethodOptions$: Observable<string[]> = of([]);

  customerInputFilterString: string = '';

  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.buyerFormNav.GenerateAndSetNavMatrices(false, true);
  }

  override colsToIgnore: string[] = ["vatRateCode", "unitGross", "unitOfMeasureX", "originalUnitPrice", "vatRateCode", "unitGross"];
  override allColumns = [
    'productCode',
    'lineDescription',
    'unitOfMeasureX',
    'originalUnitPrice',
    'Discount',
    'showDiscount',
    'UnitPrice',
    'vatRateCode',
    'unitGross'
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Termékkód', objectKey: 'productCode', colKey: 'productCode',
      defaultValue: '', type: 'string', mask: "AAA-ACCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
      colWidth: "30%", textAlign: "left", fInputType: 'code-field'
    },
    {
      label: 'Megnevezés', objectKey: 'lineDescription', colKey: 'lineDescription',
      defaultValue: '', type: 'string', mask: "", //fReadonly: true,
      colWidth: "70%", textAlign: "left",
    },
    { // unitofmeasureX show, post unitofmeasureCode
      label: 'Me.e.', objectKey: 'unitOfMeasureX', colKey: 'unitOfMeasureX',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "5%", textAlign: "right"
    },
    {
      label: 'Nettó Ár', objectKey: 'originalUnitPrice', colKey: 'originalUnitPrice',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Kedv.', objectKey: 'Discount', colKey: 'Discount',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "16%", textAlign: "right", fInputType: 'param-padded-formatted-integer',
      calc: x => '1.2',
      inputMask: this.offerDiscountInputMask,
      placeHolder: '0.00'
    },
    {
      label: 'Kedv. Mut.', objectKey: 'showDiscount', colKey: 'showDiscount',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "130px", textAlign: "center", fInputType: 'checkbox'
    },
    {
      label: 'Nettó árlista ár', objectKey: 'UnitPrice', colKey: 'UnitPrice',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "12%", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Áfakód', objectKey: 'vatRateCode', colKey: 'vatRateCode',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "12%", textAlign: "right", //fInputType: 'formatted-number'
    },
    {
      label: 'Bruttó', objectKey: 'unitGross', colKey: 'unitGross',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "12%", textAlign: "right", fInputType: 'formatted-number'
    }
  ]
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  public KeySetting: Constants.KeySettingsDct = OfferEditorKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  buyerForm!: FormGroup;
  buyerFormId: string = "buyer-form";
  buyerFormNav!: InlineTableNavigatableForm;

  private tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  get offerIssueDateValue(): Date | undefined {
    if (!!!this.buyerForm) {
      return undefined;
    }
    const tmp = this.buyerForm.controls['offerIssueDate'].value;

    // console.log(tmp, new Date(tmp));

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }

  get offerValidityDateValue(): Date | undefined {
    if (!!!this.buyerForm) {
      return undefined;
    }
    const tmp = this.buyerForm.controls['offerVaidityDate'].value;

    // console.log(tmp, new Date(tmp));

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }

  // CountryCode
  countryCodes: CountryCode[] = [];

  idFromPath?: number;

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<OfferLine>>,
    private seInv: InvoiceService,
    private offerService: OfferService,
    private seC: CustomerService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: NbToastrService,
    cs: CommonService,
    sts: StatusService,
    private productService: ProductService,
    private utS: UtilityService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    super(dialogService, kbS, fS, cs, sts);
    this.InitialSetup();
  }

  private Reset(): void {
    console.log(`Reset.`);
    this.kbS.ResetToRoot();
    this.InitialSetup();
    this.AfterViewInitSetup();
  }

  private InitialSetup(): void {
    this.dbDataTableId = "offers-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    // Init form and table content - empty
    this.buyerData = {} as Customer;

    this.offerData = {
      id: 0,
      offerNumber: '',
      customerName: '',
      customerBankAccountNumber: '',
      customerTaxpayerNumber: '',
      customerCountryCode: '',
      customerPostalCode: '',
      customerCity: '',
      customerAdditionalAddressDetail: '',
      offerNumberX: '',
      CustomerComment: '',
      offerVersion : -1,
      latestVersion: true,
      customerID: -1,
      offerIssueDate: '',
      offerVaidityDate: '',
      copies: 0,
      deleted: false,
      notice: '',
      newOffer: false,
      offerLines: [],
    } as Offer;

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    if (this.buyerForm === undefined) {
      this.buyerForm = new FormGroup({
        customerSearch: new FormControl('', []),
        customerName: new FormControl('', [Validators.required]),
        customerAddress: new FormControl('', [Validators.required]),
        customerTaxNumber: new FormControl('', [Validators.required]),
        offerIssueDate: new FormControl('', [Validators.required, todaysDate]),
        offerVaidityDate: new FormControl('', [Validators.required, (this.validateInvoiceDeliveryDate.bind(this))]),
        notice: new FormControl('', []),
        offerNumberX: new FormControl('', []),
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
        return new OfferLine();
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
    if (this.offerIssueDateValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) < this.offerIssueDateValue;
    return wrong ? { minDate: { value: control.value } } : null;
  }

  // paymentDate
  validatePaymentDateMinMax(control: AbstractControl): any {
    if (this.offerIssueDateValue === undefined || this.offerValidityDateValue === undefined) {
      return null;
    }
    const _date = new Date(control.value);
    const wrong = _date < this.offerIssueDateValue || _date > this.offerValidityDateValue;
    return wrong ? { minMaxDate: { value: control.value } } : null;
  }

  InitFormDefaultValues(): void {
    this.buyerForm.controls['offerIssueDate'].setValue(HelperFunctions.GetDateString());
    this.buyerForm.controls['offerVaidityDate'].setValue(HelperFunctions.GetDateString(0, 1));

    this.buyerForm.controls['offerIssueDate'].valueChanges.subscribe({
      next: p => {
        this.buyerForm.controls['offerVaidityDate'].setValue(this.buyerForm.controls['offerVaidityDate'].value);
        this.buyerForm.controls['offerVaidityDate'].markAsTouched();
      }
    });
  }

  ToFloat(p: any): number {
    return p !== undefined || p === '' || p === ' ' ? parseFloat((p + '').replace(' ', '')) : 0;
  }

  RecalcNetAndVat(): void { }

  HandleGridCodeFieldEnter(row: TreeGridNode<OfferLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    console.log('[HandleGridCodeFieldEnter]: editmode off: ', this.isEditModeOff);
    if (this.isEditModeOff) {
      this.dbDataTable.HandleGridEnter(row, rowPos, objectKey, colPos, inputId, fInputType);
      setTimeout(() => {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.kbS.ClickCurrentElement();
      }, 50);
    } else {
      this.TableCodeFieldChanged(row.data, rowPos, row, rowPos, objectKey, colPos, inputId, fInputType);
    }
  }

  private TableCodeFieldChanged(changedData: any, index: number, row: TreeGridNode<OfferLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!changedData && !!changedData.productCode && changedData.productCode.length > 0) {
      this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: product => {
          console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

          if (!!product) {
            this.dbDataTable.FillCurrentlyEditedRow({ data: OfferLine.FromProduct(product) });
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            this.dbDataTable.MoveNextInTable();
            setTimeout(() => {
              this.kbS.setEditMode(KeyboardModes.EDIT);
              this.kbS.ClickCurrentElement();
            }, 200);
          } else {
            this.toastrService.show(
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
    console.log('[TableRowDataChanged]');

    if (!!changedData && !!changedData.productCode) {
      if ((!!col && col === 'productCode') || col === undefined) {
        this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
          next: product => {
            console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

            if (index !== undefined) {
              let tmp = this.dbData[index].data;

              tmp.lineDescription = product.description ?? '';

              // let discount = tmp.discount === 0 ? 1.0 : tmp.discount / 100.0;
              // tmp.unitPrice += tmp.unitPrice * discount;

              tmp.vatRate = product.vatPercentage ?? 0.0;
              tmp.OriginalUnitPrice = (product.unitPrice1 ?? product.unitPrice2 ?? 0);
              tmp.unitVat = tmp.vatRate * tmp.unitPrice;
              product.vatRateCode = product.vatRateCode === null || product.vatRateCode === undefined || product.vatRateCode === '' ? '27%' : product.vatRateCode;
              tmp.vatRateCode = product.vatRateCode;

              this.dbData[index].data = tmp;

              this.dbDataDataSrc.setData(this.dbData);
            }

            this.RecalcNetAndVat();
          },
          error: err => {
            this.RecalcNetAndVat();
          }
        });
      } 
      // else {
      //   if (index !== undefined) {
      //     let tmp = this.dbData[index].data;

      //     // let discount = tmp.discount === 0 ? 1.0 : tmp.discount / 100.0;
      //     // tmp.unitPrice += tmp.unitPrice * discount;

      //     tmp.lineNetAmount = this.ToFloat(tmp.unitPrice) * this.ToFloat(tmp.quantity);
      //     tmp.vatRate = this.ToFloat(tmp.lineNetAmount) * this.ToFloat(tmp.unitVat);
      //     tmp.unitGross = this.ToFloat(tmp.vatRate) + this.ToFloat(tmp.lineNetAmount);

      //     this.dbData[index].data = tmp;

      //     this.dbDataDataSrc.setData(this.dbData);
      //   }

      //   this.RecalcNetAndVat();
      // }
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

        this.seInv.GetPaymentMethods().subscribe({
          next: d => {
            this.paymentMethods = d;
            console.log('[GetPaymentMethods]: ', d);
            this.paymentMethodOptions$ = of(d.map(d => d.text));
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

        this.seC.GetAll({ IsOwnData: true }).subscribe({
          next: d => {
            console.log('Exporter: ', d);

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

  private LoadAndSetDataForEdit(): void {
    this.idFromPath = parseInt(this.route.snapshot.params['id'], 10);
    console.log("ID for edit: ", this.idFromPath);

    this.isLoading = true;

    this.offerService.Get({
      ID: this.idFromPath, FullData: true
    } as GetOfferParamsModel).subscribe({
      next: res => {
        if (!!res) {
          this.buyerForm.controls['customerName'].setValue(res.customerName);
          this.buyerForm.controls['customerAddress'].setValue(res.customerPostalCode + ', ' + res.customerCity);
          this.buyerForm.controls['customerTaxNumber'].setValue(res.customerTaxpayerNumber);
          this.buyerForm.controls['offerIssueDate'].setValue(res.offerIssueDate);
          this.buyerForm.controls['offerVaidityDate'].setValue(res.offerVaidityDate);
          this.buyerForm.controls['notice'].setValue(res.notice);
          this.buyerForm.controls['offerNumberX'].setValue(res.offerNumberX);

          this.offerData = res;

          this.buyerData.id = this.offerData.customerID;
          // this.seC.Get({ ID: this.buyerData.id } as GetCustomerParamListModel).subscribe({
          //   next: res => {
          //     if (!!res) {
          //       this.buyerData = res;
          //     }
          //   },
          //   error: (err) => {
          //     this.cs.HandleError(err, `Hiba a ${this.buyerData.id} azonosítóval rendelkező ügyfél betöltése közben:\n`);
          //   },
          //   complete: () => {
          //     this.isLoading = false;
          //   }
          // });

          this.dbData = this.offerData.offerLines!.map(x =>
            { return { data: OfferLine.FromOfferLineFullData(x) } as TreeGridNode<OfferLine> }
          ).concat(this.dbData);

          this.table?.renderRows();
        }
      },
      error: (err) => {
        this.cs.HandleError(err);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnInit(): void {
    this.LoadAndSetDataForEdit();
    
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.AfterViewInitSetup();
  }
  private AfterViewInitSetup(): void {
    this.InitFormDefaultValues();

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.buyerFormNav.GenerateAndSetNavMatrices(true);

    this.dbDataTable?.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore,
      'PRODUCT'
    );
    this.dbDataTable?.GenerateAndSetNavMatrices(true);
    this.dbDataTable!.commandsOnTable = this.commands;
    this.dbDataTable!.commandsOnTableEditMode = this.commands;
    this.dbDataTable?.PushFooterCommandList();

    setTimeout(() => {
      this.kbS.SetCurrentNavigatable(this.buyerFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);

      this.cdref.detectChanges();
    }, 300);
  }
  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();
  }

  private UpdateSaveData(): void {
    this.offerData.customerID = this.buyerData.id;

    this.offerData.notice = this.buyerForm.controls['notice'].value;

    this.offerData.offerIssueDate =
      HelperFunctions.FormFieldStringToDateTimeString(this.buyerForm.controls['offerIssueDate'].value);
    this.offerData.offerVaidityDate =
      HelperFunctions.FormFieldStringToDateTimeString(this.buyerForm.controls['offerVaidityDate'].value);

    // this.offerData.invoiceNetAmount = 0;
    // this.offerData.invoiceVatAmount = 0;

    this.offerData.offerLines = this.dbData.filter(x => !x.data.IsUnfinished()).map(x => 
      x.data as OfferLineFullData
    );

    // this.RecalcNetAndVat();

    for (let i = 0; i < this.offerData.offerLines.length; i++) {
      this.offerData.offerLines[i].unitPrice = HelperFunctions.ToFloat(this.offerData.offerLines[i].unitPrice);
      this.offerData.offerLines[i].lineNumber = HelperFunctions.ToInt(i + 1);
    }

    // console.log('[UpdateOutGoingData]: ', this.offerData, this.outInvForm.controls['paymentMethod'].value);
  }

  printReport(id: any, copies: number): void {
    this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_CMD]);
    this.utS.execute(
      Constants.CommandType.PRINT_OFFER, Constants.FileExtensions.PDF,
      {
        "section": "Szamla",
        "fileType": "pdf",
        "report_params":
        {
          "id": id,
          "offerNumber": null
        },
        // "copies": copies,
        "data_operation": Constants.DataOperation.PRINT_BLOB
      } as Constants.Dct);
  }

  PrepareSave(): void {
    if (this.buyerForm.invalid) {
      this.toastrService.show(
        `Az űrlap hibásan vagy hiányosan van kitöltve.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    }
    if (this.dbData.find(x => !x.data.IsUnfinished()) === undefined) {
      this.toastrService.show(
        `Legalább egy érvényesen megadott tétel szükséges a mentéshez.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    }

    const confirmDialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_SAVE_DATA } });
    confirmDialogRef.onClose.subscribe(res => {
      if (res) {
        setTimeout(() => {
          this.Save();
        }, 100);
      }
    });
  }

  private Save(): void {
    this.UpdateSaveData();

    console.log('Save: ', this.offerData);

    this.isLoading = true;
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(OfferUpdateDialogComponent, {
      context: {}
    });
    dialogRef.onClose.subscribe((selectedSaveOption: number) => {
      console.log("Selected option: ", selectedSaveOption);
      if (selectedSaveOption !== undefined && selectedSaveOption >= 1 && selectedSaveOption <= 3) {

        if (selectedSaveOption === 2) {
          this.offerData.offerVersion += 1;
        }
        else if (selectedSaveOption === 3) {
          this.offerData.offerVersion += 1;
          this.offerData.newOffer = true;
        }

        this.offerService.Update(this.offerData).subscribe({
          next: d => {
            if (!!d.data) {
              console.log('Save response: ', d);

              this.toastrService.show(
                Constants.MSG_SAVE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS
              );

              this.router.navigate(['product/offers-nav']);
            } else {
              this.cs.HandleError(d.errors);
              this.isLoading = false;
            }
          },
          error: err => {
            this.cs.HandleError(err);
            this.isLoading = false;
            if (selectedSaveOption > 1) {
              this.offerData.offerVersion -= 1;
              this.offerData.newOffer = false;
            }
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  ChooseDataForTableRow(rowIndex: number): void {
    console.log("Selecting InvoiceLine from avaiable data.");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.dbDataTable.editedRow?.data.productCode ?? '',
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
        this.dbDataTable.FillCurrentlyEditedRow({ data: OfferLine.FromProduct(res) });
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.dbDataTable.MoveNextInTable();
        setTimeout(() => {
          this.kbS.setEditMode(KeyboardModes.EDIT);
          this.kbS.ClickCurrentElement();
        }, 500);
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
        this.buyerData = res;
        this.buyerFormNav.FillForm(res);

        this.kbS.SetCurrentNavigatable(this.buyerFormNav);
        this.kbS.SelectFirstTile();
        this.kbS.setEditMode(KeyboardModes.EDIT);
      }
    });
  }

  RefreshData(): void { }

  IsNumber(val: string): boolean {
    let val2 = val.replace(' ', '');
    return !isNaN(parseFloat(val2));
  }

  private SetCustomerFormFields(data?: Customer) {
    if (data === undefined) {
      this.buyerForm.controls['customerName'].setValue(undefined);
      this.buyerForm.controls['customerAddress'].setValue(undefined);
      this.buyerForm.controls['customerTaxNumber'].setValue(undefined);
      return;
    }
    this.buyerForm.controls['customerName'].setValue(data.customerName);
    this.buyerForm.controls['customerAddress'].setValue(data.postalCode + ', ' + data.city);
    this.buyerForm.controls['customerTaxNumber'].setValue(data.taxpayerNumber);
  }

  FillFormWithFirstAvailableCustomer(event: any): void {
    this.customerInputFilterString = event.target.value ?? '';
    this.isLoading = true;
    this.seC.GetAll({
      IsOwnData: false, PageNumber: '1', PageSize: '1', SearchString: this.customerInputFilterString
    } as GetCustomersParamListModel).subscribe({
      next: res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.buyerData = res.data[0];
          this.cachedCustomerName = res.data[0].customerName;
          this.SetCustomerFormFields(res.data[0]);
          this.searchByTaxtNumber = false;
        } else {
          if (this.customerInputFilterString.length >= 8 &&
            this.IsNumber(this.customerInputFilterString)) {
            this.searchByTaxtNumber = true;
          } else {
            this.searchByTaxtNumber = false;
          }
          this.SetCustomerFormFields(undefined);
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
              if (!!res) {
                this.buyerData = res;
                this.buyerForm.controls['customerName'].setValue(res.customerName);

                this.kbS.SetCurrentNavigatable(this.buyerFormNav);
                this.kbS.SelectFirstTile();
                this.kbS.setEditMode(KeyboardModes.EDIT);
              }
            },
            error: err => {
              this.cs.HandleError(err);
            }
          });
        } else {
          this.toastrService.show(res.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
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
    if (event.ctrlKey && event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      this.PrepareSave();
      return;
    }
    switch(event.key) {
      case this.KeySetting[Actions.ToggleAllDiscounts].KeyCode: {
        event.preventDefault();
        this.ToggleAllShowDiscount();
        break;
      }
      case this.KeySetting[Actions.SetGlobalDiscount].KeyCode: {
        event.preventDefault();
        this.SetGlobalDiscount();
        break;
      }
    }
  }

  ToggleAllShowDiscount(): void {
    if (this.dbData.length === 0) {
      return;
    }
    const newVal = !this.dbData[0].data.showDiscount;
    this.dbData.forEach(x => {
      x.data.showDiscount = newVal;
    })
  }

  SetGlobalDiscount(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    const dialogRef = this.dialogService.open(OneNumberInputDialogComponent, {
      context: {
        title: 'Kedvezmény megadása összes sorra',
        inputLabel: 'Kedvezmény %',
        numberInputMask: this.offerDiscountInputMask,
        placeHolder: '0.00'
      }
    });
    dialogRef.onClose.subscribe({
      next: res => {
        if (res.answer) {
          this.dbData.forEach(x => {
            x.data.Discount = HelperFunctions.ToFloat(res.value);
          })
        }
      }
    });
  }

  JumpToFirstCellAndEdit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.kbS.SetCurrentNavigatable(this.dbDataTable);
    this.kbS.SelectElementByCoordinate(0, 0);
    setTimeout(() => {
      this.kbS.ClickCurrentElement();
    }, 100);
  }
}
