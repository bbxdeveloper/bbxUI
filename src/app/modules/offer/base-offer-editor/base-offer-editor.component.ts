import { ChangeDetectorRef, Component, Optional, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { NbTable, NbSortDirection, NbTreeGridDataSourceBuilder, NbToastrService, NbSortRequest } from '@nebular/theme';
import { Observable, of, startWith, map, Subscription, lastValueFrom, BehaviorSubject, firstValueFrom } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { NavigatableForm as InlineTableNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { CustomerService } from '../../customer/services/customer.service';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { ProductService } from '../../product/services/product.service';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { GetCustomerByTaxNumberParams } from '../../customer/models/GetCustomerByTaxNumberParams';
import { CountryCode } from '../../customer/models/CountryCode';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PrintAndDownloadService } from 'src/app/services/print-and-download.service';
import { CustomerSelectTableDialogComponent } from '../../invoice/customer-select-table-dialog/customer-select-table-dialog.component';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { TaxNumberSearchCustomerEditDialogComponent } from '../../invoice/tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { OfferLine } from '../models/OfferLine';
import { OfferService } from '../services/offer.service';
import { OneNumberInputDialogComponent } from '../../shared/simple-dialogs/one-number-input-dialog/one-number-input-dialog.component';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerDialogTableSettings } from 'src/assets/model/TableSettings';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';
import { Actions, GeneralFlatDesignKeySettings, GetFooterCommandListFromKeySettings, GetUpdatedKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';
import { CurrencyCode, CurrencyCodes } from '../../system/models/CurrencyCode';
import { SystemService } from '../../system/services/system.service';
import { SimpleDialogResponse } from 'src/assets/model/SimpleDialogResponse';
import { RadioChoiceDialogComponent } from '../../shared/simple-dialogs/radio-choice-dialog/radio-choice-dialog.component';
import { UnitPriceTypes } from '../../customer/models/UnitPriceType';
import { ProductCodeManagerServiceService } from 'src/app/services/product-code-manager-service.service';
import { InputFocusChangedEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { Product } from '../../product/models/Product';
import { GetVatRatesParamListModel } from '../../vat-rate/models/GetVatRatesParamListModel';
import { GetCustomerParamListModel } from '../../customer/models/GetCustomerParamListModel';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { ProductStockInformationDialogComponent } from '../../shared/dialogs/product-stock-information-dialog/product-stock-information-dialog.component';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { OfflineUnitOfMeasures } from '../../product/models/UnitOfMeasure';

@Component({
  selector: 'app-base-offer-editor',
  templateUrl: './base-offer-editor.component.html',
  styleUrls: ['./base-offer-editor.component.scss']
})
export class BaseOfferEditorComponent extends BaseInlineManagerComponent<OfferLine> implements IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  KeySetting: Constants.KeySettingsDct = GeneralFlatDesignKeySettings;

  protected offerData!: any;

  originalCustomerId: number = 0;

  protected Subscription_FillFormWithFirstAvailableCustomer?: Subscription;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  cachedCustomerName?: string;

  buyerData!: Customer;

  buyersData: Customer[] = [];

  filteredBuyerOptions$: Observable<string[]> = of([]);
  paymentMethodOptions$: Observable<string[]> = of([]);

  currencyCodes: string[] = [];
  currencyCodeValues: { [key: string]: CurrencyCode } = {};
  currencyCodeComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  customerChanged: boolean = false

  get SelectedCurrency(): CurrencyCode | undefined {
    return this.buyerForm.controls['currencyCode'].value !== undefined ?
      this.currencyCodeValues[this.buyerForm.controls['currencyCode'].value ?? -1] : undefined;
  }

  showExchangeRateInput: boolean = true;

  customerInputFilterString: string = '';

  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.buyerFormNav.GenerateAndSetNavMatrices(false, true);
  }

  formKeyRows: any = {
    "customerSearch": {
      Action: Actions.Create,
      Row: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner felvétele', KeyType: Constants.KeyTypes.Fn }
    }
  }

  override colsToIgnore: string[] = ["vatRateCode", "unitOfMeasureX", "UnitPriceVal", "exchangedOriginalUnitPrice", "UnitGrossVal"];
  override allColumns = [
    'productCode',
    'lineDescription',
    'UnitPriceSwitch',
    'quantity',
    'unitOfMeasureX',
    'exchangedOriginalUnitPrice',
    'discount',
    'showDiscount',
    'unitPrice',
    'UnitPriceVal',
    'vatRateCode',
    'UnitGrossVal',
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
      label: 'Megnevezés', objectKey: 'lineDescription', colKey: 'lineDescription',
      defaultValue: '', type: 'string', mask: "", //fReadonly: true,
      colWidth: "50%", textAlign: "left",
    },
    {
      label: 'Á.T.', objectKey: 'UnitPriceSwitch', colKey: 'UnitPriceSwitch',
      defaultValue: '', type: 'unitprice-checkbox', mask: "", checkboxFalse: "L", checkboxTrue: "E",
      colWidth: "40px", textAlign: "center", fInputType: 'unitprice-checkbox'
    },
    {
      label: 'Menny.', objectKey: 'quantity', colKey: 'quantity',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "100px", textAlign: "right", fInputType: 'formatted-number'
    },
    { // unitofmeasureX show, post unitofmeasureCode
      label: 'Me.e.', objectKey: 'unitOfMeasureX', colKey: 'unitOfMeasureX',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "80px", textAlign: "right"
    },
    {
      label: 'Nettó Ár', objectKey: 'exchangedOriginalUnitPrice', colKey: 'exchangedOriginalUnitPrice',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Kedv.', objectKey: 'discount', colKey: 'discount',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "90px", textAlign: "right", fInputType: 'param-padded-formatted-integer',
      calc: x => '1.2',
      checkIfReadonly: row => row.data.noDiscount,
      inputMask: this.offerDiscountInputMask,
      placeHolder: '0.00'
    },
    {
      label: 'Kd.', objectKey: 'showDiscount', colKey: 'showDiscount',
      defaultValue: '', type: 'checkbox', mask: "",
      colWidth: "40px", textAlign: "center", fInputType: 'checkbox',
      checkIfReadonly: row => row.data.noDiscount
    },
    {
      label: 'Kedv.ár', objectKey: 'unitPrice', colKey: 'unitPrice',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "170px", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Nettó ért.', objectKey: 'UnitPriceVal', colKey: 'UnitPriceVal',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "170px", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Áfa%', objectKey: 'vatRateCode', colKey: 'vatRateCode',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "70px", textAlign: "right", //fInputType: 'formatted-number'
    },
    {
      label: 'Bruttó ért.', objectKey: 'UnitGrossVal', colKey: 'UnitGrossVal',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number'
    }
  ]
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  buyerForm!: FormGroup;
  buyerFormId: string = "buyer-form";
  buyerFormNav!: InlineTableNavigatableForm;

  private tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  get offerIssueDateValue(): Date | undefined {
    if (!!!this.buyerForm) {
      return undefined;
    }
    const tmp = this.buyerForm.controls['offerIssueDate'].value;

    // console.log(tmp, new Date(tmp));

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get offerValidityDateValue(): Date | undefined {
    if (!!!this.buyerForm) {
      return undefined;
    }
    const tmp = this.buyerForm.controls['offerVaidityDate'].value;

    // console.log(tmp, new Date(tmp));

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  // CountryCode
  countryCodes: CountryCode[] = [];

  isOfferEditor: boolean = false

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    protected dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<OfferLine>>,
    protected seInv: InvoiceService,
    protected offerService: OfferService,
    protected seC: CustomerService,
    protected cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    protected bbxToastrService: BbxToastrService,
    protected simpleToastrService: NbToastrService,
    cs: CommonService,
    sts: StatusService,
    protected productService: ProductService,
    protected printAndDownLoadService: PrintAndDownloadService,
    router: Router,
    protected vatRateService: VatRateService,
    protected route: ActivatedRoute,
    protected sidebarService: BbxSidebarService,
    khs: KeyboardHelperService,
    protected custDiscountService: CustomerDiscountService,
    protected systemService: SystemService,
    protected productCodeManagerService: ProductCodeManagerServiceService
  ) {
    super(dialogService, kbS, fS, cs, sts, sidebarService, khs, router);
    this.route.url.subscribe(params => {
      this.path = params[0].path
    })
  }

  public inlineInputFocusChanged(event: InputFocusChangedEvent): void {
    this.dbData[event.RowPos].data.ReCalc(
      event.FieldDescriptor.objectKey === "unitPrice",
      this.SelectedCurrency?.value ?? CurrencyCodes.HUF,
      this.offerData.exchangeRate ?? 1
    );

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

  protected HideColumn(col: string): void {
    let index = this.allColumns.findIndex(x => x == col);
    if (index >= 0) {
      this.allColumns.splice(index, 1);

      index = this.colsToIgnore.findIndex(x => x == col)
      if (index >= 0) {
        this.colsToIgnore.splice(index, 1)
      }
    }
  }

  protected ShowColumn(col: string, ignored: boolean, position?: number): void {
    if (this.allColumns.includes(col)) {
      return;
    }
    if (position !== undefined) {
      this.allColumns.splice(position!, 0, col);
    } else {
      this.allColumns.push(col);
    }

    if (ignored) {
      this.colsToIgnore.push(col)
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

    if (this.isOfferEditor && this.customerChanged && formFieldName === 'customerSearch') {
      this.customerChanged = false
      this.SwitchUnitPriceAll()
    }
  }

  InitialSetup(): void {}

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

  validateOfferIssueDate(control: AbstractControl): any {
    if (!HelperFunctions.IsDateStringValid(control.value) || this.offerValidityDateValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) > this.offerValidityDateValue;
    return wrong ? { minDate: { value: control.value } } : null;
  }

  validateOfferValidityDate(control: AbstractControl): any {
    if (!HelperFunctions.IsDateStringValid(control.value) || this.offerIssueDateValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) < this.offerIssueDateValue;
    return wrong ? { minDate: { value: control.value } } : null;
  }

  InitFormDefaultValues(): void {
    this.buyerForm.controls['offerIssueDate'].setValue(HelperFunctions.GetDateString());
    this.buyerForm.controls['offerVaidityDate'].setValue(HelperFunctions.GetDateString(5));

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

  RecalcNetAndVat(): void {
    console.log("RecalcNetAndVat: ", this.dbData, this.dbData.filter(x => !x.data.IsUnfinished()), this.dbData[0].data.UnitPriceVal);

    if (!this.isOfferEditor) {
      this.offerData.offerNetAmount =
        HelperFunctions.Round(this.dbData.filter(x => !x.data.IsUnfinished())
          .map(x => HelperFunctions.ToFloat(x.data.UnitPriceVal))
          .reduce((sum, current) => sum + current, 0));

      this.offerData.offerGrossAmount =
        HelperFunctions.Round(this.dbData.filter(x => !x.data.IsUnfinished())
          .map(x => (HelperFunctions.ToFloat(x.data.UnitGrossVal)))
          .reduce((sum, current) => sum + current, 0));
    } else {
      this.offerData.offerNetAmount =
        HelperFunctions.ToInt(this.dbData.filter(x => !x.data.IsUnfinished())
          .map(x => this.ToFloat(x.data.UnitPrice) * HelperFunctions.ToFloat(x.data.quantity === 0 ? 1 : x.data.quantity))
          .reduce((sum, current) => sum + current, 0));

      this.offerData.offerGrossAmount =
        HelperFunctions.ToInt(this.dbData.filter(x => !x.data.IsUnfinished())
          .map(x => x.data.UnitGrossVal)
          .reduce((sum, current) => sum + current, 0));
    }

    console.log("RecalcNetAndVat after: ", this.offerData.offerNetAmount);

    if (this.offerData.currencyCode != CurrencyCodes.HUF) {
      this.offerData.offerNetAmount = HelperFunctions.Round2(this.offerData.offerNetAmount, 1);
      this.offerData.offerGrossAmount = HelperFunctions.Round2(this.offerData.offerGrossAmount, 1);
    }
  }

  HandleGridCodeFieldEnter(event: any, row: TreeGridNode<OfferLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!event) {
      this.bbxToastrService.close();
      event.stopPropagation();
    }
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

  protected RoundPrices(rowPos: number): void {
    if ((this.dbData.length + 1) <= rowPos) {
      return;
    }
    const d = this.dbData[rowPos]?.data;
  }

  private MoveNextFromCodeField(delayInMs: number = 200): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.dbDataTable.MoveNextInTable();
    setTimeout(() => {
      this.kbS.setEditMode(KeyboardModes.EDIT);
      this.kbS.ClickCurrentElement();
    }, delayInMs);
  }

  protected CreateLocalProduct(code: string): Product {
    const p = {
      id: 0,
      productCode: code,
      description: undefined,
      productGroup: undefined,
      origin: undefined,
      unitOfMeasure: OfflineUnitOfMeasures.PIECE.value,
      unitOfMeasureX: OfflineUnitOfMeasures.PIECE.text,
      unitPrice1: 0,
      unitPrice2: 0,
      latestSupplyPrice: 0,
      isStock: true,
      minStock: 0,
      ordUnit: 0,
      productFee: 0,
      active: true,
      vtsz: '',
      ean: '',
      vatRateCode: '27%',
      vatPercentage: 0.27,
      noDiscount: true
    } as Product
    return p
  }

  protected TableCodeFieldChanged(changedData: any, index: number, row: TreeGridNode<OfferLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!this.dbDataTable.data[rowPos].data.Changed('productCode', true)) {
      this.MoveNextFromCodeField()
      return
    }
    if (!!changedData && !!changedData.productCode && changedData.productCode.length > 0) {
      this.status.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
      this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: async product => {
          console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

          if (!!!product || HelperFunctions.isEmptyOrSpaces(product?.productCode)) {
            product = this.CreateLocalProduct(changedData.productCode)
            this.bbxToastrService.showError(Constants.MSG_NO_PRODUCT_FOUND);
          }

          if (row.data.productID === product.id) {
            this.status.pushProcessStatus(Constants.BlankProcessStatus);
            this.dbDataTable.MoveNextInTable();
            setTimeout(() => {
              this.kbS.setEditMode(KeyboardModes.EDIT);
              this.kbS.ClickCurrentElement();
            }, 500);
            return;
          }

          const unitPriceType = this.isOfferEditor ?
            (this.buyerData?.unitPriceType ?? UnitPriceTypes.Unit):
            undefined

          if (!product.noDiscount) {
            await lastValueFrom(this.custDiscountService.GetByCustomer({ CustomerID: this.buyerData?.id ?? -1 }))
              .then(data => {
                let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
                  data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate, unitPriceType)
                }, ['productCode']);
                currentRow?.data.Save('productCode');
                const _d = this.dbData[rowPos].data;
                this.dbData[rowPos].data.discount = data.find(x => _d.productGroup.split("-")[0] === x.productGroupCode)?.discount ?? 0;

                this.MoveNextFromCodeField()
              })
              .catch(err => {
                this.cs.HandleError(err);

                let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
                  data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate, unitPriceType)
                }, ['productCode']);
                currentRow?.data.Save('productCode');

                this.MoveNextFromCodeField(500)
              })
              .finally(() => {

              });
          } else {
            let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
              data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate, unitPriceType)
            }, ['productCode']);
            currentRow?.data.Save('productCode');

            const _d = this.dbData[rowPos].data;
            this.dbData[rowPos].data.discount = 0;

            this.MoveNextFromCodeField()
          }

          this.RecalcNetAndVat();
        },
        error: err => {
          this.dbDataTable.data[rowPos].data.Restore('productCode');
          this.RecalcNetAndVat();
          this.status.pushProcessStatus(Constants.BlankProcessStatus);
        },
        complete: () => {
          this.status.pushProcessStatus(Constants.BlankProcessStatus);
        }
      });
    }
  }

  protected async HandleProductChoose(product: Product, rowPos: number): Promise<void> {
    if (!product) {
      return
    }

    this.status.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);

    if (this.dbDataTable.data[rowPos].data.productID === product.id) {
      this.status.pushProcessStatus(Constants.BlankProcessStatus);
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
      this.dbDataTable.MoveNextInTable();
      setTimeout(() => {
        this.kbS.setEditMode(KeyboardModes.EDIT);
        this.kbS.ClickCurrentElement();
      }, 500);
      return;
    }

    const unitPriceType = this.isOfferEditor ?
      (this.buyerData?.unitPriceType ?? UnitPriceTypes.Unit) :
      undefined

    await lastValueFrom(this.vatRateService.GetAll({} as GetVatRatesParamListModel))
      .then(async d => {
        if (!d.data) {
          this.cs.HandleError(d.errors);

          let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
            data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate, unitPriceType)
          }, ['productCode']);
          currentRow?.data.Save('productCode');

          this.kbS.setEditMode(KeyboardModes.NAVIGATION);
          this.dbDataTable.MoveNextInTable();
          setTimeout(() => {
            this.kbS.setEditMode(KeyboardModes.EDIT);
            this.kbS.ClickCurrentElement();
          }, 500);
        }

        console.log('Vatrates: ', d.data);

        let vatRateFromProduct = d.data!.find(x => x.vatRateCode === product.vatRateCode);

        if (vatRateFromProduct === undefined) {
          this.bbxToastrService.showError(`Áfa a kiválasztott termékben található áfakódhoz (${product.vatRateCode}) nem található.`);
        }

        if (!product.noDiscount) {
          await lastValueFrom(this.custDiscountService.GetByCustomer({ CustomerID: this.buyerData?.id ?? -1 }))
            .then(data => {
              let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
                data: OfferLine.FromProduct(product, 0, vatRateFromProduct?.id ?? 0, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate, unitPriceType)
              }, ['productCode']);

              currentRow?.data.Save('productCode');

              const _d = this.dbData[rowPos].data;
              this.dbData[rowPos].data.discount = data.find(x => (_d.productGroup?.split("-")[0] ?? '') === x.productGroupCode)?.discount ?? 0;
              this.kbS.setEditMode(KeyboardModes.NAVIGATION);
              this.dbDataTable.MoveNextInTable();
              setTimeout(() => {
                this.kbS.setEditMode(KeyboardModes.EDIT);
                this.kbS.ClickCurrentElement();
              }, 500);
            })
            .catch(err => {
              this.cs.HandleError(err);

              let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
                data: OfferLine.FromProduct(
                  product, 0, vatRateFromProduct?.id ?? 0, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate, unitPriceType)
              }, ['productCode']);
              currentRow?.data.Save('productCode');

              this.kbS.setEditMode(KeyboardModes.NAVIGATION);
              this.dbDataTable.MoveNextInTable();
              setTimeout(() => {
                this.kbS.setEditMode(KeyboardModes.EDIT);
                this.kbS.ClickCurrentElement();
              }, 500);
            })
            .finally(() => { });
        } else {
          const currentRow = this.dbDataTable.FillCurrentlyEditedRow({
            data: OfferLine.FromProduct(product, 0, vatRateFromProduct?.id ?? 0, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate, unitPriceType)
          }, ['productCode']);
          currentRow?.data.Save('productCode');

          this.dbData[rowPos].data.showDiscount = false;
          this.dbData[rowPos].data.discount = 0;

          this.kbS.setEditMode(KeyboardModes.NAVIGATION);
          this.dbDataTable.MoveNextInTable();
          setTimeout(() => {
            this.kbS.setEditMode(KeyboardModes.EDIT);
            this.kbS.ClickCurrentElement();
          }, 500);
        }
      })
      .catch(err => {
        this.cs.HandleError(err);

        let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
          data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate, unitPriceType)
        }, ['productCode']);
        currentRow?.data.Save('productCode');

        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.dbDataTable.MoveNextInTable();
        setTimeout(() => {
          this.kbS.setEditMode(KeyboardModes.EDIT);
          this.kbS.ClickCurrentElement();
        }, 500);
      })
      .finally(() => { });

    this.status.pushProcessStatus(Constants.BlankProcessStatus);
  }


  TableRowDataChanged(changedData?: any, index?: number, col?: string): void {
    if (index !== undefined) {
      this.RoundPrices(index);
    }

    if (!changedData?.productCode) {
      return
    }

    if ((!!col && col === 'UnitPriceSwitch') || col === undefined) {
      this.RecalcNetAndVat()
    }

    if (col === 'discount') {
      changedData.Discount = Number(changedData.discount)
    }

    if ((!!col && col === 'productCode') || col === undefined) {
      this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: product => {
          console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

          if (index !== undefined) {
            let tmp = this.dbData[index].data;

            tmp.lineDescription = product.description ?? '';

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
  }

  async refresh(): Promise<void> {
    this.status.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);

    await this.refreshComboboxData();

    await lastValueFrom(this.seC.GetAll({ IsOwnData: false, OrderBy: 'customerName' }))
      .then(d => {
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

        this.table?.renderRows();
        this.RefreshTable();
      })
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => {});

    this.status.pushProcessStatus(Constants.BlankProcessStatus);
  }

  protected filterBuyers(value: string): string[] {
    if (this.isEditModeOff) {
      return [];
    }
    const filterValue = value.toLowerCase();
    return [""].concat(this.buyersData.map(x => x.customerName).filter(optionValue => optionValue.toLowerCase().includes(filterValue)));
  }

  protected AfterViewInitSetup(initForm: boolean = true): void {
    if (initForm) {
      this.InitFormDefaultValues();
    }

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
    }, 500);
  }

  Save(): void {}

  ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {}

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
        this.SetCustomerFormFields(res);

        this.kbS.SetCurrentNavigatable(this.buyerFormNav);
        this.kbS.SelectFirstTile();
        this.kbS.setEditMode(KeyboardModes.EDIT);

        if (this.isOfferEditor) {
          this.customerChanged = true
        }
      }
    });
  }

  RefreshData(): void { }

  IsNumber(val: string): boolean {
    let val2 = val.replace(' ', '');
    return !isNaN(parseFloat(val2));
  }

  protected SetCustomerFormFields(data?: Customer) {
    console.log('SetCustomerFormFields: ', data);
    if (data === undefined) {
      this.buyerForm.controls['customerName'].setValue(undefined);
      this.buyerForm.controls['customerAddress'].setValue(undefined);
      this.buyerForm.controls['customerTaxNumber'].setValue(undefined);
      return;
    }
    this.buyerForm.controls['customerName'].setValue(data.customerName);
    let address = "";
    if (data.postalCode !== undefined && data.city !== undefined && data.postalCode !== null && data.city !== null) {
      address = data.postalCode + ', ' + data.city;
    } else if (data.postalCode !== undefined && data.postalCode !== null) {
      address = data.postalCode;
    } else if (data.city !== undefined && data.city !== null) {
      address = data.city;
    }
    this.buyerForm.controls['customerAddress'].setValue(address);
    this.buyerForm.controls['customerTaxNumber'].setValue(data.taxpayerNumber);
  }

  FillFormWithFirstAvailableCustomer(event: any): void {
    if (!!this.Subscription_FillFormWithFirstAvailableCustomer && !this.Subscription_FillFormWithFirstAvailableCustomer.closed) {
      this.Subscription_FillFormWithFirstAvailableCustomer.unsubscribe();
    }

    this.customerInputFilterString = event.target.value ?? '';

    if (this.customerInputFilterString.replace(' ', '') === '') {
      if (!this.isOfferEditor) {
        this.buyerData = { id: -1 } as Customer;
        this.SetCustomerFormFields(undefined);
        return;
      }
      // Szerkesztés esetén visszatöltjük az eredeti customert
      this.isLoading = true;
      this.Subscription_FillFormWithFirstAvailableCustomer = this.seC.Get({ ID: this.originalCustomerId } as GetCustomerParamListModel).subscribe({
        next: res => {
          if (!!res) {
            this.buyerData = res;
            this.buyerForm.controls['customerName'].setValue(res.customerName);
            this.buyerForm.controls['customerAddress'].setValue(res.postalCode + ', ' + res.city);
            this.buyerForm.controls['customerTaxNumber'].setValue(res.taxpayerNumber);
          } else {
            this.bbxToastrService.show(
              `A szerkesztésre betöltött ajánlatban található ügyfélazonosítóhoz (${this.buyerData.id}) nem található ügyfél.`,
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
          }
        },
        error: (err) => {
          this.cs.HandleError(err, `Hiba a ${this.buyerData.id} azonosítóval rendelkező ügyfél betöltése közben:\n`);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = true;
      this.Subscription_FillFormWithFirstAvailableCustomer = this.seC.GetAll({
        IsOwnData: false, PageNumber: '1', PageSize: '1', SearchString: this.customerInputFilterString, OrderBy: 'customerName'
      } as GetCustomersParamListModel).subscribe({
        next: res => {
          if (!!res && res.data !== undefined && res.data.length > 0) {
            this.buyerData = res.data[0];
            this.cachedCustomerName = res.data[0].customerName;
            this.SetCustomerFormFields(res.data[0]);
            this.searchByTaxtNumber = false;
            // Csak szerkesztés esetén van eredeti customer
            if (this.isOfferEditor) {
              this.customerChanged = true
            }
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
  }

  protected async PrepareCustomer(data: Customer): Promise<Customer> {
    console.log('Before: ', data);

    data.customerBankAccountNumber = data.customerBankAccountNumber ?? '';
    data.taxpayerNumber = `${data.taxpayerId}-${data.vatCode ?? ''}-${data.countyCode ?? ''}`

    const countryCodes = await lastValueFrom(this.seC.GetAllCountryCodes());

    if (!!countryCodes && countryCodes.length > 0 && data.countryCode !== undefined && this.countryCodes.length > 0) {
      data.countryCode = this.countryCodes.find(x => x.value == data.countryCode)?.text ?? '';
    }

    return data;
  }

  override SetDataForForm(data: any): void {
    if (!!data) {
      this.buyerData = data as Customer;
      this.buyerForm.controls['customerName'].setValue(data.customerName);
      this.SetCustomerFormFields(data);

      this.kbS.SetCurrentNavigatable(this.buyerFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);
    }
  }

  ChoseDataForFormByTaxtNumber(): void {
    console.log("Selecting Customer from avaiable data by taxtnumber.");

    this.isLoading = true;

    this.seC.GetByTaxNumber({ Taxnumber: this.customerInputFilterString } as GetCustomerByTaxNumberParams).subscribe({
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
              if (!!res) {
                this.SetDataForForm(res);
              }
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

  protected ExitToNav(): void {
    this.router.navigate(['product/offers-nav']);
  }

  protected NavToCreate(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['product/offers-create'], {
        queryParams: {
          reload: true
        }
      })
    })
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
        defaultValue: 0
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

  JumpToFirstCellAndNav(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.kbS.SetCurrentNavigatable(this.dbDataTable);
    this.kbS.SelectElementByCoordinate(0, 0);
    setTimeout(() => {
      this.kbS.ClickCurrentElement();
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }, 100);
  }

  ConverNumbers(): void {
    this.dbData.forEach(x => {
      x.data.quantity = HelperFunctions.ToFloat(x.data.quantity)
    })
  }

  CheckSaveConditionsAndSave(): void {
    this.buyerForm.markAllAsTouched();

    this.ConverNumbers()

    if (this.buyerForm.invalid) {
      this.bbxToastrService.show(
        `Az űrlap hibásan vagy hiányosan van kitöltve.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    }

    if (this.dbData.find(x => !x.data.IsUnfinished()) === undefined) {
      this.bbxToastrService.show(
        `Legalább egy érvényesen megadott tétel szükséges a mentéshez.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    }

    var t = this.dbData.find(x => x.data.id !== -1 && (x.data.quantity === undefined || x.data.quantity <= 0))
    if (t !== undefined) {
      this.bbxToastrService.show(
        `Minden tételnek pozitív mennyiséggel kell rendelkeznie.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    }

    this.Save();
  }

  private async refreshComboboxData(setIsLoad = false): Promise<void> {
    await lastValueFrom(this.systemService.GetAllCurrencyCodes())
      .then(data => {
        console.log("[refreshComboboxData] GetAllCurrencyCodes: ", data);

        this.currencyCodes =
          data?.map(x => {
            let res = x.text;
            this.currencyCodeValues[res] = x;
            return x.text;
          }) ?? [];

        this.currencyCodes =
          data?.map(x => x.text) ?? [];
        this.currencyCodeComboData$.next(this.currencyCodes);
        if (this.currencyCodes.length > 0) {
          this.buyerForm.controls['currencyCode'].setValue(this.currencyCodes[0]);
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => {});
  }

  protected SwitchUnitPriceAll(): void {
    const defaultValue = (this.buyerData?.unitPriceType ?? UnitPriceTypes.Unit) === UnitPriceTypes.Unit ? 'E' : 'L'

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    const dialogRef = this.dialogService.open(RadioChoiceDialogComponent, {
      context: {
        title: 'Á.T. összes sorra',
        defaultValue: defaultValue,
        optionLabel1: 'Listaár',
        optionValue1: 'L',
        optionLabel2: 'Egységár',
        optionValue2: 'E'
      },
      closeOnEsc: false
    });
    dialogRef.onClose.subscribe({
      next: (res: SimpleDialogResponse) => {
        if (res.value !== undefined) {
          this.dbData.forEach(x => {
            x.data.UnitPriceSwitch = res.value == 'E';
          })
        }
      }
    });
  }

  protected async openProductStockInformationDialog(id: any): Promise<void> {
    this.status.waitForLoad(true)

    const product = await firstValueFrom(this.productService.Get({ ID: id }))

    this.status.waitForLoad(false)

    this.dialogService.open(ProductStockInformationDialogComponent, {
      context: {
        product: product
      }
    })
  }
}
