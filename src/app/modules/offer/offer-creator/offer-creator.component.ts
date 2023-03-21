import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { AttachDirection, NavigatableForm as InlineTableNavigatableForm } from 'src/assets/model/navigation/Nav';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { todaysDate, validDate } from 'src/assets/model/Validators';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { ProductService } from '../../product/services/product.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { OneTextInputDialogComponent } from '../../shared/one-text-input-dialog/one-text-input-dialog.component';
import { InvoiceLine } from '../../invoice/models/InvoiceLine';
import { ProductSelectTableDialogComponent } from '../../shared/product-select-table-dialog/product-select-table-dialog.component';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { CreateOfferRequest } from '../models/CreateOfferRequest';
import { OfferLine, OfferLineForPost } from '../models/OfferLine';
import { OfferService } from '../services/offer.service';
import { Actions, EqualRows, GetFooterCommandListFromKeySettings, GetUpdatedKeySettings, KeyBindings, OfferCreatorKeySettings } from 'src/assets/util/KeyBindings';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { GetVatRatesParamListModel } from '../../vat-rate/models/GetVatRatesParamListModel';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { GetOfferParamsModel } from '../models/GetOfferParamsModel';
import { BaseOfferEditorComponent } from '../base-offer-editor/base-offer-editor.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';
import { InputFocusChangedEvent, isTableKeyDownEvent, TableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { lastValueFrom, of } from 'rxjs';
import { SystemService } from '../../system/services/system.service';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { RadioChoiceDialogComponent } from '../../shared/radio-choice-dialog/radio-choice-dialog.component';
import { SimpleDialogResponse } from 'src/assets/model/SimpleDialogResponse';
import { CurrencyAndExchangeService } from 'src/app/services/currency-and-exchange.service';

@Component({
  selector: 'app-offer-creator',
  templateUrl: './offer-creator.component.html',
  styleUrls: ['./offer-creator.component.scss']
})
export class OfferCreatorComponent extends BaseOfferEditorComponent implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') override table?: NbTable<any>;

  override KeySetting: Constants.KeySettingsDct = OfferCreatorKeySettings;
  override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  offerData!: CreateOfferRequest;

  get IsBrutto(): boolean {
    return this.buyerForm?.controls['isBrutto']?.value ?? false;
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<OfferLine>>,
    seInv: InvoiceService,
    offerService: OfferService,
    seC: CustomerService,
    cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    bbxToastrService: BbxToastrService,
    simpleToastrService: NbToastrService,
    cs: CommonService,
    sts: StatusService,
    productService: ProductService,
    printAndDownLoadService: PrintAndDownloadService,
    router: Router,
    vatRateService: VatRateService,
    route: ActivatedRoute,
    sidebarService: BbxSidebarService,
    khs: KeyboardHelperService,
    custDiscountService: CustomerDiscountService,
    systemService: SystemService
  ) {
    super(
      dialogService, fS, dataSourceBuilder, seInv, offerService,
      seC, cdref, kbS, bbxToastrService, simpleToastrService, cs,
      sts, productService, printAndDownLoadService, router, vatRateService, route, sidebarService, khs, custDiscountService,
      systemService
    );
    this.isLoading = false;
    this.InitialSetup();
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

  override RecalcNetAndVat(): void {
    console.log("RecalcNetAndVat: ", this.dbData, this.dbData.filter(x => !x.data.IsUnfinished()), this.dbData[0].data.UnitPriceVal);

    this.offerData.offerNetAmount =
      HelperFunctions.Round(this.dbData.filter(x => !x.data.IsUnfinished())
        .map(x => HelperFunctions.ToFloat(x.data.UnitPriceVal))
        .reduce((sum, current) => sum + current, 0));

    console.log("RecalcNetAndVat after: ", this.offerData.offerNetAmount);

    this.offerData.offerGrossAmount =
      HelperFunctions.Round(this.dbData.filter(x => !x.data.IsUnfinished())
        .map(x => (HelperFunctions.ToFloat(x.data.UnitGrossVal)))
        .reduce((sum, current) => sum + current, 0));

    if (this.SelectedCurrency?.value != CurrencyCodes.HUF) {
      this.offerData.offerNetAmount = HelperFunctions.Round2(this.offerData.offerNetAmount, 1);
      this.offerData.offerGrossAmount = HelperFunctions.Round2(this.offerData.offerGrossAmount, 1);
    }
  }

  override InitialSetup(): void {
    this.dbDataTableId = "offers-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    // Init form and table content - empty
    this.buyerData = {} as Customer;

    this.offerData = {
      customerID: -1,
      offerIssueDate: '',
      offerVaidityDate: '',
      notice: '',
      offerLines: [],
      offerGrossAmount: 0,
      offerNetAmount: 0,
      currencyCode: '',
      exchangeRate: 1,
      isBrutto: false
    } as CreateOfferRequest;

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    if (this.buyerForm === undefined) {
      this.buyerForm = new FormGroup({
        customerSearch: new FormControl('', []),
        customerName: new FormControl('', [Validators.required]),
        customerAddress: new FormControl('', [Validators.required]),
        customerTaxNumber: new FormControl('', [Validators.required]),
        offerIssueDate: new FormControl('', [
          Validators.required,
          todaysDate,
          validDate
        ]),
        offerVaidityDate: new FormControl('', [
          Validators.required,
          validDate
        ]),
        offerNumberX: new FormControl('', []),
        notice: new FormControl('', []),
        currencyCode: new FormControl(undefined, []),
        exchangeRate: new FormControl(1, []),
        isBrutto: new FormControl(false, [])
      });

      this.buyerForm.controls['isBrutto'].valueChanges.subscribe({
        next: newValue => {
          this.offerData.isBrutto = newValue;
          if (newValue) {
            this.ShowColumn('UnitGrossVal');
          } else {
            this.HideColumn('UnitGrossVal');
          }
        }
      });

      this.buyerForm.controls['currencyCode'].valueChanges.subscribe({
        next: async newValue => {
          this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);

          let newExchangeRate = 1;

          if (this.SelectedCurrency?.value != CurrencyCodes.HUF) {
            let issueDate =
              this.buyerForm && this.buyerForm.controls['offerIssueDate'] && this.buyerForm.controls['offerIssueDate']?.value ?
                this.buyerForm.controls['offerIssueDate'].value : HelperFunctions.GetDateString(0, 0, 0);

            await lastValueFrom(this.systemService.GetExchangeRate({
              Currency: this.SelectedCurrency?.value ?? CurrencyCodes.HUF,
              ExchengeRateDate: issueDate
            }))
              .then(rate => {
                newExchangeRate = rate;
              })
              .catch(err => {
                this.cs.HandleError(err);
              })
              .finally(() => {});
          }

          console.log("Currency selected: ", this.SelectedCurrency, ', exchangeRates: ', newExchangeRate);

          this.showExchangeRateInput = this.SelectedCurrency?.value != CurrencyCodes.HUF;

          console.log("New exchangerate: ", this.SelectedCurrency?.value, ', ', newExchangeRate);

          this.offerData.exchangeRate = newExchangeRate;
          this.buyerForm.controls['exchangeRate'].setValue(newExchangeRate);

          this.cdref.detectChanges();
          setTimeout(() => {
            this.buyerFormNav.GenerateAndSetNavMatrices(false, true);
          }, 0);

          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      });

      this.buyerForm.controls['exchangeRate'].valueChanges.subscribe({
        next: newValue => {
          console.log("exchangeRate changed: ", newValue);

          this.offerData.exchangeRate = HelperFunctions.ToFloat(newValue);
          this.dbDataTable.data.forEach(x => x.data.ReCalc(false, this.SelectedCurrency?.value, this.offerData.exchangeRate));

          this.cdref.detectChanges();
        }
      });
    } else {
      this.buyerForm.reset(undefined);
      this.buyerForm.controls['isBrutto'].setValue(false);
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
  }

  async ngOnInit(): Promise<void> {
    this.fS.pushCommands(this.commands);
    // Refresh data
    await this.refresh();
  }
  ngAfterViewInit(): void {
    this.AfterViewInitSetup();
  }
  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();
  }

  private UpdateOutGoingData(): void {
    this.offerData.customerID = this.buyerData.id;

    this.offerData.notice = this.buyerForm.controls['notice'].value ?? "";

    this.offerData.offerIssueDate = this.buyerForm.controls['offerIssueDate'].value;
    this.offerData.offerVaidityDate = this.buyerForm.controls['offerVaidityDate'].value;

    this.offerData.currencyCode = this.currencyCodeValues[this.buyerForm.controls['currencyCode'].value]?.value ?? null;
    this.offerData.exchangeRate = HelperFunctions.ToFloat(this.buyerForm.controls['exchangeRate'].value ?? 1);

    this.offerData.offerLines = this.dbData.filter(x => !x.data.IsUnfinished()).map(x => {
      return {
        productCode: x.data.productCode,
        lineDescription: x.data.lineDescription,
        vatRateCode: x.data.vatRateCode,
        unitPrice: HelperFunctions.Round2(x.data.UnitPriceForCalc, 2),
        unitGross: this.ToFloat(x.data.unitGross),
        discount: x.data.DiscountForCalc,
        showDiscount: x.data.showDiscount,
        unitOfMeasure: x.data.unitOfMeasure,
        quantity: HelperFunctions.ToFloat(x.data.quantity),
        originalUnitPrice: HelperFunctions.ToFloat(x.data.originalUnitPrice),
        unitPriceSwitch: x.data.unitPriceSwitch
      } as OfferLineForPost;
    });

    for (let i = 0; i < this.offerData.offerLines.length; i++) {
      this.offerData.offerLines[i].unitPrice = this.ToFloat(this.offerData.offerLines[i].unitPrice);
      this.offerData.offerLines[i].lineNumber = HelperFunctions.ToInt(i + 1);
    }
  }

  private FillOfferNumberX(id: number): void {
    this.offerService.Get({ FullData: false, ID: id } as GetOfferParamsModel).subscribe({
      next: data => {
        if (!!data) {
          this.buyerForm.controls['offerNumberX'].setValue(data.offerNumber ?? '');
          // this.kbS.setEditMode(KeyboardModes.NAVIGATION);
          // const confirmDialogRef = this.dialogService.open(OneTextInputDialogComponent, {
          //   context: {
          //     isReadonly: true,
          //     title: 'Sorszám',
          //     defaultValue: this.buyerForm.controls['offerNumberX'].value
          //   }
          // });
        }
      },
      error: err => {
        this.cs.HandleError(err);
      },
      complete: () => {}
    });
  }

  override Save(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const confirmDialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_SAVE_DATA } });
    confirmDialogRef.onClose.subscribe(res => {
      if (res) {
        this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);

        this.UpdateOutGoingData();

        console.log('Save: ', this.offerData);

        this.offerService.Create(this.offerData).subscribe({
          next: d => {
            try {
              if (!!d.data) {
                console.log('Save response: ', d);

                this.FillOfferNumberX(d.data.id);

                this.simpleToastrService.show(
                  Constants.MSG_SAVE_SUCCESFUL,
                  Constants.TITLE_INFO,
                  Constants.TOASTR_SUCCESS_5_SEC
                );
                this.isLoading = false;

                this.dbDataTable.RemoveEditRow();
                this.kbS.SelectFirstTile();

                // this.buyerFormNav.controls['invoiceOrdinal'].setValue(d.data.invoiceNumber ?? '');
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);

                this.printAndDownLoadService.openPrintDialog({
                  DialogTitle: 'Ajánlat Nyomtatása',
                  DefaultCopies: 1,
                  MsgError: `Az árajánlat nyomtatása közben hiba történt.`,
                  MsgCancel: `Az árajánlat nyomtatása közben hiba történt.`,
                  MsgFinish: `Az árajánlat nyomtatása véget ért.`,
                  Obs: this.seInv.GetReport.bind(this.offerService),
                  Reset: this.Reset.bind(this),
                  ReportParams: {
                    "id": d.data?.id,
                    "copies": 1 // Ki lesz töltve dialog alapján
                  } as Constants.Dct
                } as PrintDialogRequest);
              } else {
                this.cs.HandleError(d.errors);
                this.isLoading = false;
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);
              }
            } catch (error) {
              this.Reset()
              this.cs.HandleError(error)
            }
          },
          error: err => {
            this.cs.HandleError(err);
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          }
        });
      }
    });
  }

  async HandleProductChoose(res: Product, rowPos: number): Promise<void> {
    if (!!res) {
      this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);

      if (this.dbDataTable.data[rowPos].data.productID === res.id) {
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.dbDataTable.MoveNextInTable();
        setTimeout(() => {
          this.kbS.setEditMode(KeyboardModes.EDIT);
          this.kbS.ClickCurrentElement();
        }, 500);
        return;
      }

      await lastValueFrom(this.vatRateService.GetAll({} as GetVatRatesParamListModel))
        .then(async d => {
          if (!!d.data) {
            console.log('Vatrates: ', d.data);

            let vatRateFromProduct = d.data.find(x => x.vatRateCode === res.vatRateCode);

            if (vatRateFromProduct === undefined) {
              this.bbxToastrService.show(
                `Áfa a kiválasztott termékben található áfakódhoz (${res.vatRateCode}) nem található.`,
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR
              );
            }

            if (!res.noDiscount) {
              await lastValueFrom(this.custDiscountService.GetByCustomer({ CustomerID: this.buyerData.id ?? -1 }))
                .then(data => {
                  let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
                    data: OfferLine.FromProduct(res, 0, vatRateFromProduct?.id ?? 0, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
                  });
                  currentRow?.data.Save('productCode');
                  const _d = this.dbData[rowPos].data;
                  this.dbData[rowPos].data.discount = data.find(x => _d.productGroup.split("-")[0] === x.productGroupCode)?.discount ?? 0;
                  this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                  this.dbDataTable.MoveNextInTable();
                  setTimeout(() => {
                    this.kbS.setEditMode(KeyboardModes.EDIT);
                    this.kbS.ClickCurrentElement();
                  }, 500);
                })
                .catch(err => {
                  this.cs.HandleError(d.errors);
                  let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
                    data: OfferLine.FromProduct(res, 0, vatRateFromProduct?.id ?? 0, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
                  });
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
              let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
                data: OfferLine.FromProduct(res, 0, vatRateFromProduct?.id ?? 0, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
              });
              currentRow?.data.Save('productCode');
              const _d = this.dbData[rowPos].data;
              this.dbData[rowPos].data.discount = 0;
              this.kbS.setEditMode(KeyboardModes.NAVIGATION);
              this.dbDataTable.MoveNextInTable();
              setTimeout(() => {
                this.kbS.setEditMode(KeyboardModes.EDIT);
                this.kbS.ClickCurrentElement();
              }, 500);
            }
          } else {
            this.cs.HandleError(d.errors);

            let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
              data: OfferLine.FromProduct(res, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
            });
            currentRow?.data.Save('productCode');

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
            data: OfferLine.FromProduct(res, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
          });
          currentRow?.data.Save('productCode');

          this.kbS.setEditMode(KeyboardModes.NAVIGATION);
          this.dbDataTable.MoveNextInTable();
          setTimeout(() => {
            this.kbS.setEditMode(KeyboardModes.EDIT);
            this.kbS.ClickCurrentElement();
          }, 500);
        })
        .finally(() => {});

      this.sts.pushProcessStatus(Constants.BlankProcessStatus);
    }
  }

  override ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    console.log("Selecting InvoiceLine from avaiable data.");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.offerData.exchangeRate = HelperFunctions.ToFloat(this.buyerForm.controls['exchangeRate'].value ?? 1);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.dbDataTable.editedRow?.data.productCode ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
        exchangeRate: this.offerData.exchangeRate,
        currency: this.SelectedCurrency?.value ?? CurrencyCodes.HUF
      }
    });
    dialogRef.onClose.subscribe(async (res: Product) => {
      console.log("Selected item: ", res);
      await this.HandleProductChoose(res, rowIndex);
    });
  }

  override FillFormWithFirstAvailableCustomer(event: any): void {
    if (!!this.Subscription_FillFormWithFirstAvailableCustomer && !this.Subscription_FillFormWithFirstAvailableCustomer.closed) {
      this.Subscription_FillFormWithFirstAvailableCustomer.unsubscribe();
    }

    this.customerInputFilterString = event.target.value ?? '';

    if (this.customerInputFilterString.replace(' ', '') === '') {
      this.buyerData = { id: -1 } as Customer;
      this.SetCustomerFormFields(undefined);
      return;
    }

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

  override TableCodeFieldChanged(changedData: any, index: number, row: TreeGridNode<OfferLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!changedData && !!changedData.productCode && changedData.productCode.length > 0) {
      this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
      this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: async product => {
          console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

          if (!!product && !!product?.productCode) {
            if (row.data.productID === product.id) {
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
              this.dbDataTable.MoveNextInTable();
              setTimeout(() => {
                this.kbS.setEditMode(KeyboardModes.EDIT);
                this.kbS.ClickCurrentElement();
              }, 500);
              return;
            }

            if (!product.noDiscount) {
              await lastValueFrom(this.custDiscountService.GetByCustomer({ CustomerID: this.buyerData.id ?? -1 }))
                .then(data => {
                  let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
                    data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
                  });
                  currentRow?.data.Save('productCode');
                  const _d = this.dbData[rowPos].data;
                  this.dbData[rowPos].data.discount = data.find(x => _d.productGroup.split("-")[0] === x.productGroupCode)?.discount ?? 0;
                  this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                  this.dbDataTable.MoveNextInTable();
                  setTimeout(() => {
                    this.kbS.setEditMode(KeyboardModes.EDIT);
                    this.kbS.ClickCurrentElement();
                  }, 200);
                })
                .catch(err => {
                  this.cs.HandleError(err);

                  let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
                    data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
                  });
                  currentRow?.data.Save('productCode');

                  this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                  this.dbDataTable.MoveNextInTable();
                  setTimeout(() => {
                    this.kbS.setEditMode(KeyboardModes.EDIT);
                    this.kbS.ClickCurrentElement();
                  }, 500);
                })
                .finally(() => {

                });
            } else {
              let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
                data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
              });
              currentRow?.data.Save('productCode');

              const _d = this.dbData[rowPos].data;
              this.dbData[rowPos].data.discount = 0;
              this.kbS.setEditMode(KeyboardModes.NAVIGATION);
              this.dbDataTable.MoveNextInTable();
              setTimeout(() => {
                this.kbS.setEditMode(KeyboardModes.EDIT);
                this.kbS.ClickCurrentElement();
              }, 200);
            }
          } else {
            this.bbxToastrService.show(
              Constants.MSG_NO_PRODUCT_FOUND,
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
            this.dbDataTable.data[rowPos].data.Restore('productCode');
          }

          this.RecalcNetAndVat();
        },
        error: err => {
          this.dbDataTable.data[rowPos].data.Restore('productCode');
          this.RecalcNetAndVat();
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        },
        complete: () => {
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      });
    }
  }

  selectIntPart(event: any): void {
    HelperFunctions.SelectBeginningById(event.target.id);
  }

  /////////////////////////////////////////////
  ////////////// KEYBOARD EVENTS //////////////
  /////////////////////////////////////////////

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
        HelperFunctions.StopEvent(event);
        return;
      }
      this.CheckSaveConditionsAndSave();
      return;
    }
    this.HandleKeyDown(event);
  }

  public override HandleKeyDown(event: Event | TableKeyDownEvent, isForm: boolean = false): void {
    if (isTableKeyDownEvent(event)) {
      let _event = event.Event;
      switch (_event.key) {
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
            return this.HandleProductChoose(product, event.RowPos);
          });
          break;
        }
        case KeyBindings.Enter: {
          if (!this.isSaveInProgress && _event.ctrlKey && _event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
            if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
              _event.preventDefault();
              _event.stopImmediatePropagation();
              _event.stopPropagation();
              return;
            }
            this.CheckSaveConditionsAndSave();
            return;
          }
          break;
        }
        case this.KeySetting[Actions.ToggleForm].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          _event.preventDefault();
          this.SwitchUnitPriceAll();
          break;
        }
      }
    }
    else {
      switch ((event as KeyboardEvent).key) {
        case this.KeySetting[Actions.Search].KeyCode: {
          if (!isForm) {
            return;
          }
          if (this.selectedSearchFieldType !== Constants.SearchFieldTypes.Form || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
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
        case this.KeySetting[Actions.ToggleAllDiscounts].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          event.preventDefault();
          this.ToggleAllShowDiscount();
          break;
        }
        case this.KeySetting[Actions.SetGlobalDiscount].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          event.preventDefault();
          this.SetGlobalDiscount();
          break;
        }
        case this.KeySetting[Actions.EscapeEditor1].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          event.preventDefault();
          this.ExitToNav();
          break;
        }
        case this.KeySetting[Actions.ToggleForm].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          event.preventDefault();
          this.SwitchUnitPriceAll();
          break;
        }
      }
    }
  }

}
