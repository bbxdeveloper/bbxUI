import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService, NbSortDirection } from '@nebular/theme';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { AttachDirection, NavigatableForm as InlineTableNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
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
import { CreateInvCtrlItemRequest } from '../models/CreateInvCtrlItemRequest';
import { Actions, GetFooterCommandListFromKeySettings, KeyBindings, InvCtrlItemCreatorKeySettings } from 'src/assets/util/KeyBindings';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { GetVatRatesParamListModel } from '../../vat-rate/models/GetVatRatesParamListModel';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { InvCtrlItemForPost, InvCtrlItemLine } from '../models/InvCtrlItem';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { InventoryCtrlItemService } from '../services/inventory-ctrl-item.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { BehaviorSubject } from 'rxjs';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { InventoryService } from '../services/inventory.service';
import { StockService } from '../../stock/services/stock.service';
import { GetStocksParamsModel } from '../../stock/models/GetStocksParamsModel';
import { GetStockRecordParamsModel } from '../../stock/models/GetStockRecordParamsModel';
import { OneButtonMessageDialogComponent } from '../../shared/one-button-message-dialog/one-button-message-dialog.component';
import { GetAllInvCtrlItemRecordsParamListModel } from '../models/GetAllInvCtrlItemRecordsParamListModel';
import { InvCtrlPeriod } from '../models/InvCtrlPeriod';

@Component({
  selector: 'app-inv-ctrl-item-manager',
  templateUrl: './inv-ctrl-item-manager.component.html',
  styleUrls: ['./inv-ctrl-item-manager.component.scss']
})
export class InvCtrlItemManagerComponent extends BaseInlineManagerComponent<InvCtrlItemLine> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  public KeySetting: Constants.KeySettingsDct = InvCtrlItemCreatorKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  offerData!: CreateInvCtrlItemRequest;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  // WareHouse
  invCtrlPeriods: string[] = [];
  invCtrlPeriodValues: { [key: string]: InvCtrlPeriod } = {};
  invCtrlPeriodComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  get SelectedWareHouseId(): number {
    return this.buyerForm.controls['warehouse'].value !== undefined ?
      HelperFunctions.ToInt(this.invCtrlPeriodValues[this.buyerForm.controls['warehouse'].value ?? -1]?.warehouseID) : -1;
  }
  get SelectedInvCtrlPeriod(): InvCtrlPeriod | undefined {
    return this.buyerForm.controls['warehouse'].value !== undefined ?
      this.invCtrlPeriodValues[this.buyerForm.controls['warehouse'].value ?? -1] : undefined;
  }

  override colsToIgnore: string[] = ["lineDescription", "unitOfMeasureX", "unitPrice", "realQty", "difference"];
  override allColumns = [
    'productCode',
    'lineDescription',
    'unitOfMeasureX',
    'unitPrice',
    'realQty',
    'nRealQty',
    'difference',
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
      colWidth: "50%", textAlign: "left",
    },
    { // unitofmeasureX show, post unitofmeasureCode
      label: 'Me.e.', objectKey: 'unitOfMeasureX', colKey: 'unitOfMeasureX',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "80px", textAlign: "right"
    },
    {
      label: 'Nettó Ár', objectKey: 'unitPrice', colKey: 'unitPrice',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Rkt Klt', objectKey: 'realQty', colKey: 'realQty',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Lelt.Klt', objectKey: 'nRealQty', colKey: 'nRealQty',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: false,
    },
    {
      label: 'Eltérés', objectKey: 'difference', colKey: 'difference',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
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
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  get invCtrlDate(): Date | undefined {
    if (!!!this.buyerForm) {
      return undefined;
    }
    const tmp = this.buyerForm.controls['invCtrlDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvCtrlItemLine>>,
    private seInv: InvoiceService,
    private invCtrlItemService: InventoryCtrlItemService,
    private invCtrlPeriodService: InventoryService,
    private seC: CustomerService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    cs: CommonService,
    sts: StatusService,
    private productService: ProductService,
    private utS: UtilityService,
    private router: Router,
    private vatRateService: VatRateService,
    private route: ActivatedRoute,
    private invCtrlPeriodApi: WareHouseService,
    private stockService: StockService
  ) {
    super(dialogService, kbS, fS, cs, sts);
    this.InitialSetup();
  }

  validateInvCtrlDate(control: AbstractControl): any {
    if (!HelperFunctions.IsDateStringValid(control.value) || !!!this.SelectedInvCtrlPeriod
      || !HelperFunctions.IsDateStringValid(this.SelectedInvCtrlPeriod.dateFrom) || !HelperFunctions.IsDateStringValid(this.SelectedInvCtrlPeriod.dateTo)) {
      return null;
    }

    var ctrlPeriod = this.SelectedInvCtrlPeriod;

    let v = new Date(control.value);
    let to = new Date(ctrlPeriod.dateTo);
    let from = new Date(ctrlPeriod.dateFrom);

    let wrong = v > to || v < from;

    return wrong ? { minMaxDate: { value: control.value } } : null;
  }

  InitialSetup(): void {
    this.dbDataTableId = "offers-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    this.offerData = {
      items: []
    } as CreateInvCtrlItemRequest;

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    if (this.buyerForm === undefined) {
      this.buyerForm = new FormGroup({
        warehouse: new FormControl('', [Validators.required]),
        invCtrlDate: new FormControl('', [
          Validators.required,
          this.validateInvCtrlDate.bind(this),
          validDate
        ])
      });
    } else {
      this.buyerForm.reset(undefined);
    }

    this.buyerFormNav = new InlineTableNavigatableForm(
      this.buyerForm,
      this.kbS,
      this.cdref,
      [],
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
        return new InvCtrlItemLine();
      },
      this
    );

    this.dbDataTable!.OuterJump = true;

    // Refresh data
    this.refresh();
  }

  refresh(): void {
    this.refreshComboboxData();
    this.seC.GetAll({ IsOwnData: false }).subscribe({
      next: d => {
        // Products
        this.dbData = [];
        this.dbDataDataSrc.setData(this.dbData);

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
    this.offerData.items = this.dbData.filter((x, index: number) => index !== this.dbData.length - 1).map(x => {
      return {
        "warehouseID": this.SelectedWareHouseId,
        "invCtlPeriodID": HelperFunctions.ToInt(this.invCtrlPeriodValues[this.buyerForm.controls['warehouse'].value ?? -1].id),
        "productID": HelperFunctions.ToInt(x.data.productID),
        "invCtrlDate": this.buyerForm.controls['invCtrlDate'].value,
        "nRealQty": HelperFunctions.ToInt(x.data.nRealQty),
        "userID": HelperFunctions.ToInt(x.data.userID),
      } as InvCtrlItemForPost;
    });
  }

  Save(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const confirmDialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_SAVE_DATA } });
    confirmDialogRef.onClose.subscribe(res => {
      if (res) {
        this.UpdateOutGoingData();

        console.log('Save: ', this.offerData);

        this.isLoading = true;

        this.invCtrlItemService.Create(this.offerData).subscribe({
          next: d => {
            if (!!d.data) {
              console.log('Save response: ', d);

              // if (!!d.data) {
              //   this.FillInvCtrlItemNumberX(d.data.id);
              // }

              this.simpleToastrService.show(
                Constants.MSG_SAVE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
              this.isLoading = false;

              this.dbDataTable.RemoveEditRow();
              this.kbS.SelectFirstTile();

              // this.buyerFormNav.controls['invoiceOrdinal'].setValue(d.data.invoiceNumber ?? '');

              this.Reset();
              return;

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

                        commandEndedSubscription.unsubscribe();
                        this.bbxToastrService.show(
                          `Az árajánlat nyomtatása közben hiba történt.`,
                          Constants.TITLE_ERROR,
                          Constants.TOASTR_ERROR
                        );
                        this.isLoading = false;
                      }
                    });
                    this.isLoading = true;
                    //this.printReport(d.data?.id, res.value);
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

  // printReport(id: any, copies: number): void {
  //   this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_CMD]);
  //   this.utS.execute(
  //     Constants.CommandType.PRINT_OFFER, Constants.FileExtensions.PDF,
  //     {
  //       "section": "Szamla",
  //       "fileType": "pdf",
  //       "report_params":
  //       {
  //         "id": id,
  //         "offerNumber": null
  //       },
  //       // "copies": copies,
  //       "data_operation": Constants.DataOperation.PRINT_BLOB
  //     } as Constants.Dct);
  // }

  protected Reset(): void {
    console.log(`Reset.`);
    this.kbS.ResetToRoot();
    this.InitialSetup();
    this.AfterViewInitSetup();
  }

  protected AfterViewInitSetup(): void {
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
    }, 500);
  }

  InitFormDefaultValues(): void {
    this.buyerForm.controls['invCtrlDate'].setValue(HelperFunctions.GetDateString());
  }

  ChooseDataForTableRow(rowIndex: number): void {
    console.log("Selecting InvoiceLine from avaiable data.");

    console.log("[TableCodeFieldChanged] at rowIndex: ", this.dbDataTable.data[rowIndex])

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    let productId: number = -1;

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

        productId = res.id;

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

              this.dbDataTable.FillCurrentlyEditedRow({ data: InvCtrlItemLine.FromProduct(res, 0, vatRateFromProduct?.id ?? 0) });
              this.kbS.setEditMode(KeyboardModes.NAVIGATION);
              this.dbDataTable.MoveNextInTable();
              setTimeout(() => {
                this.kbS.setEditMode(KeyboardModes.EDIT);
                this.kbS.ClickCurrentElement();
              }, 500);
            } else {
              this.cs.HandleError(d.errors);
              this.isLoading = false;

              this.dbDataTable.FillCurrentlyEditedRow({ data: InvCtrlItemLine.FromProduct(res) });
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

            this.dbDataTable.FillCurrentlyEditedRow({ data: InvCtrlItemLine.FromProduct(res) });
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            this.dbDataTable.MoveNextInTable();
            setTimeout(() => {
              this.kbS.setEditMode(KeyboardModes.EDIT);
              this.kbS.ClickCurrentElement();
            }, 500);
          },
          complete: () => {
            this.isLoading = false;

            if (productId === undefined || productId === -1) {
              return;
            }

            this.invCtrlItemService.GetAllRecords(
              { ProductID: productId, WarehouseID: this.SelectedWareHouseId, InvCtlPeriodID: undefined } as GetAllInvCtrlItemRecordsParamListModel)
              .subscribe({
                next: data => {
                  if (!!data) {
                    const dialogRef = this.dialogService.open(OneButtonMessageDialogComponent, {
                      context: {
                        title: 'Leltár információ',
                        message: `A ${data.product} termék ${data.invCtrlDate} napon leltározva volt, készlet: ${data.nRealQty}.`,
                      }
                    });
                    dialogRef.onClose.subscribe((res: Customer) => { });
                    this.dbDataTable.data[rowIndex].data.nRealQty = data.nRealQty;
                  }
                },
                error: err => { },
                complete: () => { }
              });
            this.stockService.Record({ ProductID: productId, WarehouseID: this.SelectedWareHouseId } as GetStockRecordParamsModel).subscribe({
              next: data => {
                if (!!data) {
                  this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                  this.dbDataTable.data[rowIndex].data.realQty = data.realQty;
                }
              },
              error: err => { },
              complete: () => { }
            });
          }
        });
      }
    });
  }

  ChooseDataForForm(): void {}
  RefreshData(): void {}
  RecalcNetAndVat(): void {}

  HandleGridCodeFieldEnter(row: TreeGridNode<InvCtrlItemLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
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

  protected TableCodeFieldChanged(changedData: any, index: number, row: TreeGridNode<InvCtrlItemLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    console.log("[TableCodeFieldChanged] at rowPos: ", this.dbDataTable.data[rowPos])

    if (!!changedData && !!changedData.productCode && changedData.productCode.length > 0) {
      let productId: number = -1;
      this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: product => {
          console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

          if (!!product && !!product?.productCode) {
            productId = product.id
            this.dbDataTable.FillCurrentlyEditedRow({ data: InvCtrlItemLine.FromProduct(product) });
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
        },
        complete: () => {
          this.isLoading = false;

          if (productId === undefined || productId === -1) {
            return;
          }

          this.invCtrlItemService.GetAllRecords(
            { ProductID: productId, WarehouseID: this.SelectedWareHouseId, InvCtlPeriodID: undefined } as GetAllInvCtrlItemRecordsParamListModel)
          .subscribe({
            next: data => {
              if (!!data) {
                const dialogRef = this.dialogService.open(OneButtonMessageDialogComponent, {
                  context: {
                    title: 'Leltár információ',
                    message: `A ${data.product} termék ${data.invCtrlDate} napon leltározva volt, készlet: ${data.nRealQty}.`,
                  }
                });
                dialogRef.onClose.subscribe((res: Customer) => { });
                this.dbDataTable.data[rowPos].data.nRealQty = data.nRealQty;
              }
            },
            error: err => { },
            complete: () => { }
          });
          this.stockService.Record({ ProductID: productId, WarehouseID: this.SelectedWareHouseId } as GetStockRecordParamsModel).subscribe({
            next: data => {
              if (!!data) {
                this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                this.dbDataTable.data[rowPos].data.realQty = data.realQty;
              }
            },
            error: err => {},
            complete: () => {}
          });
        }
      });
    }
  }

  protected RoundPrices(rowPos: number): void {
    if ((this.dbData.length + 1) <= rowPos) {
      return;
    }
    const d = this.dbData[rowPos]?.data;
    if (!!d) {
      d.Round();
    }
  }

  TableRowDataChanged(changedData?: any, index?: number, col?: string): void {
    if (index !== undefined) {
      this.RoundPrices(index);
    }

    if (!!changedData && !!changedData.productCode) {
      if ((!!col && col === 'productCode') || col === undefined) {
        this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
          next: product => {
            console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

            if (index !== undefined) {
              let tmp = this.dbData[index].data;

              tmp.lineDescription = product.description ?? '';

              tmp.vatRate = product.vatPercentage ?? 0.0;
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
  }

  private refreshComboboxData(): void {
    this.invCtrlPeriodService.GetAll().subscribe({
      next: data => {
        console.log("[refreshComboboxData]: ", data);
        this.invCtrlPeriods =
          data?.data?.map(x => {
            let res = x.warehouse + ' ' + HelperFunctions.GetOnlyDateFromUtcDateString(x.dateFrom) + ' ' + HelperFunctions.GetOnlyDateFromUtcDateString(x.dateTo);
            this.invCtrlPeriodValues[res] = x;
            return res;
          }) ?? [];
        this.invCtrlPeriodComboData$.next(this.invCtrlPeriods);
      }
    });
  }

  CheckSaveConditionsAndSave(): void {
    this.buyerForm.markAllAsTouched();

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

    this.Save();
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      this.CheckSaveConditionsAndSave();
      return;
    }
    switch (event.key) {
      // case this.KeySetting[Actions.ToggleAllDiscounts].KeyCode: {
      //   event.preventDefault();
      //   this.ToggleAllShowDiscount();
      //   break;
      // }
    }
  }
}
