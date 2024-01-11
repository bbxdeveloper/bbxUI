import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NbDialogRef, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { createMask } from '@ngneat/input-mask';
import { BehaviorSubject } from 'rxjs';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { BlankComboBoxValue } from 'src/assets/model/navigation/Nav';
import { TileCssClass, TileCssColClass, AttachDirection, NavigatableType } from 'src/assets/model/navigation/Navigatable';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { Product, ProductStockInfo } from '../../../product/models/Product';
import { BaseNavigatableComponentComponent } from '../../base-navigatable-component/base-navigatable-component.component';
import { LocationService } from 'src/app/modules/location/services/location.service';
import { Location } from 'src/app/modules/location/models/Location';
import { StockService } from 'src/app/modules/stock/services/stock.service';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { ExtendedStockData } from 'src/app/modules/stock/models/Stock';
import { FlatDesignNoFormNavigatableTable } from 'src/assets/model/navigation/FlatDesignNoFormNavigatableTable';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdater } from 'src/assets/model/UpdaterInterfaces';

@Component({
  selector: 'app-product-stock-information-dialog',
  templateUrl: './product-stock-information-dialog.component.html',
  styleUrls: ['./product-stock-information-dialog.component.scss']
})
export class ProductStockInformationDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked, AfterViewInit {
  @Input() product?: Product

  @Input() allColumns: string[] = [
    'warehouseDescription',
    'realQty',
    'avgCost',
    'latestIn',
    'latestOut'
  ]
  @Input() colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Raktár', objectKey: 'warehouseDescription', colKey: 'warehouseDescription',
      defaultValue: '', type: 'string', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "200px", textAlign: "left", fInputType: ''
    },
    {
      label: 'Készlet', objectKey: 'realQty', colKey: 'realQty',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Átl besz.ár', objectKey: 'avgCost', colKey: 'avgCost',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Bevét', objectKey: 'latestIn', colKey: 'latestIn',
      defaultValue: '', type: 'onlyDate', fInputType: 'date', navMatrixCssClass: TileCssClass,
      mask: '', colWidth: '100px', textAlign: 'left', fReadonly: false
    },
    {
      label: 'Kiadás', objectKey: 'latestOut', colKey: 'latestOut',
      defaultValue: '', type: 'onlyDate', fInputType: 'date', navMatrixCssClass: TileCssClass,
      mask: '', colWidth: '100px', textAlign: 'left', fReadonly: false
    }
  ]
  dbData!: TreeGridNode<ProductStockInfo>[];
  dbDataSource!: NbTreeGridDataSource<TreeGridNode<ProductStockInfo>>;
  dbDataTable!: FlatDesignNoFormNavigatableTable<ProductStockInfo>;
  selectedRow!: ProductStockInfo;
  dbDataTableForm!: FormGroup;
  dbDataTableId: string = 'product-stocks';
  trackRows(index: number, row: any) {
    return row.uid;
  }
  private uid = 0;
  protected nextUid() {
    ++this.uid;
    return this.uid;
  }

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  override NavigatableType = NavigatableType.dialog

  public get saveIsDisabled(): boolean {
    if (this._form !== undefined && this._form.form !== undefined) {
      return this._form.form.invalid;
    } else {
      return true;
    }
  }

  customPatterns: any = {
    A: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä]') },
    C: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä]') }
  };

  numberInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0',
  });

  numberInputMaskInteger = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 0,
    digitsOptional: true,
    prefix: '',
    placeholder: '0',
  });

  blankOptionText: string = BlankComboBoxValue;
  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  closedManually: boolean = false;
  isLoading: boolean = true;

  _form?: FlatDesignNoTableNavigatableForm;
  productForm: FormGroup;
  sumFormId: string = "ProductStockInformationDialogComponentForm";

  // Location
  _locations: Location[] = [];
  locations: string[] = [];
  locationsComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(
    private bbxsb: BbxSidebarService,
    private cdref: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<ProductStockInformationDialogComponent>,
    private kbS: KeyboardNavigationService,
    private fs: FooterService,
    private sts: StatusService,
    private bbxToastrService: BbxToastrService,
    private locationService: LocationService,
    private stockService: StockService,
    private tokenService: TokenStorageService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<ProductStockInfo>>,
    private sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private fS: FooterService
  ) {
    super();

    this.Setup();

    this.productForm = new FormGroup({
      id: new FormControl(undefined, []),
      productID: new FormControl(undefined, []),
      productCode: new FormControl(undefined, []),
      description: new FormControl(undefined, []),
      productGroup: new FormControl(undefined, []),
      origin: new FormControl(undefined, []),
      unitOfMeasureX: new FormControl(undefined, []),
      unitPrice1: new FormControl(undefined, []),
      unitPrice2: new FormControl(undefined, []),
      latestSupplyPrice: new FormControl(undefined, []),
      minStock: new FormControl(undefined, []),
      ordUnit: new FormControl(undefined, []),
      productFee: new FormControl(undefined, []),
      active: new FormControl(false, []),
      vtsz: new FormControl(undefined, []),
      ean: new FormControl(undefined, []),
      vatRateCode: new FormControl(undefined, []),
      noDiscount: new FormControl(false, []),
      realQty: new FormControl(0, []),
      avgCost: new FormControl(0, []),
      latestIn: new FormControl(0, []),
      latestOut: new FormControl(undefined, []),
      location: new FormControl(undefined, []),
      unitWeight: new FormControl(undefined, []),
    });

    this.refreshComboboxData();

    this.dbDataTableForm = new FormGroup({});
    this.dbDataTable = new FlatDesignNoFormNavigatableTable(
      this.dbDataTableForm,
      'ProductStockInfo',
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.UP,
      this.sidebarService,
      this.sidebarFormService,
      {} as IUpdater<ProductStockInfo>,
      () => {
        return {} as ProductStockInfo;
      }
    )
    this.dbDataTable.InnerJumpOnEnter = true;
    this.dbDataTable.OuterJump = true;
  }

  focusOnTable(focusIn: boolean): void {
    // this.tableIsFocused = focusIn;
    // if (this.isSideBarOpened) {
    //   return;
    // }
    // if (focusIn) {
    //   this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    //   this.dbDataTable.PushFooterCommandList();
    // } else {
    //   this.fS.pushCommands(this.commands);
    // }
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button-close"]];
  }
  
  RefreshTable(selectAfterRefresh?: any, setAsCurrent: boolean = false): void {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataSource,
      this.allColumns,
      this.colDefs,
      [],
      undefined
    )
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(false, selectAfterRefresh);
      if (setAsCurrent && this.dbDataTable.Matrix.length > 0 && this.dbDataTable.Matrix[0].length > 0) {
        this.kbS.SetCurrentNavigatable(this.dbDataTable)
        this.kbS.SelectFirstTile()
      }
      this.kbS.ClickCurrentElement(true)
    }, 200);
  }

  async loadProductData(): Promise<void> {
    this.sts.waitForLoad(true)

    const wareHouse = this.tokenService.wareHouse

    if (!wareHouse) {
      this.bbxToastrService.showError(Constants.MSG_ERROR_NO_WAREHOUSE_SELECTED)
      this.sts.waitForLoad(false)
      return
    }

    if (!this.product) {
      this.bbxToastrService.showError(Constants.MSG_ERROR_NO_PRODUCT_SELECTED)
      this.sts.waitForLoad(false)
      return
    }

    let _data = new ExtendedStockData()
    const productStocks = await this.stockService.getProductStock(this.product.id)

    if (!productStocks || productStocks.length == 0) {
      this.bbxToastrService.showError(Constants.MSG_ERROR_NO_PRODUCTSTOCK_AVAILABLE)
    } else {
      const warehouseID = wareHouse.id
      const productStock = productStocks.find(x => x.warehouseID === warehouseID)

      if (!productStock || !(productStock.id !== undefined && productStock.id !== 0)) {
        this.bbxToastrService.showError(Constants.MSG_ERROR_NO_PRODUCTSTOCK_AVAILABLE_FOR_WAREHOUSE)
      } else {
        _data = new ExtendedStockData(productStock!);
        _data.location = HelperFunctions.isEmptyOrSpaces(_data.location) ? undefined : _data.location?.split('-')[1];
      }
    }

    _data.FillProductFields(this.product);
    this.productForm.patchValue(_data)
    this.productForm.controls['productID'].setValue(this.product.id)
    if (this.productForm.controls['id'].value === -1) {
      this.productForm.controls['id'].setValue(undefined)
    }

    this.dbData = []
    this.dbDataSource = this.dataSourceBuilder.create(this.dbData)
    this.selectedRow = {} as ProductStockInfo

    const stocks = this.product.stocks?.sort((a, b) => {
      var n1 = a.warehouseID;
      var n2 = b.warehouseID;
      if (n1 > n2) {
        return 1;
      }
      if (n1 < n2) {
        return -1;
      }
      return 0;
    }) ?? []
    const tempData = stocks.map((x) => {
      return { data: x, uid: this.nextUid() };
    });

    this.dbData = tempData;
    this.dbDataSource.setData(this.dbData);
    this.RefreshTable()

    this.sts.waitForLoad(false)
  }

  override ngOnInit(): void {
  }
  ngAfterContentInit(): void { }
  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }
  ngAfterViewChecked(): void {
  }
  async ngAfterViewInit(): Promise<void> {
    this.kbS.SetWidgetNavigatable(this);
    this.SetNewForm(this.productForm);

    this.kbS.SelectFirstTile()

    // We can move onto the confirmation buttons from the form.
    this._form!.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;

    await this.loadProductData()

    this.kbS.SelectFirstTile()
  }

  private SetNewForm(form?: FormGroup): void {
    this._form = new FlatDesignNoTableNavigatableForm(
      this.productForm,
      this.kbS,
      this.cdref,
      [],
      this.sumFormId,
      AttachDirection.UP,
      [],
      this.bbxsb,
      this.fs
    );
    this._form.IsFootersEnabled = false;

    console.log("[SetNewForm] ", this._form); // TODO: only for debug

    this.cdref.detectChanges();
  }

  close() {
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable();
    this.dialogRef.close(undefined);
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this._form!.HandleFormEnter(event);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.kbS.Jump(AttachDirection.DOWN, false);
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  private refreshComboboxData(): void {
    this.locationService.GetAll({ PageSize: '99999' }).subscribe({
      next: data => {
        console.log("Locations: ", data);
        this._locations = data?.data ?? [];
        this.locations = this._locations.map(x => x.locationDescription) ?? [];
        this.locationsComboData$.next(this.locations);
      }
    });
  }

  moveCursor(codeInput: any): void {
    setTimeout(function () {
      codeInput.setSelectionRange(0, 0);
    }, 100);
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.key == KeyBindings.exit || event.key == KeyBindings.exitIE) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      this.close()
    }
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this._form?.HandleFormShiftEnter(event)
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
  }
}
