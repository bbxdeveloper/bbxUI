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
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { ProductService } from '../../product/services/product.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { OfferLine, OfferLineFullData } from '../models/OfferLine';
import { OfferService } from '../services/offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GetOfferParamsModel } from '../models/GetOfferParamsModel';
import { Offer } from '../models/Offer';
import { OfferUpdateDialogComponent } from '../offer-update-dialog/offer-update-dialog.component';
import { Actions, GetFooterCommandListFromKeySettings, KeyBindings, OfferEditorKeySettings } from 'src/assets/util/KeyBindings';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { GetCustomerParamListModel } from '../../customer/models/GetCustomerParamListModel';
import { OfferUtil } from '../models/OfferUtil';
import { BaseOfferEditorComponent } from '../base-offer-editor/base-offer-editor.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';
import { isTableKeyDownEvent, TableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { lastValueFrom } from 'rxjs';
import { SystemService } from '../../system/services/system.service';
import { ChooseEditOfferProductRequest, ProductCodeManagerServiceService } from 'src/app/services/product-code-manager-service.service';

@Component({
  selector: 'app-offer-editor',
  templateUrl: './offer-editor.component.html',
  styleUrls: ['./offer-editor.component.scss']
})
export class OfferEditorComponent extends BaseOfferEditorComponent implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') override table?: NbTable<any>;

  override KeySetting: Constants.KeySettingsDct = OfferEditorKeySettings;
  override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  override offerData!: Offer;

  idFromPath?: number;

  get IsBrutto(): boolean {
    if (HelperFunctions.isEmptyOrSpaces(this.buyerForm?.controls['isBrutto']?.value)) {
      return false
    }
    return this.buyerForm?.controls['isBrutto'].value
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
    vatRateService: VatRateService,
    printAndDownLoadService: PrintAndDownloadService,
    router: Router,
    route: ActivatedRoute,
    sidebarService: BbxSidebarService,
    khs: KeyboardHelperService,
    custDiscountService: CustomerDiscountService,
    systemService: SystemService,
    productCodeManagerServiceService: ProductCodeManagerServiceService
  ) {
    super(
      dialogService, fS, dataSourceBuilder, seInv, offerService,
      seC, cdref, kbS, bbxToastrService, simpleToastrService, cs,
      sts, productService, printAndDownLoadService, router, vatRateService, route, sidebarService, khs, custDiscountService,
      systemService, productCodeManagerServiceService
    );
    this.isLoading = false;
    this.InitialSetup();
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
      newOfferVersion: false,
      offerLines: [],
      offerGrossAmount: 0,
      offerNetAmount: 0,
      sumNetAmount: 0,
      sumBrtAmount: 0,
      currencyCode: '',
      currencyCodeX: '',
      exchangeRate: 1,
      isBrutto: false
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

  FromOfferLineFullData(data: OfferLineFullData, currencyCode: string, exchangeRate: number): OfferLine {
    console.log("\n\n[FromOfferLineFullData] stard, ID: ", data.id);

    let offerLine = new OfferLine();

    offerLine.currencyCode = currencyCode;
    offerLine.exchangeRate = HelperFunctions.ToFloat(exchangeRate);

    offerLine.originalUnitPrice1 = HelperFunctions.ToFloat(data.unitPrice1);
    offerLine.originalUnitPrice2 = HelperFunctions.ToFloat(data.unitPrice2);

    offerLine.lineNumber = data.lineNumber;
    offerLine.productCode = data.productCode;
    offerLine.lineDescription = data.lineDescription;
    offerLine.vatRateCode = data.vatRateCode;
    offerLine.originalUnitPrice = offerLine.unitPriceSwitch ?
      HelperFunctions.Round2(offerLine.originalUnitPrice2 ?? 0, 2) : HelperFunctions.Round2(offerLine.originalUnitPrice1 ?? 0, 2);
    offerLine.unitGross = data.unitGross;
    offerLine.showDiscount = data.showDiscount;
    offerLine.unitOfMeasure = data.unitOfMeasure;

    offerLine.quantity = HelperFunctions.ToFloat(data.quantity ?? 0);

    offerLine.vatRate = 0;

    offerLine.id = data.id;
    offerLine.offerID = data.offerID;
    offerLine.productID = data.productID;
    offerLine.unitOfMeasureX = data.unitOfMeasureX;
    offerLine.vatRateID = data.vatRateID;
    offerLine.vatPercentage = data.vatPercentage;

    offerLine.UnitPriceSwitch = data.unitPriceSwitch;

    offerLine.discount = data.discount;

    let discountForCalc = (HelperFunctions.ToFloat(offerLine.DiscountForCalc) === 0.0) ? 0.0 : HelperFunctions.ToFloat(offerLine.DiscountForCalc / 100.0);
    let priceWithDiscount = offerLine.exchangedOriginalUnitPrice;
    priceWithDiscount -= HelperFunctions.ToFloat(offerLine.exchangedOriginalUnitPrice * discountForCalc);
    offerLine.unitPrice = HelperFunctions.Round2(priceWithDiscount, 1);

    console.log("[FromOfferLineFullData] offerLine: ", offerLine);

    offerLine.ReCalc(true);

    console.log("[FromOfferLineFullData] end, after ReCalc offerLine: ", offerLine, "\n\n");

    return offerLine;
  }

  private async LoadAndSetDataForEdit(): Promise<void> {
    this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);

    this.idFromPath = parseInt(this.route.snapshot.params['id'], 10);
    console.log("ID for edit: ", this.idFromPath);

    await lastValueFrom(this.offerService.Get({ID: this.idFromPath, FullData: true} as GetOfferParamsModel))
      .then(async res => {
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
          this.buyerForm.controls['exchangeRate'].setValue(res.exchangeRate);
          this.buyerForm.controls['isBrutto'].setValue(res.isBrutto);

          this.offerData = res;

          this.buyerData.id = this.offerData.customerID;
          this.originalCustomerId = this.offerData.customerID;

          await lastValueFrom(this.seC.Get({ ID: this.buyerData.id } as GetCustomerParamListModel))
            .then(res => {
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
            })
            .catch(err => {
              this.cs.HandleError(err, `Hiba a ${this.buyerData.id} azonosítóval rendelkező ügyfél betöltése közben:\n`);
            })
            .finally(() => {});

          this.dbData = this.offerData.offerLines!.map(x => { return {
            data: OfferLine.FromOfferLineFullData(x, this.offerData.currencyCode, this.offerData.exchangeRate) } as TreeGridNode<OfferLine> }
          ).concat(this.dbData);

          this.dbData.forEach(x => {
            x.data.Save('productCode');
          });

          this.table?.renderRows();

          this.RecalcNetAndVat();
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => {
        this.AfterViewInitSetup();
      });

    this.isOfferEditor = true
    this.customerChanged = false

    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  async ngAfterViewInit(): Promise<void> {
    await this.refresh();
    await this.LoadAndSetDataForEdit();
  }
  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();
  }

  private UpdateSaveData(): void {
    this.offerData.isBrutto = this.IsBrutto

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
          quantity: HelperFunctions.ToFloat(x.data.quantity),
          originalUnitPrice: HelperFunctions.ToFloat(x.data.originalUnitPrice),
          unitPriceSwitch: x.data.unitPriceSwitch
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

        if (selectedSaveOption === OfferUtil.EditSaveModes.SAVE_WITHOUT_VERSIONING) {
          this.offerData.newOfferVersion = false
        }
        else if (selectedSaveOption === OfferUtil.EditSaveModes.SAVE_WITH_VERSIONING) {
          //this.offerData.offerVersion += 1;
          this.offerData.newOfferVersion = true
        }
        else if (selectedSaveOption === OfferUtil.EditSaveModes.SAVE_NEW_VERSION) {
          this.offerData.newOfferVersion = undefined;
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
                this.offerData.newOfferVersion = false;
              }
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            },
            complete: () => {
              this.isLoading = false;
            }
          });
        } else {
          this.offerService.Create(this.offerData).subscribe({
            next: async d => {
              try {
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

                  await this.printAndDownLoadService.openPrintDialog({
                    DialogTitle: 'Ajánlat Nyomtatása',
                    DefaultCopies: 1,
                    MsgError: `Az árajánlat nyomtatása közben hiba történt.`,
                    MsgCancel: `Az árajánlat nyomtatása közben hiba történt.`,
                    MsgFinish: `Az árajánlat nyomtatása véget ért.`,
                    Obs: this.seInv.GetReport.bind(this.offerService),
                    Reset: this.DelayedReset.bind(this),
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
              if (selectedSaveOption > 1) {
                this.offerData.offerVersion -= 1;
                this.offerData.newOfferVersion = false;
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

  override ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    this.productCodeManagerService.ChooseDataForTableRow({
      dbDataTable: this.dbDataTable,
      rowIndex: rowIndex,
      wasInNavigationMode: wasInNavigationMode,
      data: this.offerData,
      path: this.path,
      SelectedCurrency: this.SelectedCurrency
    } as ChooseEditOfferProductRequest).subscribe({
      next: async (res: Product) => {
        console.log("Selected item: ", res);
        await this.HandleProductChoose(res, rowIndex);
      }
    });
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
