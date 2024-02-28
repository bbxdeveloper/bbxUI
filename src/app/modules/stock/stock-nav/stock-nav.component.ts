import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
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
import { Actions, StockNavKeySettings, KeyBindings, GetFooterCommandListFromKeySettings } from 'src/assets/util/KeyBindings';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { Router } from '@angular/router';
import { GetStocksParamsModel } from '../models/GetStocksParamsModel';
import { ExtendedStockData } from '../models/Stock';
import { StockService } from '../services/stock.service';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { notWhiteSpaceOrNull } from 'src/assets/model/Validators';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { ProductService } from '../../product/services/product.service';
import { Product } from '../../product/models/Product';
import { Subscription, lastValueFrom } from 'rxjs';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { UpdateStockLocationRequest } from '../models/UpdateStockLocationRequest';
import { LocationService } from '../../location/services/location.service';
import { Location } from '../../location/models/Location';
import { LoggerService } from 'src/app/services/logger.service';
import { UnitOfMeasure } from '../../product/models/UnitOfMeasure';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { ProductSelectTableDialogComponent, SearchMode } from '../../shared/dialogs/product-select-table-dialog/product-select-table-dialog.component';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { FilterForm } from './FilterForm';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

@Component({
  selector: 'app-stock-nav',
  templateUrl: './stock-nav.component.html',
  styleUrls: ['./stock-nav.component.scss']
})
export class StockNavComponent extends BaseManagerComponent<ExtendedStockData> implements IFunctionHandler, IInlineManager, OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  readonly SearchButtonId: string = 'stocks-button-search';
  IsTableFocused: boolean = false;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  isDeleteDisabled: boolean = false;

  locations: Location[] = [];

  // WareHouse
  wh: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  // Unit of measure
  unitOfMeasures: UnitOfMeasure[] = []

  private readonly localStorageKey: string

  override allColumns = [
    'productCode',
    'product',
    'realQty',
    'avgCost',
    'latestIn',
    'latestOut',
    'location'
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Termékkód',
      objectKey: 'productCode',
      colKey: 'productCode',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '20%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megnevezés',
      objectKey: 'product',
      colKey: 'product',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '60%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Készlet',
      objectKey: 'realQty',
      colKey: 'realQty',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: "125px",
      textAlign: "right",
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Átl.besz.',
      objectKey: 'avgCost',
      colKey: 'avgCost',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: "125px",
      textAlign: "right",
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Ut. bevét',
      objectKey: 'latestIn',
      colKey: 'latestIn',
      defaultValue: '',
      type: 'onlyDate',
      fRequired: true,
      mask: '',
      colWidth: "125px",
      textAlign: "left",
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Ut.kiad',
      objectKey: 'latestOut',
      colKey: 'latestOut',
      defaultValue: '',
      type: 'onlyDate',
      fRequired: true,
      mask: '',
      colWidth: "125px",
      textAlign: "left",
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Elhelyezés',
      objectKey: 'location',
      colKey: 'location',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '20%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    }
  ];

  public override getInputParams(override?: Constants.Dct): GetStocksParamsModel {
    let wareHouseId = this.wh.find(x => x.warehouseDescription === this.filterForm.controls['WarehouseID'].value)?.id
    const params = {
      PageNumber: 1,
      PageSize: parseInt(this.dbDataTable.pageSize),

      WarehouseID: wareHouseId,
      SearchString: this.filterForm.controls['SearchString'].value,

      OrderBy: "productCode"
    }
    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"]
    }
    return params
  }

  filterFormId = 'stocks-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: FlatDesignNoTableNavigatableForm;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  public override KeySetting: Constants.KeySettingsDct = StockNavKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  get IsTableActive(): boolean {
    return this.kbS.IsCurrentNavigatable(this.dbDataTable);
  }

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<ExtendedStockData>>,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private stockService: StockService,
    cs: CommonService,
    sts: StatusService,
    private router: Router,
    private wareHouseApi: WareHouseService,
    private khs: KeyboardHelperService,
    private productService: ProductService,
    private locationService: LocationService,
    loggerService: LoggerService,
    tokenService: TokenStorageService,
    private readonly localStorageService: LocalStorageService,
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);

    this.localStorageKey = 'stock-nav.' + tokenService.user?.id ?? 'everyone'

    this.Setup();
  }

  override GetRecordName(data: ExtendedStockData): string | number | undefined {
    return data.productCode
  }

  override ProcessActionPut(data?: IUpdateRequest<ExtendedStockData>): void {
    console.log('ActionPut: ', data?.data, JSON.stringify(data?.data));

    let locationId = null;
    if (!HelperFunctions.isEmptyOrSpaces(data?.data.location)) {
      const location = this.locations.find(x => x.locationDescription === data?.data.location);
      if (location) {
        locationId = HelperFunctions.ToInt(location.id);
      }
    }

    if (!!data && !!data.data) {
      const updateRequest = {
        id: HelperFunctions.ToInt(data.data.id),
        locationID: locationId
      } as UpdateStockLocationRequest;

      this.sts.pushProcessStatus(Constants.CRUDPutStatuses[Constants.CRUDPutPhases.UPDATING]);

      data.data.unitOfMeasure = this.unitOfMeasures.find(x => x.text === data.data.unitOfMeasure)?.value

      data.data.id = parseInt(data.data.id + '');
      this.stockService.UpdateLocation(updateRequest).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            this.stockService.Get({ ID: d.data.id }).subscribe({
              next: newData => {
                if (!!newData) {
                  newData.location = HelperFunctions.isEmptyOrSpaces(newData.location) ? undefined : newData.location?.split('-')[1];
                  const newRow = {
                    data: newData,
                  } as TreeGridNode<ExtendedStockData>
                  const newRowIndex = this.dbData.findIndex(x => x.data.id === newRow.data.id);
                  this.dbData[newRowIndex !== -1 ? newRowIndex : data.rowIndex].data.location = newRow.data.location;
                  this.dbData[newRowIndex !== -1 ? newRowIndex : data.rowIndex].data.locationID = newRow.data.locationID;
                  this.dbDataTable.SetDataForFormAndOpen(newRow, false, false);
                  this.simpleToastrService.show(
                    Constants.MSG_SAVE_SUCCESFUL,
                    Constants.TITLE_INFO,
                    Constants.TOASTR_SUCCESS_5_SEC
                  );
                  this.RefreshTable(newRow.data.id);
                  this.isLoading = false;
                  this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                }
              },
              error: (err) => {
                this.HandleError(err);
                this.dbDataTable.SetFormReadonly(false)
              },
            });
          } else {
            this.bbxToastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            this.dbDataTable.SetFormReadonly(false)
            this.kbS.ClickCurrentElement()
          }
        },
        error: (err) => {
          this.HandleError(err);
          this.dbDataTable.SetFormReadonly(false)
        },
      });
    }
  }

  ChooseDataForTableRow(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.filterForm.controls['SearchString'].value ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
        defaultSearchModeForEnteredFilter: SearchMode.SEARCH_NAME_CODE
      }
    });
    dialogRef.onClose.subscribe(async (res: Product) => {
      console.log("ChooseDataForTableRow Selected item: ", res);
      if (!!res) {
        this.filterForm.controls['SearchString'].setValue(res.productCode);
        this.filterForm.controls['ProductName'].setValue(res.description);
      }
      this.kbS.setEditMode(KeyboardModes.EDIT);
    });
  }
  ChooseDataForCustomerForm(): void {
    throw new Error('Method not implemented.');
  }

  private Setup(): void {
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'stocks-table';
    this.dbDataTableEditId = 'stocks-cell-edit-input';

    this.kbS.ResetToRoot();

    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.setupFilterForm()

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(undefined, []),
      productID: new FormControl(undefined, []),
      productCode: new FormControl(undefined, []),
      description: new FormControl(undefined, []),
      productGroup: new FormControl(undefined, []),
      origin: new FormControl(undefined, []),
      unitOfMeasure: new FormControl(undefined, []),
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
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'Stock',
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
        return {} as ExtendedStockData;
      },
      false
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.NewPageSelected.subscribe({
      next: async (newPageNumber: number) => {
        await this.Refresh(this.getInputParams({ 'PageNumber': newPageNumber }));
      },
    });
    this.dbDataTable.flatDesignForm.commandsOnForm = this.commands;

    this.dbDataTable!.OuterJump = true;

    this.isLoading = false;
  }

  private setupFilterForm(): void {
    this.filterForm = new FormGroup({
      WarehouseID: new FormControl(undefined, [Validators.required, notWhiteSpaceOrNull]),
      SearchString: new FormControl(undefined, []),
      ProductName: new FormControl(undefined, []),
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

    this.filterFormNav!.OuterJump = true;
  }

  //#region Refresh

  private async refreshComboboxData(): Promise<void> {
    this.isLoading = true;
    const warehousesRequest = lastValueFrom(this.wareHouseApi.GetAll())
    const locationsRequest = lastValueFrom(this.locationService.GetAll())
    const unitOfMeasuresRequest = lastValueFrom(this.productService.GetAllUnitOfMeasures())

    const requests = await Promise.all([
      warehousesRequest,
      locationsRequest,
      unitOfMeasuresRequest,
    ])

    this.isLoading = false

    // WareHouse
    if (!requests[0].succeeded) {
      this.cs.HandleError(requests[0].errors)
    }

    this.wh = requests[0]?.data ?? []
    this.wareHouseData$.next(this.wh.map(x => x.warehouseDescription))

    // Location
    if (!requests[1].succeeded) {
      this.cs.HandleError(requests[1].errors)
    }

    this.locations = requests[1]?.data ?? [];

    // UnitOfMeasures
    if (requests[2]) {
      this.unitOfMeasures = requests[2]
    }
  }

  protected async GetProductsData(productIds: number[]): Promise<Product[]> {
    let p: Product[] = [];

    await lastValueFrom(this.productService.GetAll({ IDList: productIds, PageSize: productIds.length + '' }))
      .then(res => {
        if (res && res.data !== undefined) {
          p = res.data;
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
      });

    return p;
  }

  override Refresh(params?: GetStocksParamsModel): void {
    if (this.filterForm.invalid) {
      this.bbxToastrService.show(
        Constants.MSG_INVALID_FILTER_FORM,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    }
    this.isLoading = true;
    this.stockService.GetAll(params).subscribe({
      next: async (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetStocks: response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = [];
            const productIds = d.data.map(x => x.productID)
            const products = await this.GetProductsData(productIds)
            for(let i = 0; i < d.data.length; i++) {
              const x = d.data[i];
              const _data = new ExtendedStockData(x);
              _data.FillProductFields(products.find(y => y.id === x.productID)!);
              _data.unitOfMeasure = _data.unitOfMeasureX
              _data.location = HelperFunctions.isEmptyOrSpaces(_data.location) ? undefined : _data.location?.split('-')[1];
              // console.dir(_data);
              tempData.push({ data: _data, uid: this.nextUid() });
            }
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
            // console.trace(this.dbData);
          }
          this.RefreshTable();
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
        setTimeout(() => {
          if (this.kbS.Here === this.SearchButtonId) {
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
          }
        }, 150);
      },
    });
  }

  async RefreshButtonClicked(): Promise<void> {
    await this.RefreshAsync(this.getInputParams());
  }

  async RefreshAsync(params?: GetStocksParamsModel): Promise<void> {
    console.log('Refreshing: ', params); // TODO: only for debug
    if (this.filterForm.invalid) {
      this.bbxToastrService.showError(Constants.MSG_INVALID_FILTER_FORM);
      return;
    }

    this.isLoading = true;

    await lastValueFrom(this.stockService.GetAll(params))
      .then(async d => {
        if (!d.succeeded || !d.data) {
          this.bbxToastrService.show(d.errors!.join('\n'));
          return
        }

        const tempData = [];
        const productIds = d.data.map(x => x.productID)
        const products = await this.GetProductsData(productIds)

        for (let i = 0; i < d.data.length; i++) {
          const _data = new ExtendedStockData(d.data[i]);

          const product = products.find(y => y.id === _data.productID)
          if (product) {
            _data.FillProductFields(product);
            _data.unitOfMeasure = _data.unitOfMeasureX
            _data.location = HelperFunctions.isEmptyOrSpaces(_data.location) ? undefined : _data.location?.split('-')[1];

            tempData.push({ data: _data, uid: this.nextUid() });
          }
        }

        this.dbData = tempData;
        this.dbDataDataSrc.setData(this.dbData);
        this.dbDataTable.SetPaginatorData(d);

        this.RefreshTable(undefined, true);
      })
      .catch(err => {
        this.cs.HandleError(err);
        this.isLoading = false;
      })
      .finally(() => {
        this.isLoading = false;
        setTimeout(() => {
          if (this.kbS.Here === this.SearchButtonId) {
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
          }
        }, 150);
      });
  }

  //#endregion Refresh

  async ngOnInit(): Promise<void> {
    this.fS.pushCommands(this.commands);

    await this.refreshComboboxData()

    this.filterForm.valueChanges.subscribe((value: FilterForm) => {
      this.localStorageService.put(this.localStorageKey, {
        WarehouseID: value.WarehouseID,
        SearchString: value.SearchString,
      });
    })

    const filter = this.localStorageService.get<FilterForm>(this.localStorageKey)
    if (filter) {
      this.filterForm.patchValue(filter)

      await this.RefreshButtonClicked()
    }
  }

  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.filterFormNav.GenerateAndSetNavMatrices(true, true, NavMatrixOrientation.ONLY_HORIZONTAL);
    this.AddSearchButtonToFormMatrix();
    console.log(this.filterFormNav.Matrix);

    this.dbDataTable.GenerateAndSetNavMatrices(true);

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
      case this.KeySetting[Actions.Details].KeyCode:
        this.GoToStockCard();
        break;
    }
  }

  GoToStockCard(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      console.log(this.dbData, this.kbS.p.y - 1)
      const productCode = this.dbData[this.kbS.p.y].data.productCode;
      this.router.navigate(['stock-card/nav'], {
        queryParams: {
          productCode: productCode,
          wareHouse: this.filterForm.controls['WarehouseID'].value
        }
      })
    }
  }

  Create(): void {}

  Edit(): void {}

  Delete(): void {}

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onKeyDown2(event: KeyboardEvent) {
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.filterFormNav?.HandleFormShiftEnter(event)
      return;
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      HelperFunctions.StopEvent(event)
      return;
    }

    if (this.khs.IsKeyboardBlocked) {
      HelperFunctions.StopEvent(event)
      return;
    }

    switch (event.key) {
      case KeyBindings.F11: {
        HelperFunctions.StopEvent(event)
        break
      }
      case this.KeySetting[Actions.CSV].KeyCode:
      case this.KeySetting[Actions.Email].KeyCode:
      case this.KeySetting[Actions.Details].KeyCode:
      case this.KeySetting[Actions.Create].KeyCode:
      case this.KeySetting[Actions.Reset].KeyCode:
      case this.KeySetting[Actions.Save].KeyCode:
      case this.KeySetting[Actions.Delete].KeyCode:
      case this.KeySetting[Actions.Print].KeyCode:
      case this.KeySetting[Actions.JumpToForm].KeyCode:
      case this.KeySetting[Actions.Details].KeyCode:
        HelperFunctions.StopEvent(event)
        this.HandleFunctionKey(event);
        break;
    }

    switch (event.key) {
      case this.KeySetting[Actions.Lock].KeyCode: {
        HelperFunctions.StopEvent(event)
        break;
      }
      case this.KeySetting[Actions.Edit].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          break
        }

        console.log(`${this.KeySetting[Actions.Edit].KeyLabel} Pressed: ${this.KeySetting[Actions.Edit].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          break
        }

        console.log(`${this.KeySetting[Actions.ToggleForm].KeyLabel} Pressed: ${this.KeySetting[Actions.ToggleForm].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          break
        }

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      default: { }
    }
  }

  //#region Product search input

  private Subscription_FillFormWithFirstAvailableProduct?: Subscription;
  productInputFilterString: string = '';

  productInputKeydown(event: Event | KeyBindings): void {
    const val = event instanceof Event ? (event as KeyboardEvent).code : event;
    switch (val) {
      // SEARCH
      case this.KeySetting[Actions.Search].KeyCode:
        this.ChooseDataForTableRow();
        break;
    }
  }

  FillFormWithFirstAvailableProduct(event: any): void {
    this.isLoading = true;

    if (!!this.Subscription_FillFormWithFirstAvailableProduct && !this.Subscription_FillFormWithFirstAvailableProduct.closed) {
      this.Subscription_FillFormWithFirstAvailableProduct.unsubscribe();
    }

    this.productInputFilterString = event.target.value ?? '';

    if (HelperFunctions.isEmptyOrSpaces(this.productInputFilterString)) {
      this.filterForm.controls['SearchString'].setValue(undefined);
      this.filterForm.controls['ProductName'].setValue(undefined);
      this.isLoading = false;
      return;
    }

    // All 3-length productCodes ends with a '-' character.
    if (this.productInputFilterString.length === 3) {
      this.productInputFilterString += '-'
    }

    this.Subscription_FillFormWithFirstAvailableProduct = this.productService.GetProductByCode({
      ProductCode: this.productInputFilterString
    } as GetProductByCodeRequest).subscribe({
      next: res => {
        if (!!res && Object.keys(res).includes('productCode') && !HelperFunctions.isEmptyOrSpaces(res.productCode)) {
          this.filterForm.controls['SearchString'].setValue(res.productCode);
          this.filterForm.controls['ProductName'].setValue(res.description);
        } else {
          this.filterForm.controls['ProductName'].setValue(undefined);
        }
      },
      error: (err) => {
        this.cs.HandleError(err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  //#endregion Product search input
}