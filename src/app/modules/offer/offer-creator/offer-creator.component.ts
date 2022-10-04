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
import { OneTextInputDialogComponent } from '../../shared/one-text-input-dialog/one-text-input-dialog.component';
import { InvoiceLine } from '../../invoice/models/InvoiceLine';
import { ProductSelectTableDialogComponent } from '../../invoice/product-select-table-dialog/product-select-table-dialog.component';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { CreateOfferRequest } from '../models/CreateOfferRequest';
import { OfferLine, OfferLineForPost } from '../models/OfferLine';
import { OfferService } from '../services/offer.service';
import { Actions, GetFooterCommandListFromKeySettings, KeyBindings, OfferCreatorKeySettings } from 'src/assets/util/KeyBindings';
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
import { InputBlurredEvent } from '../../shared/inline-editable-table/inline-editable-table.component';

@Component({
  selector: 'app-offer-creator',
  templateUrl: './offer-creator.component.html',
  styleUrls: ['./offer-creator.component.scss']
})
export class OfferCreatorComponent extends BaseOfferEditorComponent implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') override table?: NbTable<any>;

  public KeySetting: Constants.KeySettingsDct = OfferCreatorKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  offerData!: CreateOfferRequest;

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
    utS: UtilityService,
    router: Router,
    vatRateService: VatRateService,
    route: ActivatedRoute,
    sidebarService: BbxSidebarService,
    khs: KeyboardHelperService,
    custDiscountService: CustomerDiscountService
  ) {
    super(
      dialogService, fS, dataSourceBuilder, seInv, offerService,
      seC, cdref, kbS, bbxToastrService, simpleToastrService, cs,
      sts, productService, utS, router, vatRateService, route, sidebarService, khs, custDiscountService
    );
    this.InitialSetup();
  }

  public inlineInputBlurred(inputBlurredEvent: InputBlurredEvent): void {
    this.dbData[inputBlurredEvent.RowPos].data.ReCalc(inputBlurredEvent.ObjectKey === "unitPrice");
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
      offerNetAmount: 0
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

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
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

    this.offerData.offerLines = this.dbData.filter(x => !x.data.IsUnfinished()).map(x => {
      return {
        productCode: x.data.productCode,
        lineDescription: x.data.lineDescription,
        vatRateCode: x.data.vatRateCode,
        unitPrice: x.data.UnitPriceForCalc,
        unitVat: this.ToFloat(x.data.unitVat),
        unitGross: this.ToFloat(x.data.unitGross),
        discount: x.data.DiscountForCalc,
        showDiscount: x.data.showDiscount,
        unitOfMeasure: x.data.unitOfMeasure,
        quantity: HelperFunctions.ToFloat(x.data.quantity)
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
        this.UpdateOutGoingData();

        console.log('Save: ', this.offerData);

        this.isLoading = true;

        this.offerService.Create(this.offerData).subscribe({
          next: d => {
            if (!!d.data) {
              console.log('Save response: ', d);

              if (!!d.data) {
                this.FillOfferNumberX(d.data.id);
              }

              this.simpleToastrService.show(
                Constants.MSG_SAVE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
              this.isLoading = false;

              this.dbDataTable.RemoveEditRow();
              this.kbS.SelectFirstTile();

              // this.buyerFormNav.controls['invoiceOrdinal'].setValue(d.data.invoiceNumber ?? '');

              const dialogRef = this.dialogService.open(OneTextInputDialogComponent, {
                context: {
                  title: 'Ajánlat Nyomtatása',
                  inputLabel: 'Példányszám',
                  defaultValue: 1
                }
              });
              dialogRef.onClose.subscribe({
                next: res => {

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
                    this.printReport(d.data?.id, res.value);
                  } else {
                    this.simpleToastrService.show(
                      `Az árajánlat számla nyomtatása nem történt meg.`,
                      Constants.TITLE_INFO,
                      Constants.TOASTR_SUCCESS_5_SEC
                    );
                    this.isLoading = false;
                  }
                }
              });
            } else {
              this.cs.HandleError(d.errors);
              this.isLoading = false;
            }
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
    });
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
    dialogRef.onClose.subscribe((res: Product) => {
      console.log("Selected item: ", res);
      if (!!res) {
        this.isLoading = true;

        this.vatRateService.GetAll({} as GetVatRatesParamListModel).subscribe({
          next: d => {
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

              this.custDiscountService.GetByCustomer({ CustomerID: this.buyerData.id ?? -1 }).subscribe({
                next: data => {
                  this.dbDataTable.FillCurrentlyEditedRow({ data: OfferLine.FromProduct(res, 0, vatRateFromProduct?.id ?? 0) });
                  const _d = this.dbData[rowIndex].data;
                  this.dbData[rowIndex].data.discount = data.find(x => _d.productGroup.split("-")[0] === x.productGroupCode)?.discount ?? 0;
                  this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                  this.dbDataTable.MoveNextInTable();
                  setTimeout(() => {
                    this.kbS.setEditMode(KeyboardModes.EDIT);
                    this.kbS.ClickCurrentElement();
                  }, 500);
                },
                error: err => {
                  this.cs.HandleError(d.errors);

                  this.dbDataTable.FillCurrentlyEditedRow({ data: OfferLine.FromProduct(res, 0, vatRateFromProduct?.id ?? 0) });
                  this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                  this.dbDataTable.MoveNextInTable();
                  setTimeout(() => {
                    this.kbS.setEditMode(KeyboardModes.EDIT);
                    this.kbS.ClickCurrentElement();
                  }, 500);
                },
                complete: () => {}
              });
            } else {
              this.cs.HandleError(d.errors);
              this.isLoading = false;

              this.dbDataTable.FillCurrentlyEditedRow({ data: OfferLine.FromProduct(res) });
              this.kbS.setEditMode(KeyboardModes.NAVIGATION);
              this.dbDataTable.MoveNextInTable();
              setTimeout(() => {
                this.kbS.setEditMode(KeyboardModes.EDIT);
                this.kbS.ClickCurrentElement();
              }, 500);
            }
          },
          error: err => {
            this.cs.HandleError(err);
            this.isLoading = false;

            this.dbDataTable.FillCurrentlyEditedRow({ data: OfferLine.FromProduct(res) });
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            this.dbDataTable.MoveNextInTable();
            setTimeout(() => {
              this.kbS.setEditMode(KeyboardModes.EDIT);
              this.kbS.ClickCurrentElement();
            }, 500);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
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
    switch (event.key) {
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
