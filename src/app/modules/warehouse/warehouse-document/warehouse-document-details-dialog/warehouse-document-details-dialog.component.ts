import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { GetProductsParamListModel } from 'src/app/modules/product/models/GetProductsParamListModel';
import { Product } from 'src/app/modules/product/models/Product';
import { ProductService } from 'src/app/modules/product/services/product.service';
import { ProductStockInformationDialogComponent } from 'src/app/modules/shared/dialogs/product-stock-information-dialog/product-stock-information-dialog.component';
import { SelectTableDialogComponent } from 'src/app/modules/shared/dialogs/select-table-dialog/select-table-dialog.component';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { CommonService } from 'src/app/services/common.service';
import { JumpPosPriority, KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { NavigatableForm } from 'src/assets/model/navigation/Nav';
import { TileCssClass, JumpDestination, AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { KeyBindings, Actions } from 'src/assets/util/KeyBindings';
import { InbetweenWarehouseProduct } from '../../models/whs/InbetweenWarehouseProduct';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { firstValueFrom } from 'rxjs';
import { WhsTransferService } from '../../services/whs-transfer.service';
import { WarehouseInbetweenMode } from '../../models/whs/WarehouseInbetweenMode';
import { WhsTransferFull } from '../../models/whs/WhsTransfer';
import { StockService } from 'src/app/modules/stock/services/stock.service';
import { WhsTransferLine } from '../../models/whs/WhsTransferLine';
import { AngularEditorConfig } from '@kolkov/angular-editor';

const NavMap: string[][] = [
  ['confirm-dialog-button-close']
];

@Component({
  selector: 'app-warehouse-document-details-dialog',
  templateUrl: './warehouse-document-details-dialog.component.html',
  styleUrls: ['./warehouse-document-details-dialog.component.scss'],
  providers: [WhsTransferService]
})
export class WarehouseDocumentDetailsDialogComponent extends SelectTableDialogComponent<InbetweenWarehouseProduct>
implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked, AfterViewInit {
  @Input() dataId: any

  inputForm!: FormGroup;
  inputFormId: string = 'WarehouseDocumentDetailsDialogComponent_form'
  formNav!: NavigatableForm;

  TileCssClass = TileCssClass;

  AlwaysFirstX = 0;
  AlwaysFirstY = 0;
  JumpPositionPriority = JumpPosPriority.first;
  DestWhenJumpedOnto = JumpDestination.LOWER_LEFT;

  detailsDialogOpened: boolean = false

  isLoaded: boolean = false;
  override isLoading: boolean = false;

  public mode: WarehouseInbetweenMode = { edit: false, title: '', id: -1 }
  public loadedData?: WhsTransferFull
  public summedCost: number = 0

  editorConfig: AngularEditorConfig = {
    editable: false,
    spellcheck: false,
    height: 'auto',
    minHeight: '50px',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: false,
    showToolbar: false,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['bold', 'italic'],
      ['fontSize']
    ]
  }

  constructor(
    private cdref: ChangeDetectorRef,
    private cs: CommonService,
    dialogRef: NbDialogRef<SelectTableDialogComponent<InbetweenWarehouseProduct>>,
    kbS: KeyboardNavigationService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InbetweenWarehouseProduct>>,
    private productService: ProductService,
    private cdrf: ChangeDetectorRef,
    private dialogService: BbxDialogServiceService,
    statusService: StatusService,
    private tokenService: TokenStorageService,
    private whsTransferService: WhsTransferService,
    private stockService: StockService
  ) {
    super(dialogRef, kbS, dataSourceBuilder, statusService);

    this.allColumns = [
      'productCode',
      'productDescription',
      '_quantity',
      'unitOfMeasureX',
      'currAvgCost',
      'linePrice',
    ]
  
    this.colDefs = [
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

    this.dbDataTable = new SimpleNavigatableTable<InbetweenWarehouseProduct>(
      this.dataSourceBuilder, this.kbS, this.cdref, this.dbData, '', AttachDirection.UP, this
    );
    this.dbDataTable.InnerJumpOnEnter = true;
    this.dbDataTable.OuterJump = true;
  }

  override Setup(): void {
    this.dbData = [];
    this.dbDataSource = this.dataSourceBuilder.create(this.dbData);
    this.selectedRow = {} as InbetweenWarehouseProduct;

    this.IsDialog = true;
    this.InnerJumpOnEnter = true;
    this.OuterJump = true;

    this.Matrix = NavMap;

    this.inputForm = new FormGroup({
        whsTransferNumber: new FormControl(''),
        fromWarehouse: new FormControl(''),
        toWarehouse: new FormControl(''),
        transferDate: new FormControl(''),
        note: new FormControl('')
    });

    this.formNav = new NavigatableForm(
      this.inputForm, this.kbS, this.cdrf, [], this.inputFormId, AttachDirection.UP, {} as IInlineManager
    );
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

  private async createInbetweenProduct(product: Product): Promise<InbetweenWarehouseProduct|undefined> {
    if (this.dbData.find(x => x.data.productID === product.id)) {
      return
    }

    const productStocks = await this.stockService.getProductStock(product.id)
    const stock = productStocks.find(x => x.warehouseCode === this.tokenService.wareHouse?.warehouseCode)

    const inbetween = InbetweenWarehouseProduct.fromProductAndStock(product, stock)

    return inbetween
  }

  public RecalcNetAndVat(): void {
    this.summedCost = 0

    for(const { data: item } of this.dbData) {
      this.summedCost += item.linePrice
    }
  }

  private async LoadData(): Promise<void> {
    try {
      this.statusService.waitForLoad(true)

      const whsTransfer = await firstValueFrom(this.whsTransferService.Get({ ID: this.dataId }))
        .catch(err => {
          this.cs.HandleError(err)
        })

      if (whsTransfer !== undefined) {
        this.loadedData = whsTransfer

        this.inputForm.controls['whsTransferNumber'].setValue(whsTransfer.whsTransferNumber)
        this.inputForm.controls['fromWarehouse'].setValue(whsTransfer.fromWarehouse!.split('-')[1])
        this.inputForm.controls['toWarehouse'].setValue(whsTransfer.toWarehouse!.split('-')[1])
        this.inputForm.controls['transferDate'].setValue(whsTransfer.transferDate)
        this.inputForm.controls['note'].setValue(whsTransfer.notice)

        const _data: TreeGridNode<InbetweenWarehouseProduct>[] = []
        for (let i = 0; i < whsTransfer.whsTransferLines.length; i++) {
          const inbetweenProduct = await this.WhsTransferLinesToInbetweenWarehouseProducts(whsTransfer.whsTransferLines[i])
          if (inbetweenProduct !== undefined) {
            inbetweenProduct.Save()

            _data.push({ data: inbetweenProduct })
          }
        }

        this.dbDataTable.Setup(
          this.dbData,
          this.dbDataSource,
          this.allColumns,
          this.colDefs,
          [],
          'TABLE-CELL'
        )

        this.dbData = _data.concat(this.dbData)
        this.dbDataTable.data = this.dbData
        this.dbDataSource.setData(this.dbData)
        this.RecalcNetAndVat()

        this.dbDataTable.GenerateAndSetNavMatrices(true, false)
        this.statusService.waitForLoad(false)

        setTimeout(() => {
          this.kbS.SetCurrentNavigatable(this.dbDataTable)
          this.kbS.setEditMode(KeyboardModes.NAVIGATION)
          this.kbS.SelectFirstTile()
        }, 200);
      }
    }
    catch (err) {
      this.cs.HandleError(err)
    }
    finally {
      this.statusService.waitForLoad(false)
    }
  }

  override ngOnInit(): void {
    this.kbS.SetWidgetNavigatable(this)
    this.kbS.SetCurrentNavigatable(this)
    this.kbS.SetPositionById(this.Matrix[0][0])
    this.LoadData()
  }
  ngAfterViewInit(): void {
  }
  ngAfterContentInit(): void {
  }
  ngAfterViewChecked(): void {
  }
  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }

  exit(): void {
    this.close(undefined);
  }

  openProductStockInformationDialog(event: any, row: TreeGridNode<InbetweenWarehouseProduct>): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.productService.getProductByCodeAsync({ ProductCode: row.data.productCode! })
      .then(p => {
        this.detailsDialogOpened = true

        const dialogRef = this.dialogService.open(ProductStockInformationDialogComponent, {
          context: {
            product: p
          }
        });
        dialogRef.onClose.subscribe(async (res: Product) => {
          setTimeout(() => {
            this.detailsDialogOpened = false
          }, 500);
        })
      })
      .catch(err => {
        this.cs.HandleError(err)
      })
  }

  @HostListener('document:keydown', ['$event']) override onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case KeyBindings.exit: {
        if (this.detailsDialogOpened) {
          event.preventDefault()
          event.stopImmediatePropagation()
          event.stopPropagation()
          return
        }
        if (this.shouldCloseOnEscape) {
          event.preventDefault()
          // Closing dialog
          this.close(undefined)
        }
        break
      }
      default: { }
    }
  }
}
