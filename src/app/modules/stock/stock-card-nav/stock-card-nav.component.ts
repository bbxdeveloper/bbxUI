import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
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
import { FlatDesignNoFormNavigatableTable } from 'src/assets/model/navigation/FlatDesignNoFormNavigatableTable';
import { BaseNoFormManagerComponent } from '../../shared/base-no-form-manager/base-no-form-manager.component';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { CustomerService } from '../../customer/services/customer.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { IFunctionHandler } from 'src/assets/model/navigation/IFunctionHandler';
import { Actions, StockCardNavKeySettings, KeyBindings, GetFooterCommandListFromKeySettings } from 'src/assets/util/KeyBindings';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { InfrastructureService } from '../../infrastructure/services/infrastructure.service';
import { PrintAndDownloadService } from 'src/app/services/print-and-download.service';
import { GetStockCardsParamsModel } from '../models/GetStockCardsParamsModel';
import { StockCard } from '../models/StockCard';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { StockCardService } from '../services/stock-card.service';
import { Product } from '../../product/models/Product';
import { GetProductsParamListModel } from '../../product/models/GetProductsParamListModel';
import { ProductService } from '../../product/services/product.service';
import { ProductSelectTableDialogComponent } from '../../shared/product-select-table-dialog/product-select-table-dialog.component';
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
    'customer'
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
      label: 'Kapcs.',
      objectKey: 'xRel',
      colKey: 'xRel',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '120px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Vált.Valós',
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
      label: 'Új ELÁBÉ',
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
  ];

  override get getInputParams(): GetStockCardsParamsModel {
    let productId = this.productFilter?.id;
    if (productId !== undefined) {
      productId = HelperFunctions.ToInt(productId);
    }
    let wareHouseId = this.wh.find(x => x.warehouseDescription === this.filterForm.controls['WarehouseID'].value)?.id;
    return {
      PageNumber: this.dbDataTable.currentPage,
      PageSize: parseInt(this.dbDataTable.pageSize),

      WarehouseID: wareHouseId,
      XRel: this.filterForm.controls['InvoiceNumber'].value,
      StockCardDateFrom: this.filterForm.controls['StockCardDateFrom'].value,
      StockCardDateTo: this.filterForm.controls['StockCardDateTo'].value,

      OrderBy: "productCode",

      ProductID: productId,
    };
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

  private localStorageKey: string

  constructor(
    @Optional() dialogService: NbDialogService,
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

    this.refreshComboboxData();

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'stock-card-table';
    this.dbDataTableEditId = 'stock-card-cell-edit-input';

    this.kbS.ResetToRoot();

    this.Setup();
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.productCodeFromPath = this.route.snapshot.queryParams['productCode'];
    this.wareHouseFromPathString = this.route.snapshot.queryParams['wareHouse'];
    this.navigatedFromStock = !!this.productCodeFromPath && !!this.wareHouseIdFromPath;

    this.filterForm = new FormGroup({
      WarehouseID: new FormControl(this.wareHouseIdFromPath, [Validators.required]),
      ProductSearch: new FormControl(undefined, []),
      productCode: new FormControl(this.productCodeFromPath ?? undefined, []),
      productDescription: new FormControl(undefined, []),
      StockCardDateFrom: new FormControl(undefined, []),
      StockCardDateTo: new FormControl(undefined, []),
      InvoiceNumber: new FormControl(undefined, [])
    });

    this.filterForm.valueChanges.subscribe(newValue => this.localStorage.put(this.localStorageKey, newValue as FilterForm))

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
      next: () => {
        this.Refresh(this.getInputParams);
      },
    });
    this.dbDataTable.flatDesignForm.commandsOnForm = this.commands;

    this.filterFormNav!.OuterJump = true;
    this.dbDataTable!.OuterJump = true;

    // this.RefreshAll(this.getInputParams);
    this.isLoading = false;

    if (this.navigatedFromStock) {
      this.FillFormWithFirstAvailableProduct({target: {value: this.productCodeFromPath}}, true);
    }
  }

  private refreshComboboxData(): void {
    // WareHouse
    this.wareHouseApi.GetAll().subscribe({
      next: data => {
        this.wh = data?.data ?? [];
        this.wareHouseData$.next(this.wh.map(x => x.warehouseDescription));
        if (!HelperFunctions.isEmptyOrSpaces(this.wareHouseFromPathString)) {
          this.filterForm.controls['WarehouseID'].setValue(this.wareHouseFromPathString)
        }
      }
    });

  }

  override Refresh(params?: GetStockCardsParamsModel): void {
    console.log('Refreshing: ', params); // TODO: only for debug
    if (this.filterForm.invalid) {
      this.bbxToastrService.show(
        Constants.MSG_INVALID_FILTER_FORM,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    }
    this.isLoading = true;
    this.stockCardService.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetStockCards: response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable(undefined, true);
        } else {
          this.bbxToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
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

  async ngOnInit(): Promise<void> {
    const filterData = this.localStorage.get<FilterForm>(this.localStorageKey)
    if (filterData && filterData.ProductSearch && filterData.ProductSearch !== '') {
      this.filterForm.patchValue(filterData)

      this.productInputFilterString = filterData.ProductSearch ?? ''

      await this.getProductAsync()

      this.Refresh(this.getInputParams)
    }

    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    console.log("[ngAfterViewInit]");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.filterFormNav.GenerateAndSetNavMatrices(true, true, NavMatrixOrientation.ONLY_HORIZONTAL);
    this.AddSearchButtonToFormMatrix();
    console.log(this.filterFormNav.Matrix);

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.ReadonlySideForm = true;

    setTimeout(() => {
      this.kbS.SetCurrentNavigatable(this.filterFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);
    }, 200);
  }
  ngOnDestroy(): void {
    console.log('Detach');
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
    console.log(`[HandleFunctionKey]: ${val}`);
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

        console.log(`${this.KeySetting[Actions.ToggleForm].KeyLabel} Pressed: ${this.KeySetting[Actions.ToggleForm].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
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
          this.Refresh(this.getInputParams);
        }
      },
    });
  }

  private async getProductAsync(): Promise<void> {
    try {
      this.isLoading = true

      const request = this.getProductGetParams
      const res = await firstValueFrom(this.seC.GetAll(request))

      if (!!res && res.data !== undefined && res.data.length > 0) {
        this.productFilter = res.data[0];
        this.cachedProductName = res.data[0].description;
        this.SetProductFormFields(res.data[0]);
      } else {
        this.SetProductFormFields(undefined);
      }
    } catch (error) {
      this.cs.HandleError(error);
    } finally {
      this.isLoading = false
    }
  }

  ChooseDataForTableRow(rowIndex: number): void { }

  ChooseDataForCustomerForm(): void {
    console.log("Selecting Product from avaiable data.");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.productInputFilterString,
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs
      }
    });
    dialogRef.onClose.subscribe((res: Product) => {
      console.log("Selected item: ", res);
      if (!!res) {
        this.productFilter = res;
        this.SetProductFormFields(res);
      }
    });
  }
}