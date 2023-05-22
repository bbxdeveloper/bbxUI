import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { WareHouseService } from '../services/ware-house.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { validDate } from 'src/assets/model/Validators';
import moment from 'moment';
import { BehaviorSubject, map, tap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { StatusService } from 'src/app/services/status.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { Constants } from 'src/assets/util/Constants';
import { Actions, GetFooterCommandListFromKeySettings, GetUpdatedKeySettings, InbetweenWarehouseKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { InbetweenWarehouseProduct } from '../models/InbetweenWarehouseProduct';
import { InputFocusChangedEvent, TableKeyDownEvent, isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { Router } from '@angular/router';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { ProductSelectTableDialogComponent } from '../../shared/product-select-table-dialog/product-select-table-dialog.component';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { Product } from '../../product/models/Product';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { ProductService } from '../../product/services/product.service';
import { StockService } from '../../stock/services/stock.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

@Component({
  selector: 'app-inbetween-warehouse',
  templateUrl: './inbetween-warehouse.component.html',
  styleUrls: ['./inbetween-warehouse.component.scss']
})
export class InbetweenWarehouseComponent extends BaseInlineManagerComponent<InbetweenWarehouseProduct> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  get editDisabled() {
    return !this.kbS.isEditModeActivated && !this.isLoading && !this.isSaveInProgress;
  }

  public TileCssClass = TileCssClass

  override isLoading = false

  public KeySetting: Constants.KeySettingsDct = InbetweenWarehouseKeySettings;
  public override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  public headerForm: FormGroup
  public headerFormNav: InlineTableNavigatableForm
  public headerFormId = 'header-form-id'

  public summedCost = 0

  public warehouseSelectionError = false
  public warehouses$ = new BehaviorSubject<string[]>([])
  public toWarehouses$ = new BehaviorSubject<string[]>([])

  override cellClass = 'PRODUCT'

  override colsToIgnore = ['productDescription', 'unitOfMeasureX', 'currAvgCost', 'linePrice']
  public override allColumns = [
    'productCode',
    'productDescription',
    'quantity',
    'unitOfMeasureX',
    'currAvgCost',
    'linePrice',
  ]
  public override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Termékkód', objectKey: 'productCode', colKey: 'productCode',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "30%", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create, fReadonly: false,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Megnevezés', objectKey: 'productDescription', colKey: 'productDescription',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "70%", textAlign: "left",
    },
   {
      label: 'Mennyiség', objectKey: 'quantity', colKey: 'quantity',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "100px", textAlign: "right", fInputType: 'formatted-number',
      checkIfReadonly: (row: TreeGridNode<InbetweenWarehouseProduct>) => HelperFunctions.isEmptyOrSpaces(row.data.productCode),
    },
    {
      label: 'Me.e.', objectKey: 'unitOfMeasureX', colKey: 'unitOfMeasureX',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "80px", textAlign: "right"
    },
    {
      label: 'Ált. nyilv. ár', objectKey: 'currAvgCost', colKey: 'currAvgCost',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Érték', objectKey: 'linePrice', colKey: 'linePrice',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
  ]

  constructor(
    private readonly tokenService: TokenStorageService,
    private readonly warehouseService: WareHouseService,
    private readonly productService: ProductService,
    private readonly stockService: StockService,
    private readonly bbxToastrService: BbxToastrService,
    commonService: CommonService,
    keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
    footerService: FooterService,
    statusService: StatusService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InbetweenWarehouseProduct>>,
    dialogService: NbDialogService,
    sidebarService: BbxSidebarService,
    keyboardHelperService: KeyboardHelperService,
    router: Router
  ) {
    super(dialogService, keyboardService, footerService, commonService, statusService, sidebarService, keyboardHelperService, router)

    this.headerForm = new FormGroup({
      fromWarehouse: new FormControl({ disabled: true }),
      toWarehouse: new FormControl('', [
        Validators.required,
        this.notSame.bind(this)
      ]),
      transferDate: new FormControl('Valami', [
        Validators.required,
        validDate,
        this.maxDate.bind(this)
      ]),
      note: new FormControl('')
    })

    this.headerFormNav = new InlineTableNavigatableForm(
      this.headerForm,
      this.kbS,
      this.cdref,
      [],
      this.headerFormId,
      AttachDirection.DOWN,
      {} as IInlineManager
    )

    this.headerFormNav.OuterJump = true

    this.dbData = []

    this.dbDataDataSrc = dataSourceBuilder.create(this.dbData)

    this.dbDataTable = new InlineEditableNavigatableTable(
      dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      () => InbetweenWarehouseProduct.makeEmpty(),
      this
    )

    this.dbDataTable.OuterJump = true
    this.KeySetting = this.KeySetting

    this.dbDataTable.PushFooterCommandList()

    this.fS.pushCommands(this.commands)
  }

  public ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    console.log("Selecting InvoiceLine from avaiable data.");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.dbDataTable.editedRow?.data.productCode ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
        // exchangeRate: this.outGoingInvoiceData.exchangeRate ?? 1
      }
    });
    dialogRef.onClose.subscribe(async product => {
      const inbetween = await this.createInbetweenProduct(product);

      if (!inbetween) {
        return
      }

      this.dbData = [...this.dbData.filter(x => x.data.productID), { data: inbetween }]

      this.RefreshTable()
    });
  }

  private async createInbetweenProduct(product: Product): Promise<InbetweenWarehouseProduct|undefined> {
    if (this.dbData.find(x => x.data.productID === product.id)) {
      return
    }

    const productStocks = await this.stockService.getProductStock(product.id)
    const stock = productStocks.find(x => x.warehouseCode === this.tokenService.wareHouse?.warehouseCode)

    const inbetween = InbetweenWarehouseProduct.fromProductAndStock(product, stock)

    return inbetween
  }

  public ChooseDataForCustomerForm(): void {}

  public RefreshData(): void {}

  public TableRowDataChanged(changedData?: InbetweenWarehouseProduct, index?: number|undefined, col?: string|undefined): void {
    if (!changedData) {
      return
    }

    if (!index && !col) {
      return
    }

    if (col === 'quantity') {
      this.quantityChanged(changedData)
    }
  }

  private quantityChanged(changedData: InbetweenWarehouseProduct): void {
    if (changedData.quantity <= 0) {
      this.bbxToastrService.showError(Constants.MSG_CANNOT_BE_LOWER_THAN_ZERO)

      changedData.Restore()

      return
    }

    if (changedData.quantity > changedData.realQty) {
      const message = `Raktáron: ${changedData.realQty}. Átadandó: ${changedData.quantity}. Negatív készlet keletkezik! Helyes a beírt érték?`
      HelperFunctions.confirm(
        this.dialogService,
        message,
        () => changedData.Save(),
        () => {
          changedData.quantity = changedData.realQty;
          changedData.Save()
        })

        return
    }

    changedData.Save()
  }

  public RecalcNetAndVat(): void {
    this.summedCost = 0

    for(const { data: item } of this.dbData) {
      this.summedCost += item.linePrice
    }
  }

  public HandleGridCodeFieldEnter(event: any, row: TreeGridNode<InbetweenWarehouseProduct>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!event) {
      this.bbxToastrService.close();
      event.stopPropagation();
    }
    console.log('[HandleGridCodeFieldEnter]: editmode off: ', this.editDisabled);
    if (this.editDisabled) {
      const colDef = this.colDefs.find(x => x.objectKey === objectKey)
      if (colDef?.fReadonly) {
        return
      }

      this.dbDataTable.HandleGridEnter(row, rowPos, objectKey, colPos, inputId, fInputType);
    } else {
      this.TableCodeFieldChanged(row.data, rowPos, row, rowPos, objectKey, colPos, inputId, fInputType);
    }

  }

  private TableCodeFieldChanged(changedData: any, index: number, row: TreeGridNode<InbetweenWarehouseProduct>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (changedData?.productCode === '') {
      return
    }

    this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);

    this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest)
      .subscribe({
        next: async product => {
          if (!product?.id) {
            this.bbxToastrService.showError(Constants.MSG_NO_PRODUCT_FOUND)

            return
          }

          const inbetween = await this.createInbetweenProduct(product)
          if (!inbetween) {
            return
          }

          this.dbDataTable.FillCurrentlyEditedRow({ data: inbetween })

          this.kbS.setEditMode(KeyboardModes.NAVIGATION)
          this.dbDataTable.MoveNextInTable()
        },
        error: () => {
          this.cs.HandleError.bind(this.cs)
          this.sts.pushProcessStatus(Constants.BlankProcessStatus)
        } ,
        complete: () => {
          this.sts.pushProcessStatus(Constants.BlankProcessStatus)
        }
      })
  }

  public ngOnDestroy(): void {
    this.kbS.Detach()
  }

  public ngAfterViewInit(): void {
    this.headerForm.controls['transferDate'].setValue(moment().format('YYYY-MM-DD'))

    this.kbS.SetCurrentNavigatable(this.headerFormNav)
    this.kbS.SelectFirstTile()
  }

  private maxDate(control: AbstractControl): ValidationErrors|null {
    const date = moment(control.value)
    if (!date.isValid()) {
      return null
    }

    const today = moment()
    return date.isAfter(today) ? { maxDate: { value: control.value } } : null
  }

  private notSame(control: AbstractControl): any {
    const otherValue = this.headerForm?.controls['fromWarehouse']?.value ?? ''

    this.warehouseSelectionError = !(control.value === '' && otherValue === '') && control.value === otherValue
  }

  public ngOnInit(): void {
    this.headerFormNav.GenerateAndSetNavMatrices(true)

    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore,
      this.cellClass,
    )

    this.dbDataTable.GenerateAndSetNavMatrices(true)

    this.cdref.detectChanges()

    this.sts.waitForLoad()

    this.warehouseService.GetAll()
      .pipe(
        map(response => response.data?.map(x => ({ description: x.warehouseDescription, code: x.warehouseCode})) ?? []),
        tap(data => {
          const warehouseFromLogin = this.tokenService.wareHouse?.warehouseCode
          const warehouses = data.filter(x => x.code === warehouseFromLogin)
            .map(x => x.description) ?? []

          this.warehouses$.next(warehouses)
          this.headerForm.controls['fromWarehouse'].setValue(warehouses[0])
        }),
        tap(data => {
          const warehouses = data?.map(x => x.description) ?? []
          this.toWarehouses$.next(warehouses);
        }),
      )
      .subscribe({
        error: () => {
          this.cs.HandleError.bind(this.cs)
          this.sts.waitForLoad(false)
        },
        complete: () => this.sts.waitForLoad(false)
      })
  }

  public JumpToFirstCellAndNav(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.kbS.SetCurrentNavigatable(this.dbDataTable);
    this.kbS.SelectElementByCoordinate(0, 0);
    setTimeout(() => {
      this.kbS.ClickCurrentElement();
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }, 100);
  }

  public inlineInputFocusChanged(event: InputFocusChangedEvent): void {
    if (!event.Focused) {
      this.RecalcNetAndVat();
    }

    if (event?.FieldDescriptor?.keySettingsRow && event?.FieldDescriptor?.keyAction) {
      if (event.Focused) {
        const k = GetUpdatedKeySettings(this.KeySetting, event.FieldDescriptor.keySettingsRow, event.FieldDescriptor.keyAction);
        this.commands = GetFooterCommandListFromKeySettings(k);
        this.fS.pushCommands(this.commands);
      } else {
        const k = this.KeySetting;
        this.commands = GetFooterCommandListFromKeySettings(k);
        this.fS.pushCommands(this.commands);
      }
    }
  }

  private Save(): void {
    if (this.headerForm.invalid) {
      this.bbxToastrService.showError('Sajt')
    }
  }

  @HostListener('keydown.f2', ['$event'])
  public onF2Keydown(event: KeyboardEvent): void {
    if (!this.kbS.IsCurrentNavigatableTable()) {
      return
    }

    this.ChooseDataForTableRow(0, false)
  }

  public override HandleKeyDown(event: Event|TableKeyDownEvent): void {
    debugger
    if (isTableKeyDownEvent(event)) {
      switch(event.Event.key) {
        case this.KeySetting[Actions.Delete].KeyCode: {
          HelperFunctions.confirm(
            this.dialogService,
            HelperFunctions.StringFormat(Constants.MSG_CONFIRMATION_DELETE_PARAM, event.Row.data.productCode),
            () => this.dbDataTable?.HandleGridDelete(event.Event, event.Row, event.RowPos, event.ObjectKey)
          )
          break
        }
        case this.KeySetting[Actions.Save].KeyCode: {
          this.Save()
        }
      }
    }
  }
}
