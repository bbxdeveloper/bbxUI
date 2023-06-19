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
import { Actions, StockNavKeySettings, KeyBindings, GetFooterCommandListFromKeySettings } from 'src/assets/util/KeyBindings';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { Router } from '@angular/router';
import { InfrastructureService } from '../../infrastructure/services/infrastructure.service';
import { PrintAndDownloadService } from 'src/app/services/print-and-download.service';
import { GetStocksParamsModel } from '../models/GetStocksParamsModel';
import { ExtendedStockData, Stock } from '../models/Stock';
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
import { lastValueFrom } from 'rxjs';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { UpdateLocationRequest } from '../../location/models/UpdateLocationRequest';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { UpdateStockLocationRequest } from '../models/UpdateStockLocationRequest';
import { LocationService } from '../../location/services/location.service';
import { Location } from '../../location/models/Location';
import { LoggerService } from 'src/app/services/logger.service';

@Component({
  selector: 'app-stock-nav',
  templateUrl: './stock-nav.component.html',
  styleUrls: ['./stock-nav.component.scss']
})
export class StockNavComponent extends BaseManagerComponent<ExtendedStockData> implements IFunctionHandler, IInlineManager, OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;
  ngOnInitDone = false;

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
      label: 'Valós',
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

  override get getInputParams(): GetStocksParamsModel {
    let wareHouseId = this.wh.find(x => x.warehouseDescription === this.filterForm.controls['WarehouseID'].value)?.id;
    return {
      PageNumber: this.dbDataTable.currentPage,
      PageSize: parseInt(this.dbDataTable.pageSize),

      WarehouseID: wareHouseId,
      SearchString: this.filterForm.controls['SearchString'].value,

      OrderBy: "productCode"
    };
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
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<ExtendedStockData>>,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private stockService: StockService,
    private seC: CustomerService,
    cs: CommonService,
    sts: StatusService,
    private router: Router,
    private infrastructureService: InfrastructureService,
    private utS: PrintAndDownloadService,
    private wareHouseApi: WareHouseService,
    private khs: KeyboardHelperService,
    private productService: ProductService,
    private locationService: LocationService,
    loggerService: LoggerService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);
    this.Setup();
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
                  this.dbData[newRowIndex !== -1 ? newRowIndex : data.rowIndex] = newRow;
                  this.dbDataTable.SetDataForForm(newRow, false, false);
                  this.RefreshTable(newRow.data.id);
                  this.simpleToastrService.show(
                    Constants.MSG_SAVE_SUCCESFUL,
                    Constants.TITLE_INFO,
                    Constants.TOASTR_SUCCESS_5_SEC
                  );
                  this.dbDataTable.flatDesignForm.SetFormStateToDefault();
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

  ChooseDataForTableRow(rowIndex: number): void {
    throw new Error('Method not implemented.');
  }
  ChooseDataForCustomerForm(): void {
    throw new Error('Method not implemented.');
  }

  InitFormDefaultValues(): void {
    this.filterForm.controls['WarehouseID'].setValue(undefined);
  }

  private Setup(): void {
    this.refreshComboboxData();

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'stocks-table';
    this.dbDataTableEditId = 'stocks-cell-edit-input';

    this.kbS.ResetToRoot();

    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.filterForm = new FormGroup({
      WarehouseID: new FormControl(undefined, [Validators.required, notWhiteSpaceOrNull]),
      SearchString: new FormControl(undefined, []),
    });

    this.InitFormDefaultValues();

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
      isStock: new FormControl(true, []),
      minStock: new FormControl(undefined, []),
      ordUnit: new FormControl(undefined, []),
      productFee: new FormControl(undefined, []),
      active: new FormControl(false, []),
      vtsz: new FormControl(undefined, []),
      ean: new FormControl(undefined, []),
      vatRateCode: new FormControl(undefined, []),
      noDiscount: new FormControl(false, []),
      warehouse: new FormControl(undefined, []),
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
      next: async () => {
        await this.RefreshAsync(this.getInputParams);
      },
    });
    this.dbDataTable.flatDesignForm.commandsOnForm = this.commands;

    this.filterFormNav!.OuterJump = true;
    this.dbDataTable!.OuterJump = true;

    this.isLoading = false;
  }

  private async refreshComboboxData(): Promise<void> {
    // WareHouse
    this.isLoading = true;
    await lastValueFrom(this.wareHouseApi.GetAll())
      .then(data => {
        this.wh = data?.data ?? [];
        this.wareHouseData$.next(this.wh.map(x => x.warehouseDescription));
      })
      .catch(err => {
        this.cs.HandleError(err);
      });

    // Location
    await lastValueFrom(this.locationService.GetAll())
      .then(data => {
        this.locations = data?.data ?? [];
      })
      .catch(err => {
        this.cs.HandleError(err);
        this.isLoading = false;
      });
  }

  protected async GetProductData(productId: number): Promise<Product> {
    let p = {} as Product;

    await lastValueFrom(this.productService.Get({ ID: productId }))
      .then(res => {
        if (res) {
          p = res;
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
      });

    return p;
  }

  override Refresh(params?: GetStocksParamsModel): void {
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
    this.stockService.GetAll(params).subscribe({
      next: async (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetStocks: response: ', d); // TODO: only for debug
          if (!!d) {
            let tempData = [];
            for(let i = 0; i < d.data.length; i++) {
              const x = d.data[i];
              const _data = new ExtendedStockData(x);
              _data.FillProductFields(await this.GetProductData(_data.productID));
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
    await this.RefreshAsync(this.getInputParams);
  }

  async RefreshAsync(params?: GetStocksParamsModel): Promise<void> {
    await this.refreshComboboxData();

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

    await lastValueFrom(this.stockService.GetAll(params))
      .then(async d => {
        if (d.succeeded && !!d.data) {
          console.log('GetStocks: response: ', d); // TODO: only for debug
          if (!!d) {
            let tempData = [];
            for (let i = 0; i < d.data.length; i++) {
              const x = d.data[i];
              const _data = new ExtendedStockData(x);
              _data.FillProductFields(await this.GetProductData(_data.productID))
              _data.location = HelperFunctions.isEmptyOrSpaces(_data.location) ? undefined : _data.location?.split('-')[1];
              tempData.push({ data: _data, uid: this.nextUid() });
            }
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

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
    this.ngOnInitDone = true;
  }
  ngAfterViewInit(): void {
    if (this.ngOnInitDone) {
      console.log("[ngAfterViewInit]");

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
      const productCode = this.dbData[this.kbS.p.y - 1].data.productCode;
      this.router.navigate(['stock-card/nav'], {
        queryParams: {
          productCode: productCode,
          wareHouse: this.filterForm.controls['WarehouseID'].value
        }
      });
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
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.HandleFunctionKey(event);
        break;
    }

    switch (event.key) {
      case this.KeySetting[Actions.Edit].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Edit].KeyLabel} Pressed: ${this.KeySetting[Actions.Edit].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
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
}