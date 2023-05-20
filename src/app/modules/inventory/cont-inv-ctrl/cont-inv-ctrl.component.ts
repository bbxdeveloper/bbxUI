import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { Product } from '../../product/models/Product';
import { ProductService } from '../../product/services/product.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { ProductSelectTableDialogComponent } from '../../shared/product-select-table-dialog/product-select-table-dialog.component';
import { CreateInvCtrlItemRequest } from '../models/CreateInvCtrlItemRequest';
import { Actions, GetFooterCommandListFromKeySettings, KeyBindings, InvCtrlItemCreatorKeySettings } from 'src/assets/util/KeyBindings';
import { ConfirmationDialogComponent } from '../../shared/simple-dialogs/confirmation-dialog/confirmation-dialog.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { Router } from '@angular/router';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { InvCtrlItemLine } from '../models/InvCtrlItem';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { InventoryCtrlItemService } from '../services/inventory-ctrl-item.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { lastValueFrom, Subscription } from 'rxjs';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { StockService } from '../../stock/services/stock.service';
import { GetStockRecordParamsModel } from '../../stock/models/GetStockRecordParamsModel';
import { GetAllInvCtrlItemRecordsParamListModel } from '../models/GetAllInvCtrlItemRecordsParamListModel';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { GetAllInvCtrlPeriodsParamListModel } from '../models/GetAllInvCtrlPeriodsParamListModel';
import { StockRecord } from '../../stock/models/StockRecord';
import { TableKeyDownEvent, isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import moment from 'moment';
import { GetLatestIccRequest } from '../models/GetLatestIccRequest';
import { CreateIccRequest } from '../models/CreateIccRequest';
import { TokenStorageService } from '../../auth/services/token-storage.service';

@Component({
  selector: 'app-cont-inv-ctrl',
  templateUrl: './cont-inv-ctrl.component.html',
  styleUrls: ['./cont-inv-ctrl.component.scss']
})
export class ContInvCtrlComponent extends BaseInlineManagerComponent<InvCtrlItemLine> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  Subscription_Search?: Subscription;

  public KeySetting: Constants.KeySettingsDct = InvCtrlItemCreatorKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  offerData!: CreateInvCtrlItemRequest;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  get SelectedWareHouseId(): number {
    return -1
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

  dateForm!: FormGroup;
  dateFormId: string = "buyer-form";
  dateFormNav!: InlineTableNavigatableForm;

  private tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  get invCtrlDate(): Date | undefined {
    if (!!!this.dateForm) {
      return undefined;
    }
    const tmp = this.dateForm.controls['invCtrlDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvCtrlItemLine>>,
    private readonly invCtrlItemService: InventoryCtrlItemService,
    private readonly cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private readonly bbxToastrService: BbxToastrService,
    private readonly simpleToastrService: NbToastrService,
    cs: CommonService,
    sts: StatusService,
    private readonly productService: ProductService,
    private readonly stockService: StockService,
    sideBarService: BbxSidebarService,
    khs: KeyboardHelperService,
    router: Router,
    private readonly tokenService: TokenStorageService
  ) {
    super(dialogService, kbS, fS, cs, sts, sideBarService, khs, router);

    this.initialSetup();
  }

  validateInvCtrlDate(control: AbstractControl): ValidationErrors | null {
    if (control.value === '')
      return null

    const value = moment(control.value)
    const today = moment()
    const oneWeek = moment().subtract(7, 'days')

    return value.isAfter(today) || value.isBefore(oneWeek)
      ? { minMaxDate: { value: control.value } }
      : null
  }

  private initialSetup(): void {
    this.dbDataTableId = "offers-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    this.offerData = {
      items: []
    } as CreateInvCtrlItemRequest;

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dateForm = new FormGroup({
      invCtrlDate: new FormControl('', [
        Validators.required,
        this.validateInvCtrlDate.bind(this),
        validDate
      ])
    });

    this.dateFormNav = new InlineTableNavigatableForm(
      this.dateForm,
      this.kbS,
      this.cdref,
      [],
      this.dateFormId,
      AttachDirection.DOWN,
      this
    );

    this.dateFormNav!.OuterJump = true;

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

    this.dbDataTable.OuterJump = true;

    this.isLoading = false
  }

  refresh(): void {
    this.dbData = [];
    this.dbDataDataSrc.setData(this.dbData);

    this.table?.renderRows();
    this.RefreshTable();
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

  Save(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const confirmDialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_SAVE_DATA } });
    confirmDialogRef.onClose.subscribe(async res => {
      if (!res)
        return

      console.log('Save: ', this.offerData);

      try {
        this.isSaveInProgress = true;
        this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING])

        const request = this.dbDataTable.data
          .map(x => ({
            warehouseCode: this.tokenService.wareHouse?.warehouseCode,
            productID: x.data.productID,
            nRealQty: parseInt(x.data.nRealQty.toString()),
            invCtrlDate: moment().format('YYYY-MM-DD').toString(),
            userID: this.tokenService.user?.id
          } as CreateIccRequest))
          .filter(x => x.productID !== 0)

        await this.invCtrlItemService.createIcc(request)

        this.simpleToastrService.show(
          Constants.MSG_SAVE_SUCCESFUL,
          Constants.TITLE_INFO,
          Constants.TOASTR_SUCCESS_5_SEC
        );

        this.refresh()

        setTimeout(() => {
          this.kbS.SetCurrentNavigatable(this.dbDataTable)
          this.kbS.SelectFirstTile()
        }, 250)
      } catch (error) {
        this.cs.HandleError(error)
      } finally {
        this.isSaveInProgress = false
        this.sts.pushProcessStatus(Constants.BlankProcessStatus)
      }
    });
  }

  protected AfterViewInitSetup(): void {
    this.InitFormDefaultValues();

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.dateFormNav.GenerateAndSetNavMatrices(true);

    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore,
      'PRODUCT'
    );
    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.commandsOnTable = this.commands;
    this.dbDataTable.commandsOnTableEditMode = this.commands;
    this.dbDataTable.PushFooterCommandList();

    this.kbS.SetCurrentNavigatable(this.dateFormNav);
    this.kbS.SelectFirstTile();
    this.kbS.setEditMode(KeyboardModes.EDIT);

    this.cdref.detectChanges();

    // TODO
    if (this.dbDataTable.data.length > 1) {
      this.dbDataTable.data = [this.dbDataTable.data[0]];
      this.dbDataDataSrc.setData(this.dbDataTable.data);
    }
  }

  InitFormDefaultValues(): void {
    this.dateForm.controls['invCtrlDate'].setValue(HelperFunctions.GetDateString());
  }

  OpenAlreadyInventoryDialog(product: string, dateWithUtc: string, nRealQty: number): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.bbxToastrService.show(
      `A ${product} termék ${HelperFunctions.GetOnlyDateFromUtcDateString(dateWithUtc)} napon leltározva volt, leltári készlet: ${(new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(nRealQty)).replace(",", ".")}.`,
      'Leltár információ',
      Constants.TOASTR_ERROR
    );
  }

  async HandleProductSelectionFromDialog(res: Product, rowIndex: number) {
    if (res.id === undefined || res.id === -1) {
      return;
    }

    this.isLoading = true;

    let row = this.dbDataTable.data[rowIndex];
    let count = this.dbDataTable.data.filter(x => x.data.productCode === res.productCode).length;
    if (count > 1 || (count === 1 && res.productCode !== row.data.productCode)) {
      this.dbDataTable.editedRow!.data.productCode = "";
      this.kbS.ClickCurrentElement();
      this.bbxToastrService.show(
        Constants.MSG_PRODUCT_ALREADY_THERE,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      this.isLoading = false;
      return;
    } else if (res.productCode === row.data.productCode) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    const stockRecord = await this.GetStockRecordForProduct(res.id);
    let price = res.latestSupplyPrice;
    if (stockRecord && stockRecord.id !== 0 && stockRecord.id !== undefined) {
      price = stockRecord.avgCost;
      this.dbDataTable.data[rowIndex].data.realQty = stockRecord.realQty;
    }

    let currentRow = this.dbDataTable.FillCurrentlyEditedRow({ data: InvCtrlItemLine.FromProduct(res, 0, 0, price, 0) });
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
      this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
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

            let row = this.dbDataTable.data[rowPos];
            let count = this.dbDataTable.data.filter(x => x.data.productCode === _product.productCode).length;
            if (count > 1 || (count === 1 && _product.productCode !== row.data.productCode)) {
              alreadyAdded = true;
              this.dbDataTable.editedRow!.data.productCode = "";
              this.kbS.ClickCurrentElement();
              this.bbxToastrService.show(
                Constants.MSG_PRODUCT_ALREADY_THERE,
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR
              );
            } else if (_product.productCode === row.data.productCode) {
              return;
            } else {
              const stockRecord = await this.GetStockRecordForProduct(product.id);

              let price = product.latestSupplyPrice;
              if (stockRecord && stockRecord.id !== 0 && stockRecord.id !== undefined) {
                price = stockRecord.avgCost;
              }

              let currentRow = this.dbDataTable.FillCurrentlyEditedRow({ data: InvCtrlItemLine.FromProduct(product, 0, 0, price) });
              currentRow?.data.Save('productCode');

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
            this.dbDataTable.data[rowPos].data.Restore('productCode');
          }
        },
        error: () => {
          this.dbDataTable.data[rowPos].data.Restore('productCode');
          this.RecalcNetAndVat();
        },
        complete: async () => {
          this.isLoading = false;

          if (_product.id === undefined || _product.id === -1 || alreadyAdded) {
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            return;
          }

          await lastValueFrom(this.invCtrlItemService.GetAllRecords(
            { ProductID: _product.id } as GetAllInvCtrlItemRecordsParamListModel))
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

    if (!changedData || !changedData.productCode)
      return

    if ((!!col && col === 'productCode') || col === undefined) {
      this.productCodeChanged(changedData, index)
    }

    if (col && col === 'nRealQty') {
      this.quantityChanged(changedData, index)
    }
  }

  private productCodeChanged(changedData: InvCtrlItemLine, index?: number): void {
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

  private async quantityChanged(changedData: InvCtrlItemLine, index?: number): Promise<void> {
    try {
      this.isLoading = true

      const request = {
        productID: changedData.productID,
        warehouseCode: this.tokenService.wareHouse?.warehouseCode,
        retroDays: 7
      } as GetLatestIccRequest

      const response = await this.invCtrlItemService.getLatestIcc(request)

      if (response && !changedData.doAddToExisting) {
        const day = moment(response.invCtrlDate).format('YYYY-MM-DD')
        const message = `${response.productCode} ${response.product} ${day}-n leltározva volt ${response.nRealQty} készlettel. Hozzáadjuk a mennyiséget a leltározott készlethez?`

        HelperFunctions.confirm(
          this.dialogService,
          message,
          () => {
            changedData.doAddToExisting = true
            changedData.nRealQty = parseInt(changedData.nRealQty.toString()) + response.nRealQty

            this.kbS.ClickCurrentElement()
          },
          () => {
            changedData.doAddToExisting = false

            this.kbS.ClickCurrentElement()
          })
      }
    } catch (error) {
      this.cs.HandleError(error)
    } finally {
      this.isLoading = false
    }
  }

  CheckSaveConditionsAndSave(): void {
    this.dateForm.markAllAsTouched();

    if (this.dateForm.invalid) {
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
          debugger;
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          event.preventDefault();
          this.dbDataTable.GetEditedRow()?.data.Restore('productCode');
          return;
        }
      }
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

