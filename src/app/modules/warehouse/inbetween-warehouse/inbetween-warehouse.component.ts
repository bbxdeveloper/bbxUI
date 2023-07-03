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
import { BehaviorSubject, firstValueFrom, lastValueFrom, map, tap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { StatusService } from 'src/app/services/status.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { Constants } from 'src/assets/util/Constants';
import { Actions, GetFooterCommandListFromKeySettings, InbetweenWarehouseKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { NbDialogService, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { MoveTableInputCursorToBeginning, TableKeyDownEvent, isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { ProductSelectTableDialogComponent } from '../../shared/product-select-table-dialog/product-select-table-dialog.component';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { Product } from '../../product/models/Product';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { ProductService } from '../../product/services/product.service';
import { StockService } from '../../stock/services/stock.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { WhsTransferService } from '../services/whs-transfer.service';
import { CreateWhsTransferRequest } from '../models/whs/CreateWhsTransferRequest';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { WarehouseInbetweenBehaviorFactoryService } from '../services/warehouse-inbetween-behavior-factory.service';
import { WarehouseInbetweenMode } from '../models/whs/WarehouseInbetweenMode';
import { WhsTransferLine } from '../models/whs/WhsTransferLine';
import { InbetweenWarehouseProduct } from '../models/whs/InbetweenWarehouseProduct';
import { WhsTransferFull, WhsTransferUpdate } from '../models/whs/WhsTransfer';

type WarehouseData = {
  code: string,
  description: string,
}

@Component({
  selector: 'app-inbetween-warehouse',
  templateUrl: './inbetween-warehouse.component.html',
  styleUrls: ['./inbetween-warehouse.component.scss'],
  providers: [WhsTransferService, WarehouseInbetweenBehaviorFactoryService]
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
  private warehouseData: WarehouseData[] = []

  get isEditModeOff(): boolean {
    return !this.kbS.isEditModeActivated
  }

  override cellClass = 'PRODUCT'

  override colsToIgnore = ['productDescription', 'unitOfMeasureX', 'currAvgCost', 'linePrice']
  public override allColumns = [
    'productCode',
    'productDescription',
    '_quantity',
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
      label: 'Mennyiség', objectKey: '_quantity', colKey: '_quantity',
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

  public mode: WarehouseInbetweenMode = { edit: false, title: '', id: -1 }
  public loadedData?: WhsTransferFull

  constructor(
    private readonly tokenService: TokenStorageService,
    private readonly warehouseService: WareHouseService,
    private readonly productService: ProductService,
    private readonly stockService: StockService,
    private readonly whsTransferService: WhsTransferService,
    private readonly bbxToastrService: BbxToastrService,
    private readonly simpleToastrService: NbToastrService,
    private readonly printAndDownloadService: PrintAndDownloadService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly behaviorFactory: WarehouseInbetweenBehaviorFactoryService,
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

    this.preventF12 = true

    this.headerForm = new FormGroup({
      whsTransferNumber: new FormControl({ value: '', disabled: true }),
      fromWarehouse: new FormControl({ value: '', disabled: true }),
      toWarehouse: new FormControl('', [
        Validators.required,
        this.notSame.bind(this)
      ]),
      transferDate: new FormControl('', [
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

    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore,
      this.cellClass,
    )

    this.fS.pushCommands(this.commands)

    this.activatedRoute.url.subscribe(async params => {
      this.mode = this.behaviorFactory.create(params)
      if (this.mode.edit) {
        await this.LoadForEdit()
      }
    })
  }

  private async LoadForEdit(): Promise<void> {
    try {
      this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);

      const whsTransfer = await firstValueFrom(this.whsTransferService.Get({ ID: this.mode.id }))
        .catch(err => {
          this.cs.HandleError(err)
        })

      if (whsTransfer !== undefined) {
        this.loadedData = whsTransfer

        this.headerForm.controls['whsTransferNumber'].setValue(whsTransfer.whsTransferNumber)
        this.headerForm.controls['fromWarehouse'].setValue(whsTransfer.fromWarehouse!.split('-')[1])
        this.headerForm.controls['toWarehouse'].setValue(whsTransfer.toWarehouse!.split('-')[1])
        this.headerForm.controls['transferDate'].setValue(whsTransfer.transferDate)
        this.headerForm.controls['note'].setValue(whsTransfer.notice)

        const _data: TreeGridNode<InbetweenWarehouseProduct>[] = []
        for (let i = 0; i < whsTransfer.whsTransferLines.length; i++) {
          const inbetweenProduct = await this.WhsTransferLinesToInbetweenWarehouseProducts(whsTransfer.whsTransferLines[i])
          if (inbetweenProduct !== undefined) {
            _data.push({ data: inbetweenProduct })
          }
        }

        this.dbData = _data.concat(this.dbData)
        this.dbDataTable.data = this.dbData
        this.dbDataDataSrc.setData(this.dbData)
        this.RecalcNetAndVat()

        this.dbDataTable.GenerateAndSetNavMatrices(false, false)

        this.kbS.SetCurrentNavigatable(this.dbDataTable)
        this.kbS.setEditMode(KeyboardModes.NAVIGATION)
        this.kbS.SelectFirstTile()
      }
    }
    catch (err) {
      this.cs.HandleError(err)
    }
    finally {
      this.sts.pushProcessStatus(Constants.BlankProcessStatus);
    }
  }

  private async WhsTransferLinesToInbetweenWarehouseProducts(whsTransferLine: WhsTransferLine): Promise<InbetweenWarehouseProduct | undefined> {
    const product = await this.productService.getProductByCodeAsync({ ProductCode: whsTransferLine.productCode! })
      .catch(err => {
        this.cs.HandleError(err)
      })

    if (product === undefined) {
      return undefined
    } else  {
      const inbetweenProduct = await this.createInbetweenProduct(product)
      if (inbetweenProduct) {
        inbetweenProduct!.quantity = whsTransferLine.quantity
      }
      return inbetweenProduct
    }
  }

  public ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    console.log("Selecting InvoiceLine from avaiable data.");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.dbDataTable.editedRow?.data.productCode ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
      }
    });
    dialogRef.onClose.subscribe(async product => {
      const inbetween = await this.createInbetweenProduct(product);

      if (!inbetween) {
        return
      }

      this.HandleProductChoose(inbetween, wasInNavigationMode)
    });
  }

  HandleProductChoose(res: InbetweenWarehouseProduct, wasInNavigationMode: boolean): void {
    if (!!res) {
      this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING])
      if (!wasInNavigationMode) {
        let currentRow = this.dbDataTable.FillCurrentlyEditedRow({ data: res })
        currentRow?.data.Save('productCode')
        this.kbS.setEditMode(KeyboardModes.NAVIGATION)
        this.dbDataTable.MoveNextInTable()
        setTimeout(() => {
          this.kbS.setEditMode(KeyboardModes.EDIT)
          this.kbS.ClickCurrentElement()
        }, 200)
      } else {
        const index = this.dbDataTable.data.findIndex(x => x.data.productCode === res.productCode)
        if (index !== -1) {
          this.kbS.SelectElementByCoordinate(0, index)
        }
      }
    }
    this.sts.pushProcessStatus(Constants.BlankProcessStatus)
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

    if (col === '_quantity') {
      this.quantityChanged(changedData)
    }
    else if ((!!col && col === 'productCode') || col === undefined) {
      this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: async product => {
          console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', product);

          if (index !== undefined) {
            const inbetween = await this.createInbetweenProduct(product)

            if (inbetween) {
              this.dbData[index].data = inbetween;
              this.dbDataDataSrc.setData(this.dbData);
            }
          }

          this.RecalcNetAndVat();
        },
        error: err => {
          this.RecalcNetAndVat();
        }
      });
    }
  }

  private quantityChanged(changedData: InbetweenWarehouseProduct): void {
    // reassign it to itself to convert it to a Number
    changedData.quantity = changedData.quantity

    if (changedData.quantity <= 0) {
      setTimeout(() => {
        this.bbxToastrService.showError(Constants.MSG_CANNOT_BE_LOWER_THAN_ZERO)
      }, 0);

      changedData.Restore()

      return
    }

    if (changedData.quantity > changedData.realQty) {
      this.kbS.setEditMode(KeyboardModes.NAVIGATION)

      setTimeout(() => {
        const message = `Raktáron: ${changedData.realQty}. Átadandó: ${changedData.quantity}. Negatív készlet keletkezik! Helyes a beírt érték?`
        HelperFunctions.confirm(
          this.dialogService,
          message,
          () => changedData.Save(),
          () => {
            changedData.quantity = changedData.realQty >= 0 ? changedData.realQty : 0
            changedData.Save()
          })
      }, 300);
    } else {
      changedData.Save()
    }
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

    this.sts.waitForLoad();

    this.productService.GetProductByCode({ ProductCode: changedData.productCode } as GetProductByCodeRequest)
      .subscribe({
        next: async product => {
          if (!product?.id) {
            MoveTableInputCursorToBeginning()
            this.bbxToastrService.showError(Constants.MSG_NO_PRODUCT_FOUND)
            return
          }

          const inbetween = await this.createInbetweenProduct(product)
          if (!inbetween) {
            return
          }

          let currentRow = this.dbDataTable.FillCurrentlyEditedRow({ data: inbetween })

          currentRow?.data.Save('productCode');

          this.kbS.setEditMode(KeyboardModes.NAVIGATION)
          this.dbDataTable.MoveNextInTable()

          setTimeout(() => {
            this.kbS.setEditMode(KeyboardModes.EDIT);
            this.kbS.ClickCurrentElement();
          }, 200);
        },
        error: () => {
          this.cs.HandleError.bind(this.cs)
          this.sts.waitForLoad(false)
        } ,
        complete: () => {
          this.sts.waitForLoad(false)
        }
      })
  }

  public ngOnDestroy(): void {
    this.kbS.Detach()
  }

  public ngAfterViewInit(): void {
    this.headerForm.controls['transferDate'].setValue(moment().format('YYYY-MM-DD'))

    this.headerFormNav.GenerateAndSetNavMatrices(true)
    this.dbDataTable.GenerateAndSetNavMatrices(true)

    this.cdref.detectChanges()

    setTimeout(() => {
      this.kbS.SetCurrentNavigatable(this.headerFormNav)
      this.kbS.SelectFirstTile()
    }, 300)
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
    this.sts.waitForLoad()

    this.warehouseService.GetAll()
      .pipe(
        map(response => response.data?.map(x => ({ description: x.warehouseDescription, code: x.warehouseCode} as WarehouseData)) ?? []),
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
        next: data => this.warehouseData = data,
        error: () => {
          this.cs.HandleError.bind(this.cs)
          this.sts.waitForLoad(false)
        },
        complete: () => this.sts.waitForLoad(false)
      })

    setTimeout(() => {
      this.cs.CloseAllHeaderMenuTrigger.next(true)
    }, 500);
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

  CheckSaveConditionsAndSave(): void {
    this.headerForm.markAllAsTouched();

    if (this.headerForm.invalid) {
      this.bbxToastrService.showError(Constants.MSG_ERROR_INVALID_FORM)
      return
    }

    const isTableValid = this.dbData
      .filter(x => x.data.productID)
      .every(x => x.data.isSaveable())

    if (!isTableValid) {
      if (this.dbData.length < 2) {
        this.bbxToastrService.showError(Constants.MSG_ERROR_NEED_AT_LEAST_ONE_VALID_RECORD)
      } else {
        this.bbxToastrService.showError(Constants.MSG_ERROR_WRONG_QUANTITY_ONE_OR_MORE)
      }
      return
    }

    HelperFunctions.confirm(this.dialogService, Constants.MSG_CONFIRMATION_SAVE_INVOICE, async () => {
      if (this.mode.edit) {
        await this.update()
      } else {
        await this.create()
      }
    })
  }

  private async create(): Promise<void> {
    try {
      this.sts.waitForLoad()

      const request = this.createWhsTransferRequest()
      const response = await this.whsTransferService.create(request)

      if (!response.succeeded) {
        this.cs.HandleError(response.message)

        return
      }

      this.simpleToastrService.show(
        Constants.MSG_SAVE_SUCCESFUL,
        Constants.TITLE_INFO,
        Constants.TOASTR_SUCCESS_5_SEC
      );

      await this.printAndDownloadService.openPrintDialog({
        DialogTitle: Constants.TITLE_PRINT_INVOICE,
        DefaultCopies: 1,
        MsgError: `A ${response.data?.whsTransferNumber ?? ''} számla nyomtatása közben hiba történt.`,
        MsgCancel: `A ${response.data?.whsTransferNumber ?? ''} számla nyomtatása nem történt meg.`,
        MsgFinish: `A ${response.data?.whsTransferNumber ?? ''} számla nyomtatása véget ért.`,
        Obs: this.whsTransferService.getReport.bind(this.whsTransferService),
        Reset: this.DelayedReset.bind(this),
        ReportParams: {
          "id": response.data?.id,
          "copies": 1 // Ki lesz töltve dialog alapján
        } as Constants.Dct
      } as PrintDialogRequest);
    } catch (error) {
      this.cs.HandleError(error)
    }
    finally {
      this.sts.waitForLoad(false)
    }
  }

  protected ExitToNav(): void {
    this.router.navigate(['warehouse/warehouse-document']);
  }

  private async update(): Promise<void> {
    try {
      this.sts.waitForLoad()

      const request = this.createWhsTransferUpdateRequest()
      const response = await this.whsTransferService.update(request)

      if (!response.succeeded) {
        this.cs.HandleError(response.message)

        return
      }

      this.simpleToastrService.show(
        Constants.MSG_SAVE_SUCCESFUL,
        Constants.TITLE_INFO,
        Constants.TOASTR_SUCCESS_5_SEC
      );

      await this.printAndDownloadService.openPrintDialog({
        DialogTitle: 'Számla Nyomtatása',
        DefaultCopies: 1,
        MsgError: `A ${response.data?.whsTransferNumber ?? ''} számla nyomtatása közben hiba történt.`,
        MsgCancel: `A ${response.data?.whsTransferNumber ?? ''} számla nyomtatása nem történt meg.`,
        MsgFinish: `A ${response.data?.whsTransferNumber ?? ''} számla nyomtatása véget ért.`,
        Obs: this.whsTransferService.getReport.bind(this.whsTransferService),
        Reset: this.ExitToNav.bind(this),
        ReportParams: {
          "id": response.data?.id,
          "copies": 1 // Ki lesz töltve dialog alapján
        } as Constants.Dct
      } as PrintDialogRequest);
    } catch (error) {
      this.cs.HandleError(error)
    }
    finally {
      this.sts.waitForLoad(false)
    }
  }

  private createWhsTransferRequest(): CreateWhsTransferRequest {
    const controls = this.headerForm.controls
    const fromWarehouseCode = this.warehouseData.find(x => x.description === controls['fromWarehouse'].value)?.code ?? ''
    const toWarehouseCode = this.warehouseData.find(x => x.description === controls['toWarehouse'].value)?.code ?? ''

    const transferLines = this.dbData
      .filter(({ data }) => data.productID)
      .map(({ data }, index) => ({
        whsTransferLineNumber: index,
        productCode: data.productCode,
        currAvgCost: data.currAvgCost,
        quantity: HelperFunctions.ToInt(data.quantity),
        unitOfMeasure: data.unitOfMeasure
      } as WhsTransferLine))

    return {
      fromWarehouseCode: fromWarehouseCode,
      toWarehouseCode: toWarehouseCode,
      transferDate: controls['transferDate'].value,
      notice: controls['note'].value,
      userID: this.tokenService.user?.id,
      whsTransferLines: transferLines,
    } as CreateWhsTransferRequest
  }

  private createWhsTransferUpdateRequest(): WhsTransferUpdate {
    const controls = this.headerForm.controls
    const fromWarehouseCode = this.warehouseData.find(x => x.description === controls['fromWarehouse'].value)?.code ?? ''
    const toWarehouseCode = this.warehouseData.find(x => x.description === controls['toWarehouse'].value)?.code ?? ''

    const transferLines = this.dbData
      .filter(({ data }) => data.productID)
      .map(({ data }, index) => ({
        whsTransferLineNumber: index,
        productCode: data.productCode,
        currAvgCost: data.currAvgCost,
        quantity: HelperFunctions.ToInt(data.quantity),
        unitOfMeasure: data.unitOfMeasure
      } as WhsTransferLine))

    return {
      id: this.loadedData!.id,
      fromWarehouseCode: fromWarehouseCode,
      toWarehouseCode: toWarehouseCode,
      transferDate: controls['transferDate'].value,
      transferDateIn: this.loadedData!.transferDateIn,
      notice: controls['note'].value,
      userID: this.tokenService.user?.id,
      whsTransferLines: transferLines,
    } as WhsTransferUpdate
  }

  public override HandleKeyDown(event: Event|TableKeyDownEvent): void {
    if (!isTableKeyDownEvent(event)) {
      return
    }

    switch(event.Event.key) {
      case this.KeySetting[Actions.Delete].KeyCode: {
        HelperFunctions.confirm(
          this.dialogService,
          HelperFunctions.StringFormat(Constants.MSG_CONFIRMATION_DELETE_PARAM, event.Row.data.productCode),
          () => this.dbDataTable?.HandleGridDelete(event.Event, event.Row, event.RowPos, event.ObjectKey)
        )
        break
      }
      case KeyBindings.Enter: {
        if ((this.KeySetting[Actions.Save].KeyCode == KeyBindings.CtrlEnter && event.Event.CtrlKey) || !event.Event.CtrlKey) {
          this.CheckSaveConditionsAndSave()
        }
        break
      }
      case this.KeySetting[Actions.Search].KeyCode: {
        this.ChooseDataForTableRow(0, false)

        break
      }
    }
  }
}
