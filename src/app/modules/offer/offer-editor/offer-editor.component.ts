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
import { UtilityService } from 'src/app/services/utility.service';
import { InvoiceLine } from '../../invoice/models/InvoiceLine';
import { ProductSelectTableDialogComponent } from '../../invoice/product-select-table-dialog/product-select-table-dialog.component';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { OfferLine, OfferLineFullData } from '../models/OfferLine';
import { OfferService } from '../services/offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GetOfferParamsModel } from '../models/GetOfferParamsModel';
import { Offer } from '../models/Offer';
import { OfferUpdateDialogComponent } from '../offer-update-dialog/offer-update-dialog.component';
import { Actions, EqualRows, GetFooterCommandListFromKeySettings, GetUpdatedKeySettings, KeyBindings, OfferEditorKeySettings } from 'src/assets/util/KeyBindings';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { GetVatRatesParamListModel } from '../../vat-rate/models/GetVatRatesParamListModel';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { GetCustomerParamListModel } from '../../customer/models/GetCustomerParamListModel';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { OfferUtil } from '../models/OfferUtil';
import { BaseOfferEditorComponent } from '../base-offer-editor/base-offer-editor.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';
import { InputFocusChangedEvent, isTableKeyDownEvent, TableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { lastValueFrom } from 'rxjs';
import { OneTextInputDialogComponent } from '../../shared/one-text-input-dialog/one-text-input-dialog.component';
import { SystemService } from '../../system/services/system.service';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';

@Component({
  selector: 'app-offer-editor',
  templateUrl: './offer-editor.component.html',
  styleUrls: ['./offer-editor.component.scss']
})
export class OfferEditorComponent extends BaseOfferEditorComponent implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') override table?: NbTable<any>;

  originalCustomerId: number = 0;

  override KeySetting: Constants.KeySettingsDct = OfferEditorKeySettings;
  override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  offerData!: Offer;

  idFromPath?: number;

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
    vatRateService: VatRateService,
    utS: UtilityService,
    router: Router,
    route: ActivatedRoute,
    sidebarService: BbxSidebarService,
    khs: KeyboardHelperService,
    custDiscountService: CustomerDiscountService,
    systemService: SystemService
  ) {
    super(
      dialogService, fS, dataSourceBuilder, seInv, offerService,
      seC, cdref, kbS, bbxToastrService, simpleToastrService, cs,
      sts, productService, utS, router, vatRateService, route, sidebarService, khs, custDiscountService,
      systemService
    );
    this.InitialSetup();
  }

  public inlineInputFocusChanged(event: InputFocusChangedEvent): void {
    this.dbData[event.RowPos].data.ReCalc(event.FieldDescriptor.objectKey === "unitPrice", this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate ?? 1);

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
    console.log("RecalcNetAndVat: ", this.dbData);

    this.offerData.offerNetAmount =
      HelperFunctions.ToInt(this.dbData.filter(x => !x.data.IsUnfinished())
        .map(x => this.ToFloat(x.data.UnitPrice) * HelperFunctions.ToFloat(x.data.quantity === 0 ? 1 : x.data.quantity))
        .reduce((sum, current) => sum + current, 0));

    this.offerData.offerGrossAmount =
      HelperFunctions.ToInt(this.dbData.filter(x => !x.data.IsUnfinished())
        .map(x => (this.ToFloat(x.data.unitGross) * HelperFunctions.ToFloat(x.data.quantity === 0 ? 1 : x.data.quantity)))
        .reduce((sum, current) => sum + current, 0));

    if (this.offerData.currencyCode != CurrencyCodes.HUF) {
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
      offerGrossAmount: 0,
      offerNetAmount: 0,
      sumNetAmount: 0,
      sumBrtAmount: 0,
      currencyCode: '',
      currencyCodeX: '',
      exchangeRate: 1
    } as Offer;

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
        notice: new FormControl('', []),
        offerNumberX: new FormControl('', []),
        currencyCode: new FormControl(undefined, []),
        exchangeRate: new FormControl(1, []),
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
          this.buyerForm.controls['currencyCode'].setValue(res.currencyCodeX);
          this.buyerForm.controls['exchangeRate'].setValue(res.exchangeRate);

          this.offerData = res;

          this.buyerData.id = this.offerData.customerID;
          this.originalCustomerId = this.offerData.customerID;
          this.seC.Get({ ID: this.buyerData.id } as GetCustomerParamListModel).subscribe({
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

          this.dbData = this.offerData.offerLines!.map(x =>
            { return { data: OfferLine.FromOfferLineFullData(x) } as TreeGridNode<OfferLine> }
          ).concat(this.dbData);

          this.table?.renderRows();

          this.RecalcNetAndVat();
        }
      },
      error: (err) => {
        this.cs.HandleError(err);
      },
      complete: () => {
        this.isLoading = false;
        this.AfterViewInitSetup();
      },
    });
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    // this.AfterViewInitSetup();
    this.LoadAndSetDataForEdit();
  }
  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();
  }

  private UpdateSaveData(): void {
    this.offerData.customerID = this.buyerData.id;

    this.offerData.notice = this.buyerForm.controls['notice'].value ?? "";

    this.offerData.offerIssueDate = this.buyerForm.controls['offerIssueDate'].value;
    this.offerData.offerVaidityDate = this.buyerForm.controls['offerVaidityDate'].value;

    this.offerData.offerLines = this.dbData.filter(x => !x.data.IsUnfinished()).map(x => 
      {
        return {
          productCode: x.data.productCode,
          lineDescription: x.data.lineDescription,
          vatRateCode: x.data.vatRateCode,
          unitPrice: HelperFunctions.Round2(x.data.UnitPriceForCalc, 2),
          unitGross: this.ToFloat(x.data.unitGross),
          discount: x.data.DiscountForCalc,
          showDiscount: x.data.showDiscount,
          unitOfMeasure: x.data.unitOfMeasure,
          id: x.data.id,
          offerID: x.data.offerID,
          productID: x.data.productID,
          unitOfMeasureX: x.data.unitOfMeasureX,
          vatRateID: x.data.vatRateID,
          vatPercentage: x.data.vatPercentage,
          quantity: HelperFunctions.ToFloat(x.data.quantity)
        } as OfferLineFullData
      }
    );

    for (let i = 0; i < this.offerData.offerLines.length; i++) {
      this.offerData.offerLines[i].unitPrice = HelperFunctions.ToFloat(this.offerData.offerLines[i].unitPrice);
      this.offerData.offerLines[i].lineNumber = HelperFunctions.ToInt(i + 1);
    }

    console.log('[UpdateSaveData] offerData: ', this.offerData, ', dbData: ', this.dbData);
  }

  override Save(): void {
    this.UpdateSaveData();

    console.log('Save: ', this.offerData);

    this.isLoading = true;
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(OfferUpdateDialogComponent, {
      context: {}
    });
    dialogRef.onClose.subscribe((selectedSaveOption: number) => {
      console.log("Selected option: ", selectedSaveOption);

      this.isLoading = false;

      if (selectedSaveOption !== undefined && selectedSaveOption >= 0) {
        this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);

        if (selectedSaveOption === OfferUtil.EditSaveModes.SAVE_WITH_VERSIONING) {
          this.offerData.offerVersion += 1;
        }
        else if (selectedSaveOption === OfferUtil.EditSaveModes.SAVE_NEW_VERSION) {
          this.offerData.newOffer = true;
        }

        this.isLoading = true;

        if (selectedSaveOption !== OfferUtil.EditSaveModes.SAVE_NEW_VERSION) {
          this.offerService.Update(this.offerData).subscribe({
            next: d => {
              if (!!d.data) {
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                console.log('Save response: ', d);

                this.simpleToastrService.show(
                  Constants.MSG_SAVE_SUCCESFUL,
                  Constants.TITLE_INFO,
                  Constants.TOASTR_SUCCESS_5_SEC
                );

                this.ExitToNav();
              } else {
                this.cs.HandleError(d.errors);
                this.isLoading = false;
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);
              }
            },
            error: err => {
              this.cs.HandleError(err);
              this.isLoading = false;
              if (selectedSaveOption > 1) {
                this.offerData.offerVersion -= 1;
                this.offerData.newOffer = false;
              }
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            },
            complete: () => {
              this.isLoading = false;
            }
          });
        } else {
          this.offerService.Update(this.offerData).subscribe({
            next: d => {
              if (!!d.data) {
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                console.log('Save response: ', d);

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

                const dialogRef = this.dialogService.open(OneTextInputDialogComponent, {
                  context: {
                    title: 'Ajánlat Nyomtatása',
                    inputLabel: 'Példányszám',
                    defaultValue: 1
                  }
                });
                dialogRef.onClose.subscribe({
                  next: async res => {

                    this.Reset();

                    if (res.answer && HelperFunctions.ToInt(res.value) > 0) {

                      this.buyerForm.controls['offerNumberX'].reset();

                      let commandEndedSubscription = this.utS.CommandEnded.subscribe({
                        next: cmdEnded => {
                          console.log(`CommandEnded received: ${cmdEnded?.ResultCmdType}`);

                          if (cmdEnded?.ResultCmdType === Constants.CommandType.PRINT_REPORT) {
                            this.simpleToastrService.show(
                              `Az árajánlat nyomtatása véget ért.`,
                              Constants.TITLE_INFO,
                              Constants.TOASTR_SUCCESS_5_SEC
                            );
                            commandEndedSubscription.unsubscribe();
                          }

                          this.isLoading = false;
                        },
                        error: cmdEnded => {
                          console.log(`CommandEnded error received: ${cmdEnded?.CmdType}`);

                          this.isLoading = false;

                          commandEndedSubscription.unsubscribe();

                          this.bbxToastrService.show(
                            `Az árajánlat nyomtatása közben hiba történt.`,
                            Constants.TITLE_ERROR,
                            Constants.TOASTR_ERROR
                          );
                        }
                      });
                      
                      this.isLoading = true;
                      await this.printReport(d.data?.id, res.value);

                      this.ExitToNav();
                    } else {
                      this.simpleToastrService.show(
                        `Az árajánlat számla nyomtatása nem történt meg.`,
                        Constants.TITLE_INFO,
                        Constants.TOASTR_SUCCESS_5_SEC
                      );
                      this.isLoading = false;

                      this.ExitToNav();
                    }
                  }
                });
              } else {
                this.cs.HandleError(d.errors);
                this.isLoading = false;
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);
              }
            },
            error: err => {
              this.cs.HandleError(err);
              this.isLoading = false;
              if (selectedSaveOption > 1) {
                this.offerData.offerVersion -= 1;
                this.offerData.newOffer = false;
              }
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            },
            complete: () => {
              this.isLoading = false;
            }
          });
        }
        
      }
    });
  }

  async HandleProductChoose(res: Product, rowIndex: number): Promise<void> {
    if (!!res) {
      this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);

      if (this.dbDataTable.data[rowIndex].data.productID === res.id) {
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
                  this.dbDataTable.FillCurrentlyEditedRow({
                    data: OfferLine.FromProduct(res, 0, vatRateFromProduct?.id ?? 0, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
                  });
                  const _d = this.dbData[rowIndex].data;
                  this.dbData[rowIndex].data.discount = data.find(x => _d.productGroup.split("-")[0] === x.productGroupCode)?.discount ?? 0;
                  this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                  this.dbDataTable.MoveNextInTable();
                  setTimeout(() => {
                    this.kbS.setEditMode(KeyboardModes.EDIT);
                    this.kbS.ClickCurrentElement();
                  }, 500);
                })
                .catch(err => {
                  this.cs.HandleError(d.errors);
  
                  this.dbDataTable.FillCurrentlyEditedRow({
                    data: OfferLine.FromProduct(res, 0, vatRateFromProduct?.id ?? 0, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
                  });
                  this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                  this.dbDataTable.MoveNextInTable();
                  setTimeout(() => {
                    this.kbS.setEditMode(KeyboardModes.EDIT);
                    this.kbS.ClickCurrentElement();
                  }, 500);
                })
                .finally(() => { });
            } else {
              this.dbDataTable.FillCurrentlyEditedRow({
                data: OfferLine.FromProduct(res, 0, vatRateFromProduct?.id ?? 0, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
              });
              const _d = this.dbData[rowIndex].data;
              this.dbData[rowIndex].data.discount = 0;
              this.kbS.setEditMode(KeyboardModes.NAVIGATION);
              this.dbDataTable.MoveNextInTable();
              setTimeout(() => {
                this.kbS.setEditMode(KeyboardModes.EDIT);
                this.kbS.ClickCurrentElement();
              }, 500);
            }
          } else {
            this.cs.HandleError(d.errors);

            this.dbDataTable.FillCurrentlyEditedRow({
              data: OfferLine.FromProduct(res, this.offerData.id, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
            });
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

          this.dbDataTable.FillCurrentlyEditedRow({
            data: OfferLine.FromProduct(res, this.offerData.id, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
          });
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

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.dbDataTable.editedRow?.data.productCode ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs
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
                  this.dbDataTable.FillCurrentlyEditedRow({
                    data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
                  });
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

                  this.dbDataTable.FillCurrentlyEditedRow({
                    data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
                  });
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
              this.dbDataTable.FillCurrentlyEditedRow({
                data: OfferLine.FromProduct(product, undefined, undefined, false, this.SelectedCurrency?.value ?? CurrencyCodes.HUF, this.offerData.exchangeRate)
              });
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
          }

          this.RecalcNetAndVat();
        },
        error: err => {
          this.RecalcNetAndVat();
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        },
        complete: () => {
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      });
    }
  }

  /////////////////////////////////////////////
  ////////////// KEYBOARD EVENTS //////////////
  /////////////////////////////////////////////

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
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
          this.ChooseDataForForm();
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
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            return;
          }
          event.preventDefault();
          this.ToggleAllShowDiscount();
          break;
        }
        case this.KeySetting[Actions.SetGlobalDiscount].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            return;
          }
          event.preventDefault();
          this.SetGlobalDiscount();
          break;
        }
        case this.KeySetting[Actions.EscapeEditor1].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            return;
          }
          event.preventDefault();
          this.ExitToNav();
          break;
        }
      }
    }
  }
  
}
