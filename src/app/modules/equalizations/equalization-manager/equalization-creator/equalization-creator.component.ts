import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { InvPayment, InvPaymentItem } from '../../models/InvPayment';
import { FormGroup, AbstractControl, ValidationErrors, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbTable, NbSortDirection, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
import moment from 'moment';
import { Subscription, lastValueFrom } from 'rxjs';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { CreateIccRequest } from 'src/app/modules/inventory/models/CreateIccRequest';
import { CreateInvCtrlItemRequest } from 'src/app/modules/inventory/models/CreateInvCtrlItemRequest';
import { GetAllInvCtrlPeriodsParamListModel } from 'src/app/modules/inventory/models/GetAllInvCtrlPeriodsParamListModel';
import { GetLatestIccRequest } from 'src/app/modules/inventory/models/GetLatestIccRequest';
import { InvCtrlItemLine } from 'src/app/modules/inventory/models/InvCtrlItem';
import { InventoryCtrlItemService } from 'src/app/modules/inventory/services/inventory-ctrl-item.service';
import { GetProductByCodeRequest } from 'src/app/modules/product/models/GetProductByCodeRequest';
import { Product } from 'src/app/modules/product/models/Product';
import { ProductService } from 'src/app/modules/product/services/product.service';
import { BaseInlineManagerComponent } from 'src/app/modules/shared/base-inline-manager/base-inline-manager.component';
import { ProductSelectTableDialogComponent } from 'src/app/modules/shared/dialogs/product-select-table-dialog/product-select-table-dialog.component';
import { ProductStockInformationDialogComponent } from 'src/app/modules/shared/dialogs/product-stock-information-dialog/product-stock-information-dialog.component';
import { selectProcutCodeInTableInput, TableKeyDownEvent, isTableKeyDownEvent } from 'src/app/modules/shared/inline-editable-table/inline-editable-table.component';
import { ConfirmationWithAuthDialogComponent, ConfirmationWithAuthDialogesponse } from 'src/app/modules/shared/simple-dialogs/confirmation-with-auth-dialog/confirmation-with-auth-dialog.component';
import { GetStockRecordParamsModel } from 'src/app/modules/stock/models/GetStockRecordParamsModel';
import { StockRecord } from 'src/app/modules/stock/models/StockRecord';
import { StockService } from 'src/app/modules/stock/services/stock.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { validDate } from 'src/assets/model/Validators';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { TileCssClass, TileCssColClass, AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { InvCtrlItemCreatorKeySettings, GetFooterCommandListFromKeySettings, Actions, KeyBindings } from 'src/assets/util/KeyBindings';
import { EqualizationsService } from '../../services/equalizations.service';

@Component({
  selector: 'app-equalization-creator',
  templateUrl: './equalization-creator.component.html',
  styleUrls: ['./equalization-creator.component.scss']
})
export class EqualizationCreatorComponent extends BaseInlineManagerComponent<InvPaymentItem> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  Subscription_Search?: Subscription;

  public KeySetting: Constants.KeySettingsDct = InvCtrlItemCreatorKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  invPaymentData!: InvPayment;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  override colsToIgnore: string[] = ["customerName", "paymentDate", "invoicePayedAmount", "invPaymentAmountH"];
  override allColumns = [
    'invoiceNumber',
    'customerName',
    'paymentDate',
    'invoicePayedAmount',
    'bankTransaction',
    'invPaymentDate',
    'currencyCode',
    'exchangeRate',
    'invPaymentAmount',
    'invPaymentAmountH'
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Számlaszám', objectKey: 'invoiceNumber', colKey: 'invoiceNumber',
      defaultValue: '', type: 'string', mask: "CCCCCCCCCC",
      colWidth: "30%", textAlign: "left", fInputType: 'code-field'
    },
    {
      label: 'Ügyfél', objectKey: 'customerName', colKey: 'customerName',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "50%", textAlign: "left",
    },
    {
      label: 'Fiz.hat', objectKey: 'paymentDate', colKey: 'paymentDate',
      defaultValue: '', type: 'onlyDate', fRequired: true,
      mask: '', colWidth: '120px', textAlign: 'left', fReadonly: true
    },
    {
      label: 'Kiegyenlítve', objectKey: 'invoicePayedAmount', colKey: 'invoicePayedAmount',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Banki azonosító', objectKey: 'bankTransaction', colKey: 'bankTransaction',
      defaultValue: '', type: 'string', mask: "",
      colWidth: "125px", textAlign: "left",
    },
    {
      label: 'Dátum', objectKey: 'invPaymentDate', colKey: 'invPaymentDate',
      defaultValue: '', type: 'onlyDate',
      mask: '', colWidth: '120px', textAlign: 'left', fReadonly: true
    },
    {
      label: 'Pénznem', objectKey: 'currencyCode', colKey: 'currencyCode',
      defaultValue: '', type: 'string', mask: "",
      colWidth: "125px", textAlign: "left",
    },
    {
      label: 'Árfolyam', objectKey: 'exchangeRate', colKey: 'exchangeRate',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: false,
    },
    {
      label: 'Összeg', objectKey: 'invPaymentAmount', colKey: 'invPaymentAmount',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: false,
    },
    {
      label: 'Összeg HUF', objectKey: 'invPaymentAmountH', colKey: 'invPaymentAmountH',
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

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvPaymentItem>>,
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
    private readonly tokenService: TokenStorageService,
    private readonly invPaymentService: EqualizationsService
  ) {
    super(dialogService, kbS, fS, cs, sts, sideBarService, khs, router);
    this.preventF12 = true
    this.initialSetup();
  }

  private initialSetup(): void {
    this.dbDataTableId = "offers-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    this.invPaymentData = new InvPayment()

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dateForm = new FormGroup({});

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
        return new InvPaymentItem();
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

    const confirmDialogRef = this.dialogService.open(ConfirmationWithAuthDialogComponent, { context: { title: Constants.MSG_CONFIRMATION_SAVE_DATA } });
    confirmDialogRef.onClose.subscribe(async (res: ConfirmationWithAuthDialogesponse) => {
      if (!res)
        return

      console.log('Save: ', this.invPaymentData);

      try {
        this.isSaveInProgress = true;
        this.status.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING])

        const request = this.dbDataTable.data
          .filter(x => !x.data.IsUnfinished())
          .map(x => ({
            warehouseID: this.tokenService.wareHouse?.id,
            productID: x.data.productID,
            nRealQty: parseInt(x.data.nRealQty.toString()),
            invCtrlDate: moment(this.invCtrlDate).format('YYYY-MM-DD').toString(),
            userID: res.value!
          } as CreateIccRequest))
          .filter(x => x.productID !== -1)

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
        this.status.pushProcessStatus(Constants.BlankProcessStatus)
      }
    });
  }

  protected AfterViewInitSetup(): void {
    this.InitFormDefaultValues();

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

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

    this.kbS.SetCurrentNavigatable(this.dbDataTable);
    this.kbS.SelectFirstTile();
    this.kbS.setEditMode(KeyboardModes.EDIT);

    this.cdref.detectChanges();

    // TODO
    if (this.dbDataTable.data.length > 1) {
      this.dbDataTable.data = [this.dbDataTable.data[0]];
      this.dbDataDataSrc.setData(this.dbDataTable.data);
    }
  }

  async HandleProductSelection(res: Product, rowIndex: number, checkIfCodeEqual: boolean = true) {}

  async HandleProductChoose(res: Product, wasInNavigationMode: boolean, rowIndex: number): Promise<void> {}

  ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {}

  ChooseDataForCustomerForm(): void { }
  RefreshData(): void { }
  RecalcNetAndVat(): void { }

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

    const previousValue = this.dbDataTable.data[rowPos].data?.GetSavedFieldValue('productCode')
    if (previousValue && changedData?.productCode === previousValue) {
      this.bbxToastrService.show(
        Constants.MSG_PRODUCT_ALREADY_THERE,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
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
          this.status.pushProcessStatus(Constants.BlankProcessStatus);
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
        case KeyBindings.F11: {
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
          break
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

