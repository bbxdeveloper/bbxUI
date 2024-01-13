import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbSortDirection, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
import { of, BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { NavigatableForm as InlineTableNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { OutGoingInvoiceFullData } from '../models/CreateOutgoingInvoiceRequest';
import { InvoiceLine } from '../models/InvoiceLine';
import { PaymentMethod } from '../models/PaymentMethod';
import { InvoiceService } from '../services/invoice.service';
import { ProductService } from '../../product/services/product.service';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { GetFooterCommandListFromKeySettings, GetUpdatedKeySettings } from 'src/assets/util/KeyBindings';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InputFocusChangedEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { InvoiceBehaviorMode } from '../models/InvoiceBehaviorMode';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { CodeFieldChangeRequest, ProductCodeManagerServiceService } from 'src/app/services/product-code-manager-service.service';
import { PrintAndDownloadService } from 'src/app/services/print-and-download.service';
import { ProductStockInformationDialogComponent } from '../../shared/dialogs/product-stock-information-dialog/product-stock-information-dialog.component';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { LoadInvoiceLinesDialogComponent } from '../load-invoice-lines-dialog/load-invoice-lines-dialog.component';
import { CustDiscountForGet } from '../../customer-discount/models/CustDiscount';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';

@Component({
  selector: 'app-base-invoice-manager',
  template: '',
  styleUrls: []
})
export class BaseInvoiceManagerComponent extends BaseInlineManagerComponent<InvoiceLine> {
  isPageReady = false;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  senderData: Customer|undefined
  customerData!: Customer;

  protected customerDiscounts: CustDiscountForGet[] = []

  buyersData: Customer[] = [];

  paymentMethods: PaymentMethod[] = [];
  _paymentMethods: string[] = [];
  paymentMethodOptions$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  outGoingInvoiceData!: OutGoingInvoiceFullData;

  outInvForm!: FormGroup;
  outInvFormId: string = "";
  outInvFormNav!: InlineTableNavigatableForm;

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  public mode!: InvoiceBehaviorMode

  protected tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  get editDisabled() {
    return !this.kbS.isEditModeActivated && !this.isLoading && !this.isSaveInProgress;
  }

  get navigationEnabled() {
    return this.kbS.isNavigationModeActivated && !this.isLoading && !this.isSaveInProgress;
  }

  public KeySetting!: Constants.KeySettingsDct
  override commands: FooterCommandInfo[] = [];

  confirmAndCreateProductCallback?: any

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    footerService: FooterService,
    protected readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvoiceLine>>,
    protected readonly invoiceService: InvoiceService,
    protected readonly customerService: CustomerService,
    protected readonly cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    protected readonly simpleToastrService: NbToastrService,
    protected readonly bbxToastrService: BbxToastrService,
    cs: CommonService,
    protected readonly productService: ProductService,
    status: StatusService,
    sideBarService: BbxSidebarService,
    khs: KeyboardHelperService,
    protected readonly activatedRoute: ActivatedRoute,
    router: Router,
    protected readonly tokenService: TokenStorageService,
    protected productCodeManagerService: ProductCodeManagerServiceService,
    protected printAndDownLoadService: PrintAndDownloadService,
    @Optional() protected readonly customerDiscountService: CustomerDiscountService|null,
  ) {
    super(dialogService, kbS, footerService, cs, status, sideBarService, khs, router);
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

  RecalcNetAndVat(): void {
    this.outGoingInvoiceData.invoiceLines = this.dbData.filter(x => !x.data.IsUnfinished()).map(x => x.data);

    this.outGoingInvoiceData.invoiceNetAmount =
      this.outGoingInvoiceData.invoiceLines
        .map(x => HelperFunctions.ToFloat(x.lineNetAmount))
        .reduce((sum, current) => sum + current, 0);

    this.outGoingInvoiceData.invoiceVatAmount =
      this.outGoingInvoiceData.invoiceLines
        .map(x => HelperFunctions.ToFloat(x.lineVatAmount))
        .reduce((sum, current) => sum + current, 0);

    let _paymentMethod = this.mode.Delivery ? this.DeliveryPaymentMethod :
      HelperFunctions.PaymentMethodToDescription(this.outInvForm.controls['paymentMethod'].value, this.paymentMethods);

    this.outGoingInvoiceData.lineGrossAmount = this.outGoingInvoiceData.invoiceNetAmount + this.outGoingInvoiceData.invoiceVatAmount;

    if (_paymentMethod === "CASH" && this.outGoingInvoiceData.currencyCode === CurrencyCodes.HUF) {
      this.outGoingInvoiceData.lineGrossAmount = HelperFunctions.CashRound(this.outGoingInvoiceData.lineGrossAmount);
    } else {
      this.outGoingInvoiceData.lineGrossAmount = HelperFunctions.Round(this.outGoingInvoiceData.lineGrossAmount);
    }

    this.outGoingInvoiceData.invoiceNetAmount = HelperFunctions.Round2(this.outGoingInvoiceData.invoiceNetAmount, 1);
    this.outGoingInvoiceData.invoiceVatAmount = HelperFunctions.Round(this.outGoingInvoiceData.invoiceVatAmount);
  }

  HandleGridCodeFieldEnter(event: any, row: TreeGridNode<InvoiceLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!event) {
      this.bbxToastrService.close();
      event.stopPropagation();
    }
    console.log('[HandleGridCodeFieldEnter]: editmode off: ', this.editDisabled);
    if (this.navigationEnabled) {
      this.dbDataTable.HandleGridEnter(row, rowPos, objectKey, colPos, inputId, fInputType);
      setTimeout(() => {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.kbS.ClickCurrentElement();
      }, 50);
    } else {
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
        onComplete: this.RecalcNetAndVat.bind(this),
        createProductCallback: this.confirmAndCreateProductCallback
      } as CodeFieldChangeRequest)
    }
  }

  async ProductToInvoiceLine(product: Product): Promise<InvoiceLine> { return of({} as any).toPromise() }

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

          this.RecalcNetAndVat();
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

      this.additionalRowDataChanged(changedData, index, col)
    }
  }

  protected additionalRowDataChanged(changedData: any, index?: number, col?: string): void {
    if (col === 'unitPrice' && index !== null && index !== undefined) {
      changedData.Save()
    }
  }

  public currentLineDiscount(): number | string {
    if (!this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      return '-';
    }

    return this.dbDataTable?.data[this.kbS.p.y]?.data.discount ?? '-';
  }

  public currentRealQty(): number | string {
    if (!this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      return 0;
    }

    return this.dbDataTable?.data[this.kbS.p.y]?.data.realQty ?? 0;
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

  public customerDiscountsChanged(discounts: CustDiscountForGet[]): void {
    this.customerDiscounts = discounts
  }

  protected loadInvoiceItems(): void {
    const dialogRef = this.dialogService.open(LoadInvoiceLinesDialogComponent, {
      context: {
        invoiceType: this.mode.invoiceType
      }
    })

    dialogRef.onClose.subscribe((invoiceLines: InvoiceLine[]) => {
      if (!invoiceLines) {
        return
      }

      const whichIsNotLoadedYet = (x: InvoiceLine) => this.dbData.find(y => y.data.productCode === x.productCode) === undefined

      const newlyLoadedInvoiceLines = invoiceLines
        .filter(whichIsNotLoadedYet)
        .map(invoiceLine => {
          const discount = this.customerDiscounts.find(x => x.productGroupCode === invoiceLine.productGroup)
          if (discount) {
            invoiceLine.custDiscounted = true
            invoiceLine.discount = discount.discount
          }

          return ({ data: invoiceLine, uid: this.nextUid() });
        })

      this.dbData = this.dbData
        .concat(newlyLoadedInvoiceLines)
        .filter(x => x.data.productCode !== '')
        .sort((a, b) => a.data.productCode.localeCompare(b.data.productCode))

      this.RefreshTable()
    })
  }
}
