import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NbTable, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
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
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { ProductService } from '../../product/services/product.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { CreateOfferRequest } from '../models/CreateOfferRequest';
import { OfferLine, OfferLineForPost } from '../models/OfferLine';
import { OfferService } from '../services/offer.service';
import { Actions, GetFooterCommandListFromKeySettings, KeyBindings, OfferCreatorKeySettings } from 'src/assets/util/KeyBindings';
import { ConfirmationDialogComponent } from '../../shared/simple-dialogs/confirmation-dialog/confirmation-dialog.component';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GetOfferParamsModel } from '../models/GetOfferParamsModel';
import { BaseOfferEditorComponent } from '../base-offer-editor/base-offer-editor.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { CustomerDiscountService } from '../../customer-discount/services/customer-discount.service';
import { isTableKeyDownEvent, TableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { lastValueFrom } from 'rxjs';
import { SystemService } from '../../system/services/system.service';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { ChooseCreateOfferProductRequest, ProductCodeManagerServiceService } from 'src/app/services/product-code-manager-service.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import {EditCustomerDialogComponent} from "../../shared/edit-customer-dialog/edit-customer-dialog.component";
import {GetCustomersParamListModel} from "../../customer/models/GetCustomersParamListModel";

@Component({
  selector: 'app-offer-creator',
  templateUrl: './offer-creator.component.html',
  styleUrls: ['./offer-creator.component.scss']
})
export class OfferCreatorComponent extends BaseOfferEditorComponent implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') override table?: NbTable<any>;

  override KeySetting: Constants.KeySettingsDct = OfferCreatorKeySettings;
  override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  override offerData!: CreateOfferRequest;

  get IsBrutto(): boolean {
    if (HelperFunctions.isEmptyOrSpaces(this.buyerForm?.controls['isBrutto']?.value)) {
      return false
    }
    return this.buyerForm?.controls['isBrutto'].value
  }



  constructor(
    @Optional() dialogService: BbxDialogServiceService,
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
    systemService: SystemService,
    productCodeManagerServiceService: ProductCodeManagerServiceService,
  ) {
    super(
      dialogService, fS, dataSourceBuilder, seInv, offerService,
      seC, cdref, kbS, bbxToastrService, simpleToastrService, cs,
      sts, productService, printAndDownLoadService, router, vatRateService, route, sidebarService, khs, custDiscountService,
      systemService, productCodeManagerServiceService
    );
    this.isLoading = false;
    this.InitialSetup();
    this.isOfferEditor = false
  }

  override InitialSetup(): void {
    this.dbDataTableId = "offers-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    // Init form and table content - empty

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
            this.ShowColumn('UnitGrossVal', true);
          } else {
            this.HideColumn('UnitGrossVal');
          }
        }
      });

      this.buyerForm.controls['currencyCode'].valueChanges.subscribe({
        next: async newValue => {
          if (this.currencyCodes.find(x => x === newValue) === undefined) {
            return
          }

          this.status.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);

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

          this.status.pushProcessStatus(Constants.BlankProcessStatus);
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
    this.offerData.isBrutto = this.IsBrutto

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
        originalUnitPrice: HelperFunctions.ToFloat(x.data.exchangedOriginalUnitPrice),
        originalUnitPriceHUF: HelperFunctions.ToFloat(x.data.originalUnitPriceHUF),
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
        this.status.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);

        this.UpdateOutGoingData();

        console.log('Save: ', this.offerData);

        this.offerService.Create(this.offerData).subscribe({
          next: async d => {
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
                this.status.pushProcessStatus(Constants.BlankProcessStatus);

                await this.printAndDownLoadService.openPrintDialog({
                  DialogTitle: 'Ajánlat Nyomtatása',
                  DefaultCopies: 1,
                  MsgError: `Az árajánlat nyomtatása közben hiba történt.`,
                  MsgCancel: `Az árajánlat nyomtatása nem történt meg.`,
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
                this.status.pushProcessStatus(Constants.BlankProcessStatus);
              }
            } catch (error) {
              this.Reset()
              this.cs.HandleError(error)
            }
          },
          error: err => {
            this.cs.HandleError(err);
            this.isLoading = false;
            this.status.pushProcessStatus(Constants.BlankProcessStatus);
          }
        });
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
      SelectedCurrency: this.SelectedCurrency,
      buyerForm: this.buyerForm
    } as ChooseCreateOfferProductRequest).subscribe({
      next: async (res: Product) => {
        console.log("Selected item: ", res);
        await this.HandleProductChoose(res, rowIndex);
      }
    });
  }

  private onEditCustomer(result: boolean): void {
    if (!result) {
      return
    }

    const request = {
      ID: this.buyerData.id,
      PageSize: '1',
      OrderBy: 'customerName'
    } as GetCustomersParamListModel

    this.status.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
    this.seC.GetAll(request)
      .subscribe({
        next: res => {
          if (!res.succeeded) {
            this.cs.HandleError(res.errors)
          }

          if (res.data && res.data.length > 0) {
            this.buyerData = res.data[0]
            this.cachedCustomerName = this.buyerData.customerName
              this.SetCustomerFormFields(this.buyerData)
              this.searchByTaxtNumber = false;
          }
        },
        error: error => {
          this.cs.HandleError(error)
          this.status.pushProcessStatus(Constants.BlankProcessStatus);
        },
        complete: () => {
          this.status.pushProcessStatus(Constants.BlankProcessStatus);
        }
      })
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
        case this.KeySetting[Actions.Refresh].KeyCode: {
          if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            _event.preventDefault();
            _event.stopImmediatePropagation();
            _event.stopPropagation();
            return;
          }
          const id = this.dbData[this.kbS.p.y].data.productID
          this.openProductStockInformationDialog(id);
          return;
        }
      }
    }
    else {
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
        case this.KeySetting[Actions.Edit].KeyCode: {
          if (!isForm) {
            return;
          }

          HelperFunctions.StopEvent(event)

          if (this.kbS.IsCurrentNavigatable(this.buyerFormNav) && this.buyerData) {
            this.dialogService
              .open(EditCustomerDialogComponent, {
                context: {
                  customerId: this.buyerData.id
                }
              })
              .onClose.subscribe(this.onEditCustomer.bind(this))
          }

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
