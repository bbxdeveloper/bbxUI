import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NbTable, NbTreeGridDataSourceBuilder, NbSortDirection } from '@nebular/theme';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IInlineManager, ManagerResponse } from 'src/assets/model/IInlineManager';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { AttachDirection, NavigatableForm as InlineTableNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { validDate } from 'src/assets/model/Validators';
import { Constants } from 'src/assets/util/Constants';
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { ProductService } from '../../product/services/product.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { ProductSelectTableDialogComponent } from '../../shared/dialogs/product-select-table-dialog/product-select-table-dialog.component';
import { CreateInvCtrlItemRequest } from '../models/CreateInvCtrlItemRequest';
import { Actions, GetFooterCommandListFromKeySettings, KeyBindings, InvCtrlItemCreatorKeySettings } from 'src/assets/util/KeyBindings';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { InvCtrlItemForPost, InvCtrlItemLine } from '../models/InvCtrlItem';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { InventoryCtrlItemService } from '../services/inventory-ctrl-item.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { BehaviorSubject, lastValueFrom, Subscription } from 'rxjs';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { InventoryService } from '../services/inventory.service';
import { StockService } from '../../stock/services/stock.service';
import { GetStockRecordParamsModel } from '../../stock/models/GetStockRecordParamsModel';
import { GetAllInvCtrlItemRecordsParamListModel } from '../models/GetAllInvCtrlItemRecordsParamListModel';
import { InvCtrlPeriod } from '../models/InvCtrlPeriod';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { GetAllInvCtrlPeriodsParamListModel } from '../models/GetAllInvCtrlPeriodsParamListModel';
import { StockRecord } from '../../stock/models/StockRecord';
import { selectProcutCodeInTableInput, TableKeyDownEvent, isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { ProductStockInformationDialogComponent } from '../../shared/dialogs/product-stock-information-dialog/product-stock-information-dialog.component';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { environment } from 'src/environments/environment';
import { ConfirmationWithAuthDialogComponent } from '../../shared/simple-dialogs/confirmation-with-auth-dialog/confirmation-with-auth-dialog.component';
import { TokenStorageService } from '../../auth/services/token-storage.service';

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
    return HelperFunctions.ToInt(this.tokenService.wareHouse?.id)
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
      PageSize: 1000,
      OrderBy: 'warehouse'
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
    return !this.kbS.isEditModeActivated;
  }

  get invCtrlDate(): Date | undefined {
    if (!!!this.buyerForm) {
      return undefined;
    }
    const tmp = this.buyerForm.controls['invCtrlDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  //#region AutoSave

  public unsavedRows: TreeGridNode<InvCtrlItemLine>[] = []
  private autoSaveAmount: number = environment.inventoryItemManagerAutoSaveAmount
  private autoSaveEnabled: boolean = environment.inventoryItemManagerAutoSaveEnabled

  //#endregion AutoSave

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvCtrlItemLine>>,
    private invCtrlItemService: InventoryCtrlItemService,
    private invCtrlPeriodService: InventoryService,
    private seC: CustomerService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    cs: CommonService,
    sts: StatusService,
    private productService: ProductService,
    private stockService: StockService,
    sideBarService: BbxSidebarService,
    khs: KeyboardHelperService,
    router: Router,
    private route: ActivatedRoute,
    private statusService: StatusService,
    private tokenService: TokenStorageService
  ) {
    super(dialogService, kbS, fS, cs, sts, sideBarService, khs, router);
    this.preventF12 = true
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

    if (this.autoSaveEnabled) {
      this.dbDataTable.rowDeleted.subscribe({
        next: (info: [any, number]) => this.checkAutoSave(info, Constants.RowChangeTypes.Delete),
        error: e => this.cs.HandleError(e)
      })
      this.dbDataTable.rowModified.subscribe({
        next: (info: [any, number]) => this.handleUnsaved(info[0], info[1]),
        error: e => this.cs.HandleError(e)
      })
    }

    // Refresh data
    this.refresh();
  }

  checkAutoSave(rowChangeInfo: [any, number], change: Constants.RowChangeTypes): void {
    if (!(rowChangeInfo === undefined || rowChangeInfo[0] === undefined || rowChangeInfo[1] === undefined)) {
      const row = rowChangeInfo[0]
      const newLength = rowChangeInfo[1]
      switch (change) {
        case Constants.RowChangeTypes.Add:
          this.unsavedRows.push(row)
          break
        case Constants.RowChangeTypes.Delete:
          const unSavedIndex = this.unsavedRows.findIndex(x => x.data.productID === row.data.productID)
          if (unSavedIndex > -1) {
            this.unsavedRows.splice(unSavedIndex, 1)
          }
          return
        case Constants.RowChangeTypes.Modify:
        default:
          break
      }
    }

    if (this.unsavedRows.length === 0) {
      return
    }

    if (this.unsavedRows.length % this.autoSaveAmount === 0) {
      const idForDelete = []
      for (let i = 0; i < this.unsavedRows.length; i++) {
        const update = this.dbDataTable.data.find(x => x.data.productID === this.unsavedRows[i].data.productID)
        if (update !== undefined) {
          this.unsavedRows[i] = update
        } else {
          idForDelete.push(this.unsavedRows[i].data.productID)
        }
      }
      idForDelete.forEach(y => this.unsavedRows.splice(this.unsavedRows.findIndex(x => x.data.productID === y), 1))

      if (this.unsavedRows.length % this.autoSaveAmount === 0) {
        const unfinished = this.unsavedRows.find(x => x.data.IsUnfinished())
        if (unfinished === undefined && this.CheckSaveConditionsAndSave(true, this.unsavedRows)) {
          this.unsavedRows = []
        }
      }
    }
  }

  handleUnsaved(row: TreeGridNode<InvCtrlItemLine>, rowPos: number): void {
    if (row === undefined) {
      this.checkAutoSave([undefined, this.dbDataTable.data.length], Constants.RowChangeTypes.Modify)
    }

    let deletedRows: any[] = []
    this.unsavedRows.forEach(x => {
      if (this.dbDataTable.data.findIndex(y => y.data.productID == x.data.productID) === -1) {
        deletedRows.push(x.data.productID)
      }
    })
    deletedRows.forEach(x => {
      this.unsavedRows.splice(this.unsavedRows.findIndex(y => y.data.productID === x), 1)
    })

    if (this.unsavedRows.length >= this.autoSaveAmount && rowPos === this.dbDataTable.data.length - 1) {
      this.checkAutoSave([row, this.dbDataTable.data.length], Constants.RowChangeTypes.Modify)
    }

    if (!this.autoSaveEnabled || row?.data === undefined || row?.data.IsUnfinished()) {
      return
    }

    const index = this.unsavedRows.findIndex(x => x.data.productID === row.data.productID)
    if (index > -1) {
      this.unsavedRows[index] = row
    } else {
      this.unsavedRows.push(row)
    }
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

  private filterItem(item: any, array: any[]) {
    return array.find(x => x.data.productID === item.data.productID) !== undefined
  }

  private UpdateOutGoingData(saveFilter: TreeGridNode<InvCtrlItemLine>[] = []): void {
    const itemFilter = saveFilter
    this.offerData.items = this.dbDataTable.data
      .filter((x, index: number) => index !== this.dbDataTable.data.length - 1 && (itemFilter.length === 0 || this.filterItem(x, itemFilter)))
      .map(x => {
        return {
          "warehouseID": this.SelectedWareHouseId,
          "invCtlPeriodID": HelperFunctions.ToInt(this.invCtrlPeriodValues[this.buyerForm.controls['invCtrlPeriod'].value ?? -1].id),
          "productID": HelperFunctions.ToInt(x.data.productID),
          "invCtrlDate": this.buyerForm.controls['invCtrlDate'].value,
          "nRealQty": Number(x.data.nRealQty.toString().replace(/\s/, '')),
          "userID": HelperFunctions.ToInt(x.data.userID),
        } as InvCtrlItemForPost;
      });
  }

  Save(autoSave: boolean = false, saveFilter: TreeGridNode<InvCtrlItemLine>[] = []): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    if (!autoSave) {
      const confirmDialogRef = this.dialogService.open(ConfirmationWithAuthDialogComponent, { context: { title: Constants.MSG_CONFIRMATION_SAVE_DATA } });
      confirmDialogRef.onClose.subscribe(res => {
        if (res) {
          this.statusService.waitForSave(true)
          this.ProcessSave(autoSave)
        }
      })
    } else {
      this.statusService.waitForAutoSave(true)
      this.ProcessSave(autoSave, saveFilter)
    }
  }

  ProcessSave(autoSave: boolean = false, saveFilter: TreeGridNode<InvCtrlItemLine>[] = []): void {
    this.UpdateOutGoingData(saveFilter);

    console.log('Save: ', this.offerData);

    this.invCtrlItemService.Create(this.offerData).subscribe({
      next: d => {
        try {
          if (!!d.data) {
            console.log('Save response: ', d);

            this.bbxToastrService.showSuccess(Constants.MSG_SAVE_SUCCESFUL, true);
            this.statusService.waitForAutoSave(false)

            if (!autoSave) {
              this.dbDataTable.RemoveEditRow();
              this.kbS.SelectFirstTile();
              this.Reset()
            } else {
              this.kbS.ClickCurrentElement()
            }

            if (!autoSave) {
            }
          } else {
            this.statusService.waitForAutoSave(false)
            this.cs.HandleError(d.errors);
          }
        } catch (error) {
          this.statusService.waitForAutoSave(false)
          if (!autoSave) {
            this.Reset()
          }
          this.cs.HandleError(error)
        }
      },
      error: err => {
        this.statusService.waitForAutoSave(false)
        this.cs.HandleError(err);
      },
      complete: () => {
        this.statusService.waitForAutoSave(false)
      }
    })
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

      if (this.route.snapshot.queryParamMap.has('reload')) {
        this.kbS.SetCurrentNavigatable(this.dbDataTable)
        this.kbS.ClickCurrentElement()
      }
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
  }

  async HandleProductSelection(res: Product, rowIndex: number, checkIfCodeEqual: boolean = true) {
    if (res.id === undefined || res.id === -1) {
      return;
    }

    this.isLoading = true;

    let row = this.dbDataTable.data[rowIndex];
    let count = this.dbDataTable.data.filter(x => x.data.productCode === res.productCode).length;
    if (count > 1 || (count === 1 && res.productCode !== row.data.productCode)) {
      this.dbDataTable.editedRow!.data.productCode = "";
      this.kbS.ClickCurrentElement();
      this.bbxToastrService.showError(Constants.MSG_PRODUCT_ALREADY_THERE);
      this.isLoading = false;
      return;
    }

    if (checkIfCodeEqual && res.productCode === row.data.productCode) {
      this.isLoading = false;
      return;
    }

    let nRealQtyFromRecord = 0.0;
    this.isLoading = true;
    await lastValueFrom(
      this.invCtrlItemService.GetAllRecords(
        { ProductID: res.id, InvCtlPeriodID: this.SelectedInvCtrlPeriod?.id } as GetAllInvCtrlItemRecordsParamListModel
    ))
      .then(data => {
        if (!!data && data.id !== 0) {
          this.OpenAlreadyInventoryDialog((res.productCode + ' ' + res.description) ?? "", data.invCtrlDate, data.nRealQty);
          nRealQtyFromRecord = data.nRealQty;
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => {
        this.isLoading = false;
      });

    this.isLoading = true;
    let price = res.latestSupplyPrice;
    let realQty = 0
    const productStocks = await this.stockService.getProductStock(res.id)
    if (productStocks && productStocks.length > 0) {
      const productStock = productStocks.find(x => x.warehouseID === this.SelectedWareHouseId)
      if (productStock && productStock.id !== undefined && productStock.id !== 0) {
        realQty = productStock.realQty;
        price = productStock.avgCost;
      }
    }

    let currentRow = this.dbDataTable.FillCurrentlyEditedRow({ data: InvCtrlItemLine.FromProduct(res, 0, 0, price, nRealQtyFromRecord, realQty) }, ['productCode']);
    currentRow?.data.Save('productCode');

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

  async HandleProductChoose(res: Product, wasInNavigationMode: boolean, rowIndex: number): Promise<void> {
    if (!!res) {
      this.status.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
      if (!wasInNavigationMode) {
        await this.HandleProductSelection(res, rowIndex);
      } else {
        const index = this.dbDataTable.data.findIndex(x => x.data.productCode === res.productCode);
        if (index !== -1) {
          this.kbS.SelectElementByCoordinate(0, index);
        }
      }
    }
    this.status.pushProcessStatus(Constants.BlankProcessStatus);
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
      console.log("ChooseDataForTableRow Selected item: ", res);
      await this.HandleProductChoose(res, wasInNavigationMode, rowIndex);
    });
  }

  ChooseDataForCustomerForm(): void {}
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
        this.handleUnsaved(this.dbDataTable.data[rowPos], rowPos)
      }, 50);
    } else {
      this.TableCodeFieldChanged(row.data, rowPos, row, rowPos, objectKey, colPos, inputId, fInputType);
    }
  }

  private async GetStockRecordForProduct(productId: number): Promise<StockRecord> {
    return lastValueFrom(this.stockService.Record({ ProductID: productId, WarehouseID: this.SelectedWareHouseId } as GetStockRecordParamsModel));
  }

  protected TableCodeFieldChanged(changedData: any, index: number, row: TreeGridNode<InvCtrlItemLine>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    console.log("[TableCodeFieldChanged] at rowPos: ", this.dbDataTable.data[rowPos])

    const previousValue = this.dbDataTable.data[rowPos].data?.GetSavedFieldValue('productCode')
    if (changedData?.productCode === previousValue) {
      this.handleUnsaved(this.dbDataTable.data[rowPos], rowPos)
      return
    }

    if (!!changedData && !!changedData.productCode && changedData.productCode.length > 0) {
      let _product: Product = { id: -1 } as Product;
      this.status.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
      this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: async product => {
          console.log('[TableCodeFieldChanged] res: ', changedData, ' | Product: ', product);

          if (!!product && !!product?.productCode) {
            _product = product;
            await this.HandleProductSelection(_product, rowPos, false)
          } else {
            selectProcutCodeInTableInput()
            this.bbxToastrService.showError(Constants.MSG_NO_PRODUCT_FOUND);
          }
        },
        error: () => {
          this.dbDataTable.data[rowPos].data.Restore('productCode');
          this.RecalcNetAndVat();
        },
        complete: async () => {
          this.isLoading = false;
          this.handleUnsaved(this.dbDataTable.data[rowPos], rowPos)
          this.status.pushProcessStatus(Constants.BlankProcessStatus);
        }
      })
    } else {
      this.handleUnsaved(this.dbDataTable.data[rowPos], rowPos)
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

  TableRowDataChanged(changedData?: any, index?: number, col?: string): ManagerResponse {
    if (index !== undefined) {
      this.RoundPrices(index);
    }

    if (!!changedData && !!changedData.productCode) {
      if ((!!col && col === 'productCode') || col === undefined) {
        this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
          next: product => {
            //console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

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

              //console.log("after TableRowDataChanged: ", this.dbDataTable.data);
            }

            this.RecalcNetAndVat();
          },
          error: () => {
            this.RecalcNetAndVat();
          }
        });
      }
    }

    return new ManagerResponse()
  }

  private refreshComboboxData(): void {
    this.invCtrlPeriodService.GetAll(this.getAllPeriodsParams).subscribe({
      next: data => {
        console.log("[refreshComboboxData]: ", data);
        this.invCtrlPeriods =
          data?.data?.filter(x => !x.closed && x.warehouseID === this.tokenService.wareHouse?.id).map(x => {
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

  CheckSaveConditionsAndSave(autoSave: boolean = false, saveFilter: TreeGridNode<InvCtrlItemLine>[] = []): boolean {
    this.buyerForm.markAllAsTouched()

    if (this.buyerForm.invalid) {
      this.bbxToastrService.show(
        `Az űrlap hibásan vagy hiányosan van kitöltve.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return false
    }

    const finishedItems = this.dbData.find(x => !x.data.IsUnfinished())
    if (finishedItems === undefined) {
      this.bbxToastrService.show(
        `Legalább egy érvényesen megadott tétel szükséges a mentéshez.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return false
    }

    this.Save(autoSave, saveFilter)

    return true
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
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable) && !!this.dbDataTable.GetEditedRow()) {
      switch (event.key) {
        case this.KeySetting[Actions.EscapeEditor1].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          event.preventDefault();
          this.dbDataTable.GetEditedRow()?.data.Restore('productCode');
          return;
        }
      }
    } else {
      switch (event.key) {
        case KeyBindings.F11: {
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
          break
        }
      }
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
        case this.KeySetting[Actions.Refresh].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event)
            return
          }
          _event.preventDefault()

          if (this.kbS.p.y === this.dbData.length - 1) {
            break
          }

          const productCode = this.dbData[this.kbS.p.y].data.productCode
          this.openProductStockInformationDialog(productCode)
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
            return this.HandleProductChoose(product, event.WasInNavigationMode, event.RowPos);
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
  }

}
