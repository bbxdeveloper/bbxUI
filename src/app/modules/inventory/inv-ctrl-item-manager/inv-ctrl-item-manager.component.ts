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
import { validDate } from 'src/assets/model/Validators';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { ProductService } from '../../product/services/product.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { UtilityService } from 'src/app/services/utility.service';
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
import { BehaviorSubject, lastValueFrom, Subscription } from 'rxjs';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { InventoryService } from '../services/inventory.service';
import { StockService } from '../../stock/services/stock.service';
import { GetStockRecordParamsModel } from '../../stock/models/GetStockRecordParamsModel';
import { OneButtonMessageDialogComponent } from '../../shared/one-button-message-dialog/one-button-message-dialog.component';
import { GetAllInvCtrlItemRecordsParamListModel } from '../models/GetAllInvCtrlItemRecordsParamListModel';
import { InvCtrlPeriod } from '../models/InvCtrlPeriod';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import * as moment from 'moment';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { GetAllInvCtrlPeriodsParamListModel } from '../models/GetAllInvCtrlPeriodsParamListModel';
import { StockRecord } from '../../stock/models/StockRecord';

@Component({
  selector: 'app-inv-ctrl-item-manager',
  templateUrl: './inv-ctrl-item-manager.component.html',
  styleUrls: ['./inv-ctrl-item-manager.component.scss']
})
export class InvCtrlItemManagerComponent extends BaseInlineManagerComponent<InvCtrlItemLine> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  Subscription_Search?: Subscription;

  public KeySetting: Constants.KeySettingsDct = InvCtrlItemCreatorKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  offerData!: CreateInvCtrlItemRequest;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  invCtrlPeriods: string[] = [];
  invCtrlPeriodValues: { [key: string]: InvCtrlPeriod } = {};
  invCtrlPeriodComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  get SelectedWareHouseId(): number {
    return this.buyerForm.controls['invCtrlPeriod'].value !== undefined ?
      HelperFunctions.ToInt(this.invCtrlPeriodValues[this.buyerForm.controls['invCtrlPeriod'].value ?? -1]?.warehouseID) : -1;
  }
  get SelectedInvCtrlPeriod(): InvCtrlPeriod | undefined {
    if (!!this.buyerForm && this.buyerForm.controls !== undefined) {
      return this.buyerForm.controls['invCtrlPeriod'].value !== undefined ?
        this.invCtrlPeriodValues[this.buyerForm.controls['invCtrlPeriod'].value ?? -1] : undefined;
    }
    return undefined;
  }

  get getAllPeriodsParams(): GetAllInvCtrlPeriodsParamListModel {
    return {
      PageSize: 1000
    } as GetAllInvCtrlPeriodsParamListModel;
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
      label: 'Átl. besz', objectKey: 'unitPrice', colKey: 'unitPrice',
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
    private vatRateService: VatRateService,
    private stockService: StockService,
    sideBarService: BbxSidebarService,
    khs: KeyboardHelperService
  ) {
    super(dialogService, kbS, fS, cs, sts, sideBarService, khs);
    this.InitialSetup();
  }

  validateInvCtrlDate(control: AbstractControl): any {
    if (!!!this.SelectedInvCtrlPeriod) {
      return null;
    }

    var ctrlPeriod = this.SelectedInvCtrlPeriod;

    let v = HelperFunctions.GetDateIfDateStringValid(control.value);
    let to = HelperFunctions.GetDateIfDateStringValid(ctrlPeriod?.dateTo);
    let from = HelperFunctions.GetDateIfDateStringValid(ctrlPeriod?.dateFrom);

    if (v === undefined || from === undefined || to === undefined) {
      return null;
    }

    console.log("validateInvCtrlDate: ", from, to, v);

    let wrong = !v.isBetween(from, to, null, '[]');

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
        invCtrlPeriod: new FormControl('', [Validators.required]),
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
    
    this.dbData = [];
    this.dbDataDataSrc.setData(this.dbData);

    this.table?.renderRows();
    this.RefreshTable();

    this.isLoading = false;
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
    this.offerData.items = this.dbDataTable.data.filter((x, index: number) => index !== this.dbDataTable.data.length - 1).map(x => {
      debugger;
      return {
        "warehouseID": this.SelectedWareHouseId,
        "invCtlPeriodID": HelperFunctions.ToInt(this.invCtrlPeriodValues[this.buyerForm.controls['invCtrlPeriod'].value ?? -1].id),
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

              this.simpleToastrService.show(
                Constants.MSG_SAVE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
              this.isLoading = false;

              this.dbDataTable.RemoveEditRow();
              this.kbS.SelectFirstTile();

              this.Reset();
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

    this.buyerForm.controls['invCtrlPeriod'].valueChanges.subscribe({
      next: newValue => {
        const selected = this.SelectedInvCtrlPeriod;
        if (selected?.dateFrom !== undefined && HelperFunctions.IsDateStringValid(selected.dateFrom)) {
          this.buyerForm.controls['invCtrlDate'].setValue(selected.dateFrom)
        }
      }
    });

    // TODO
    if (this.dbDataTable.data.length > 1) {
      this.dbDataTable.data = [this.dbDataTable.data[0]];
      this.dbDataDataSrc.setData(this.dbDataTable.data);
    }
  }

  InitFormDefaultValues(): void {
    this.buyerForm.controls['invCtrlDate'].setValue(HelperFunctions.GetDateString());
  }

  OpenAlreadyInventoryDialog(product: string, dateWithUtc: string, nRealQty: number): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.bbxToastrService.show(
      `A ${product} termék ${HelperFunctions.GetOnlyDateFromUtcDateString(dateWithUtc)} napon leltározva volt, leltári készlet: ${(new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(nRealQty)).replace(",", ".")}.`,
      'Leltár információ',
      Constants.TOASTR_ERROR
    );
    // const dialogRef = this.dialogService.open(OneButtonMessageDialogComponent, {
    //   context: {
    //     title: 'Leltár információ',
    //     message: `A ${product} termék ${HelperFunctions.GetOnlyDateFromUtcDateString(dateWithUtc)} napon leltározva volt, leltári készlet: ${(new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(nRealQty)).replace(",", ".")}.`,
    //   }
    // });
    // dialogRef.onClose.subscribe(() => { });
  }

  async HandleProductSelectionFromDialog(res: Product, rowIndex: number) {
    this.isLoading = true;

    if (res.id === undefined || res.id === -1) {
      return;
    }

    if (this.dbDataTable.data.findIndex(x => x.data?.productID === res.id) > -1) {
      this.bbxToastrService.show(
        Constants.MSG_PRODUCT_ALREADY_THERE,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.invCtrlItemService.GetAllRecords(
      { ProductID: res.id, InvCtlPeriodID: this.SelectedInvCtrlPeriod?.id } as GetAllInvCtrlItemRecordsParamListModel)
      .subscribe({
        next: data => {
          if (!!data && data.id !== 0) {
            this.OpenAlreadyInventoryDialog((res.productCode + ' ' + res.description) ?? "", data.invCtrlDate, data.nRealQty);
            this.dbDataTable.data[rowIndex].data.nRealQty = data.nRealQty;
          }
        },
        error: () => { },
        complete: () => {
          this.isLoading = false;
        }
      });

    this.isLoading = true;

    const stockRecord = await this.GetStockRecordForProduct(res.id);

    let price = res.latestSupplyPrice;
    if (stockRecord && stockRecord.id !== 0 && stockRecord.id !== undefined) {
      price = stockRecord.avgCost;
      // this.kbS.setEditMode(KeyboardModes.NAVIGATION);
      this.dbDataTable.data[rowIndex].data.realQty = stockRecord.realQty;
    }

    this.dbDataTable.FillCurrentlyEditedRow({ data: InvCtrlItemLine.FromProduct(res, 0, 0, price) });

    console.log("after HandleProductSelectionFromDialog: ", this.dbDataTable.data[rowIndex]);

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.dbDataTable.MoveNextInTable();
    setTimeout(() => {
      this.kbS.setEditMode(KeyboardModes.EDIT);
      this.isLoading = false;
      this.kbS.ClickCurrentElement();
    }, 500);

    return;
  }

  ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    console.log("Selecting InvoiceLine from avaiable data.");

    console.log("[ChooseDataForTableRow] at rowIndex: ", this.dbDataTable.data[rowIndex])

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.dbDataTable.editedRow?.data.productCode ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs
      }
    });
    dialogRef.onClose.subscribe(async (res: Product) => {
      this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
      console.log("ChooseDataForTableRow Selected item: ", res);
      if (!!res) {
        if (!wasInNavigationMode) {
          await this.HandleProductSelectionFromDialog(res, rowIndex);
        } else {
          const index = this.dbDataTable.data.findIndex(x => x.data.productCode === res.productCode);
          if (index !== -1) {
            this.kbS.SelectElementByCoordinate(0, index);
          }
        }
      }
      this.sts.pushProcessStatus(Constants.BlankProcessStatus);
    });
  }

  ChooseDataForForm(): void {}
  RefreshData(): void {}
  RecalcNetAndVat(): void {}

  HandleGridCodeFieldEnter(event: any, row: TreeGridNode<InvCtrlItemLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    
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

  private async GetStockRecordForProduct(productId: number): Promise<StockRecord> {
    return lastValueFrom(this.stockService.Record({ ProductID: productId, WarehouseID: this.SelectedWareHouseId } as GetStockRecordParamsModel));
  }

  protected TableCodeFieldChanged(changedData: any, index: number, row: TreeGridNode<InvCtrlItemLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    console.log("[TableCodeFieldChanged] at rowPos: ", this.dbDataTable.data[rowPos]);

    let alreadyAdded = false;

    if (!!changedData && !!changedData.productCode && changedData.productCode.length > 0) {
      let _product: Product = { id: -1 } as Product;
      this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
      this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: async product => {
          console.log('[TableCodeFieldChanged] res: ', changedData, ' | Product: ', product);

          if (!!product && !!product?.productCode) {
            _product = product;

            if (this.dbDataTable.data.findIndex(x => x.data?.productID === _product.id) > -1) {
              alreadyAdded = true;
              this.bbxToastrService.show(
                Constants.MSG_PRODUCT_ALREADY_THERE,
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR
              );
            } else {
              const stockRecord = await this.GetStockRecordForProduct(product.id);

              let price = product.latestSupplyPrice;
              if (stockRecord && stockRecord.id !== 0 && stockRecord.id !== undefined) {
                price = stockRecord.avgCost;
              }

              this.dbDataTable.FillCurrentlyEditedRow({ data: InvCtrlItemLine.FromProduct(product, 0, 0, price) });
              console.log("after TableCodeFieldChanged: ", this.dbDataTable.data);
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
        },
        error: () => {
          this.RecalcNetAndVat();
        },
        complete: async () => {
          this.isLoading = false;

          if (_product.id === undefined || _product.id === -1 || alreadyAdded) {
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            return;
          }

          await lastValueFrom(this.invCtrlItemService.GetAllRecords(
            { ProductID: _product.id, InvCtlPeriodID: this.SelectedInvCtrlPeriod?.id } as GetAllInvCtrlItemRecordsParamListModel))
          .then(data => {
              if (!!data && data.id !== 0) {
                this.OpenAlreadyInventoryDialog((_product?.productCode + ' ' + _product?.description) ?? "", data.invCtrlDate, data.nRealQty);
                this.dbDataTable.data[rowPos].data.nRealQty = data.nRealQty;
              }    
            }
          );

          const stockRecord = await this.GetStockRecordForProduct(_product.id);
          if (stockRecord && stockRecord.id !== 0) {
            console.log("STOCKRECORD");
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            this.dbDataTable.data[rowPos].data.realQty = stockRecord.realQty;
          }

          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
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

              tmp.productID = product.id;

              this.dbData[index].data = tmp;

              this.dbDataDataSrc.setData(this.dbData);

              console.log("after TableRowDataChanged: ", this.dbDataTable.data);
            }

            this.RecalcNetAndVat();
          },
          error: () => {
            this.RecalcNetAndVat();
          }
        });
      }
    }
  }

  private refreshComboboxData(): void {
    this.invCtrlPeriodService.GetAll(this.getAllPeriodsParams).subscribe({
      next: data => {
        console.log("[refreshComboboxData]: ", data);
        this.invCtrlPeriods =
          data?.data?.filter(x => !x.closed).map(x => {
            let res = x.warehouse + ' ' + HelperFunctions.GetOnlyDateFromUtcDateString(x.dateFrom) + ' ' + HelperFunctions.GetOnlyDateFromUtcDateString(x.dateTo);
            this.invCtrlPeriodValues[res] = x;
            return res;
          }) ?? [];
        this.invCtrlPeriodComboData$.next(this.invCtrlPeriods);
        setTimeout(() => {
          if (this.invCtrlPeriods.length > 0) {
            this.buyerForm.controls['invCtrlPeriod'].setValue(this.invCtrlPeriods[0]);
          }
        }, 100);
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
      // case this.KeySetting[Actions.ToggleAllDiscounts].KeyCode: {
      //   event.preventDefault();
      //   this.ToggleAllShowDiscount();
      //   break;
      // }
    }
  }
}
