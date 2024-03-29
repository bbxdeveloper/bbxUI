import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { TileCssClass, AttachDirection, TileCssColClass, NavMatrixOrientation } from 'src/assets/model/navigation/Navigatable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { IFunctionHandler } from 'src/assets/model/navigation/IFunctionHandler';
import { Actions, StockCardNavKeySettings, KeyBindings, GetFooterCommandListFromKeySettings } from 'src/assets/util/KeyBindings';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { ActivatedRoute } from '@angular/router';
import { GetStockCardsParamsModel } from '../models/GetStockCardsParamsModel';
import { StockCard } from '../models/StockCard';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { StockCardService } from '../services/stock-card.service';
import { Product } from '../../product/models/Product';
import { GetProductsParamListModel } from '../../product/models/GetProductsParamListModel';
import { ProductService } from '../../product/services/product.service';
import { ProductSelectTableDialogComponent, SearchMode } from '../../shared/dialogs/product-select-table-dialog/product-select-table-dialog.component';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Subscription, firstValueFrom } from 'rxjs';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { LoggerService } from 'src/app/services/logger.service';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { FilterForm } from './FitlerForm';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

@Component({
  selector: 'app-stock-card-nav',
  templateUrl: './stock-card-nav.component.html',
  styleUrls: ['./stock-card-nav.component.scss']
})
export class StockCardNavComponent extends BaseManagerComponent<StockCard> implements IFunctionHandler, IInlineManager, OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;
  productCodeFromPath?: string;
  wareHouseIdFromPath?: number;
  navigatedFromStock = false;

  protected Subscription_FillFormWithFirstAvailableProduct?: Subscription;

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  readonly SearchButtonId: string = 'stock-card-button-search';
  IsTableFocused: boolean = false;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  isDeleteDisabled: boolean = false;

  // Product search
  productInputFilterString: string = '';
  cachedProductName?: string = "";

  // WareHouse
  wh: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  productFilter?: Product = { id: -1 } as Product;

  wareHouseFromPathString?: string

  get getProductGetParams(): GetProductsParamListModel {
    return {
      PageNumber: '1',
      PageSize: '1',
      SearchString: this.productInputFilterString.trim(),
      OrderBy: 'ProductCode',
      FilterByName: true,
      FilterByCode: true,
    };
  }

  override allColumns = [
    'scTypeX',
    'warehouse',
    'stockCardDate',
    'productCode',
    'product',
    'customer',
    'oRealQty',
    'xRealQty',
    'nRealQty',
    'xRel',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Típus',
      objectKey: 'scTypeX',
      colKey: 'scTypeX',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '100px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Raktár',
      objectKey: 'warehouse',
      colKey: 'warehouse',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Dátum',
      objectKey: 'stockCardDate',
      colKey: 'stockCardDate',
      defaultValue: '',
      type: 'onlyDate',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Termékkód',
      objectKey: 'productCode',
      colKey: 'productCode',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '15%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Terméknév',
      objectKey: 'product',
      colKey: 'product',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '50%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Ügyfélnév',
      objectKey: 'customer',
      colKey: 'customer',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '35%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'E.Klt.',
      objectKey: 'oRealQty',
      colKey: 'oRealQty',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: "120px",
      textAlign: "right",
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Vált.',
      objectKey: 'xRealQty',
      colKey: 'xRealQty',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: "120px",
      textAlign: "right",
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Ú.Klt.',
      objectKey: 'nRealQty',
      colKey: 'nRealQty',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: "120px",
      textAlign: "right",
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megjegyzés',
      objectKey: 'xRel',
      colKey: 'xRel',
      defaultValue: '',
      type: 'string',
      fRequired: true,
      mask: '',
      colWidth: "130px",
      textAlign: "right",
      navMatrixCssClass: TileCssClass,
    },
  ];

  public override getInputParams(override?: Constants.Dct): GetStockCardsParamsModel {
    let productId = this.productFilter?.id;
    if (productId !== undefined) {
      productId = HelperFunctions.ToInt(productId);
    }
    let wareHouseId = this.wh.find(x => x.warehouseDescription === this.filterForm.controls['WarehouseID'].value)?.id;
    const params = {
      PageNumber: 1,
      PageSize: parseInt(this.dbDataTable.pageSize),

      WarehouseID: wareHouseId,
      XRel: this.filterForm.controls['InvoiceNumber'].value,
      StockCardDateFrom: this.filterForm.controls['StockCardDateFrom'].value,
      StockCardDateTo: this.filterForm.controls['StockCardDateTo'].value,

      OrderBy: "stockCardDate",

      ProductID: productId,
    }
    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"]
    }
    return params
  }

  filterFormId = 'stock-card-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: FlatDesignNoTableNavigatableForm;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  public override KeySetting: Constants.KeySettingsDct = StockCardNavKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  get IsTableActive(): boolean {
    return this.kbS.IsCurrentNavigatable(this.dbDataTable);
  }

  private readonly localStorageKey: string

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<StockCard>>,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private stockCardService: StockCardService,
    private seC: ProductService,
    private route: ActivatedRoute,
    cs: CommonService,
    sts: StatusService,
    private wareHouseApi: WareHouseService,
    private khs: KeyboardHelperService,
    loggerService: LoggerService,
    tokenService: TokenStorageService,
    private readonly localStorage: LocalStorageService,
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);

    this.localStorageKey = 'stock-card-nav.' + tokenService.user?.id ?? 'everyone'

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'stock-card-table';
    this.dbDataTableEditId = 'stock-card-cell-edit-input';

    this.kbS.ResetToRoot();

    this.Setup();
  }

  override GetRecordName(data: StockCard): string | number | undefined {
    return data.productCode
  }

  private async HandlePathParams(): Promise<void> {
    this.productCodeFromPath = this.route.snapshot.queryParams['productCode']
    this.wareHouseFromPathString = this.route.snapshot.queryParams['wareHouse']
    this.navigatedFromStock = !!this.productCodeFromPath && !!this.wareHouseFromPathString

    if (this.navigatedFromStock) {
      let c = this.filterForm.controls

      c['WarehouseID'].setValue(this.wareHouseFromPathString)
      c['ProductSearch'].setValue(this.productCodeFromPath)
    }
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.filterForm = new FormGroup({
      WarehouseID: new FormControl(this.wareHouseIdFromPath, [Validators.required]),
      ProductSearch: new FormControl(this.productCodeFromPath ?? undefined, []),
      productCode: new FormControl(this.productCodeFromPath ?? undefined, []),
      productDescription: new FormControl(undefined, []),
      StockCardDateFrom: new FormControl(undefined, []),
      StockCardDateTo: new FormControl(undefined, []),
      InvoiceNumber: new FormControl(undefined, [])
    });

    this.filterFormNav = new FlatDesignNoTableNavigatableForm(
      this.filterForm,
      this.kbS,
      this.cdref, [], this.filterFormId,
      AttachDirection.DOWN,
      this.colDefs,
      this.bbxSidebarService,
      this.fS,
      this.dbDataTable,
      this
    );

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(0, []),
      scTypeX: new FormControl(undefined, []),
      warehouse: new FormControl(undefined, []),
      stockCardDate: new FormControl(undefined, []),
      productCode: new FormControl(undefined, []),
      product: new FormControl(undefined, []),
      customer: new FormControl(undefined, []),
      customerAdditionalAddressDetail: new FormControl(undefined, []),
      xRel: new FormControl(undefined, []),
      oRealQty: new FormControl(undefined, []),
      xRealQty: new FormControl(undefined, []),
      nRealQty: new FormControl(undefined, []),
      oAvgCost: new FormControl(undefined, []),
      nAvgCost: new FormControl(undefined, []),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'StockCard',
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.RIGHT,
      this.bbxSidebarService,
      this.sidebarFormService,
      this,
      () => {
        return {} as StockCard;
      },
      false
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams({ 'PageNumber': newPageNumber }));
      },
    });
    this.dbDataTable.flatDesignForm.commandsOnForm = this.commands;

    this.filterFormNav!.OuterJump = true;
    this.dbDataTable!.OuterJump = true;

    this.isLoading = false;
  }

  private async GetWareHouses(): Promise<void> {
    try {
      this.sts.waitForLoad(true)
      const data = await this.wareHouseApi.GetAllPromise({ PageSize: '1000' });
      if (data.succeeded && !!data.data) {
        this.wh = data?.data ?? [];
        this.wareHouseData$.next(this.wh.map(x => x.warehouseDescription));
        if (!HelperFunctions.isEmptyOrSpaces(this.wareHouseFromPathString)) {
          this.filterForm.controls['WarehouseID'].setValue(this.wareHouseFromPathString)
        }
      } else {
        this.HandleError(data.errors);
      }
      this.sts.waitForLoad(false)
    } catch (error) {
      this.cs.HandleError(error);
    }
  }

  override Refresh(params?: GetStockCardsParamsModel): void {
    if (this.filterForm.invalid) {
      this.bbxToastrService.showError(Constants.MSG_INVALID_FILTER_FORM);
      return;
    }

    this.isLoading = true;
    this.stockCardService.GetAll(params).subscribe({
      next: (d) => {
        if (!d.succeeded || !d.data) {
          this.bbxToastrService.showError(d.errors!.join('\n'));
          return
        }

        this.dbData = d.data.map((x) => {
          return { data: Object.assign(new StockCard(), x), uid: this.nextUid() };
        });
        this.dbDataDataSrc.setData(this.dbData);
        this.dbDataTable.SetPaginatorData(d);
        this.RefreshTable(undefined, true);
      },
      error: (err) => {
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  public resetFilter(): void {
    this.localStorage.remove(this.localStorageKey)
    this.filterForm.reset()
  }

  async ngOnInit(): Promise<void> {
    await this.GetWareHouses()

    this.filterForm.valueChanges.subscribe(newValue => {
      this.localStorage.put(this.localStorageKey, newValue as FilterForm)
    })

    this.HandlePathParams()

    if (this.navigatedFromStock) {
      await this.getProductAsync(this.productCodeFromPath)
      this.Refresh(this.getInputParams())
    } else {
      const filterData = this.localStorage.get<FilterForm>(this.localStorageKey)
      if (filterData && filterData.ProductSearch && filterData.ProductSearch !== '') {
        this.filterForm.patchValue(filterData)

        this.productInputFilterString = filterData.ProductSearch ?? ''

        await this.getProductAsync()
        this.Refresh(this.getInputParams())
      }
    }

    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.filterFormNav.GenerateAndSetNavMatrices(true, true, NavMatrixOrientation.ONLY_HORIZONTAL);
    this.AddSearchButtonToFormMatrix();

    this.kbS.SetCurrentNavigatable(this.filterFormNav);

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.ReadonlySideForm = true;

    setTimeout(() => {
      this.kbS.SetCurrentNavigatable(this.filterFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);
    }, 200);
  }
  ngOnDestroy(): void {
    this.kbS.Detach();
  }

  private AddSearchButtonToFormMatrix(): void {
    this.filterFormNav.Matrix[this.filterFormNav.Matrix.length - 1].push(this.SearchButtonId);
  }


  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this.filterFormNav!.HandleFormEnter(event, true, true, true);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.kbS.MoveRight();
      this.kbS.SelectCurrentElement();
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  RefreshData(): void { }
  TableRowDataChanged(changedData?: any, index?: number, col?: string): void { }
  RecalcNetAndVat(): void { }

  HandleFunctionKey(event: Event | KeyBindings): void {
    const val = event instanceof Event ? (event as KeyboardEvent).code : event;
    switch (val) {
      // NEW
      case this.KeySetting[Actions.Create].KeyCode:
        this.Create();
        break;
      // EDIT
      case this.KeySetting[Actions.Edit].KeyCode:
        this.Edit();
        break;
      // DELETE
      case this.KeySetting[Actions.Delete].KeyCode:
        if (!this.isDeleteDisabled) {
          this.Delete();
        }
        break;
    }
  }

  Create(): void { }

  Edit(): void { }

  Delete(): void { }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.filterFormNav?.HandleFormShiftEnter(event)
      return;
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }

    if (this.khs.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }

    switch (event.key) {
      case KeyBindings.F11: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        break
      }
      case this.KeySetting[Actions.Create].KeyCode:
      case this.KeySetting[Actions.Edit].KeyCode:
      case this.KeySetting[Actions.Delete].KeyCode:
      case this.KeySetting[Actions.JumpToForm].KeyCode:
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.HandleFunctionKey(event);
        break;
    }

    switch (event.key) {
      case this.KeySetting[Actions.Lock].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        break;
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        this.dbDataTable?.HandleKey(event);
        break;
      }
      default: { }
    }
  }

  private SetProductFormFields(data?: Product) {
    if (data === undefined) {
      this.filterForm.controls['productCode'].setValue(undefined);
      this.filterForm.controls['productDescription'].setValue(undefined);
      return;
    }
    this.filterForm.controls['productCode'].setValue(data.productCode);
    this.filterForm.controls['productDescription'].setValue(data.description);
  }

  FillFormWithFirstAvailableProduct(event: any, refreashAfter: boolean = false): void {
    if (!!this.Subscription_FillFormWithFirstAvailableProduct && !this.Subscription_FillFormWithFirstAvailableProduct.closed) {
      this.Subscription_FillFormWithFirstAvailableProduct.unsubscribe();
    }

    this.productInputFilterString = event.target.value ?? '';

    if (this.productInputFilterString.replace(' ', '') === '') {
      this.productFilter = { id: -1 } as Product;
      this.SetProductFormFields(undefined);
      return;
    }

    this.isLoading = true;

    this.Subscription_FillFormWithFirstAvailableProduct = this.seC.GetAll(this.getProductGetParams).subscribe({
      next: res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.productFilter = res.data[0];
          this.cachedProductName = res.data[0].description;
          this.SetProductFormFields(res.data[0]);
        } else {
          this.SetProductFormFields(undefined);
        }
      },
      error: (err) => {
        this.cs.HandleError(err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
        if (refreashAfter) {
          this.Refresh(this.getInputParams());
        }
      },
    });
  }

  private async getProductAsync(exactProductCode: string = ''): Promise<void> {
    try {
      this.isLoading = true

      if (!HelperFunctions.isEmptyOrSpaces(exactProductCode)) {
        const request = { ProductCode: exactProductCode } as GetProductByCodeRequest
        const res = await firstValueFrom(this.seC.GetProductByCode(request))

        if (!!res && Object.keys(res).includes('productCode') && !HelperFunctions.isEmptyOrSpaces(res.productCode)) {
          this.productFilter = res;
          this.cachedProductName = res.description;
          this.SetProductFormFields(res);
        } else {
          this.SetProductFormFields(undefined);
        }
      } else {
        const request = this.getProductGetParams
        const res = await firstValueFrom(this.seC.GetAll(request))

        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.productFilter = res.data[0];
          this.cachedProductName = res.data[0].description;
          this.SetProductFormFields(res.data[0]);
        } else {
          this.SetProductFormFields(undefined);
        }
      }
    } catch (error) {
      this.cs.HandleError(error);
    } finally {
      this.isLoading = false
    }
  }

  ChooseDataForTableRow(rowIndex: number): void { }

  ChooseDataForCustomerForm(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.productInputFilterString,
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
        defaultSearchModeForEnteredFilter: SearchMode.SEARCH_NAME_CODE
      }
    });
    dialogRef.onClose.subscribe((res: Product) => {
      if (!!res) {
        this.productFilter = res;
        this.SetProductFormFields(res);
      }
    });
  }
}