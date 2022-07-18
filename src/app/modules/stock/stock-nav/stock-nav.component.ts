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
import { UtilityService } from 'src/app/services/utility.service';
import { GetStocksParamsModel } from '../models/GetStocksParamsModel';
import { Stock } from '../models/Stock';
import { StockService } from '../services/stock.service';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { WareHouseService } from '../../warehouse/services/ware-house.service';

@Component({
  selector: 'app-stock-nav',
  templateUrl: './stock-nav.component.html',
  styleUrls: ['./stock-nav.component.scss']
})
export class StockNavComponent extends BaseNoFormManagerComponent<Stock> implements IFunctionHandler, IInlineManager, OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  readonly SearchButtonId: string = 'stocks-button-search';
  IsTableFocused: boolean = false;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  isDeleteDisabled: boolean = false;

  // WareHouse
  wh: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  override allColumns = [
    'productCode',
    'product',
    'calcQty',
    'realQty',
    'outQty',
    'avgCost',
    'latestIn',
    'latestOut',
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
      colWidth: '80%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Karton',
      objectKey: 'calcQty',
      colKey: 'calcQty',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: "125px",
      textAlign: "right",
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
      label: 'Árukiad.',
      objectKey: 'outQty',
      colKey: 'outQty',
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
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  public KeySetting: Constants.KeySettingsDct = StockNavKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  get IsTableActive(): boolean {
    return this.kbS.IsCurrentNavigatable(this.dbDataTable);
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Stock>>,
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
    private utS: UtilityService,
    private wareHouseApi: WareHouseService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);

    this.refreshComboboxData();

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'stocks-table';
    this.dbDataTableEditId = 'stocks-cell-edit-input';

    this.kbS.ResetToRoot();

    this.Setup();
  }

  ChooseDataForTableRow(rowIndex: number): void {
    throw new Error('Method not implemented.');
  }
  ChooseDataForForm(): void {
    throw new Error('Method not implemented.');
  }

  InitFormDefaultValues(): void {
    this.filterForm.controls['WarehouseID'].setValue(undefined);
  }

  ToInt(p: any): number {
    return parseInt(p + '');
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.filterForm = new FormGroup({
      WarehouseID: new FormControl(undefined, [Validators.required]),
      SearchString: new FormControl(undefined, []),
    });

    this.InitFormDefaultValues();

    this.filterFormNav = new FlatDesignNoTableNavigatableForm(
      this.filterForm,
      this.kbS,
      this.cdref, [], this.filterFormId,
      AttachDirection.DOWN,
      this.colDefs,
      this.sidebarService,
      this.fS,
      this.dbDataTable,
      this
    );

    this.dbDataTable = new FlatDesignNoFormNavigatableTable(
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
      AttachDirection.UP,
      this.sidebarService,
      this.sidebarFormService,
      this,
      () => {
        return {} as Stock;
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.NewPageSelected.subscribe({
      next: () => {
        this.Refresh(this.getInputParams);
      },
    });

    this.filterFormNav!.OuterJump = true;
    this.dbDataTable!.OuterJump = true;

    // this.RefreshAll(this.getInputParams);
    this.isLoading = false;
  }

  private refreshComboboxData(): void {
    // WareHouse
    this.wareHouseApi.GetAll().subscribe({
      next: data => {
        this.wh = data?.data ?? [];
        this.wareHouseData$.next(this.wh.map(x => x.warehouseDescription));
      }
    });
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
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetStocks: response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.currentPage = d.pageNumber;
            this.dbDataTable.allPages = this.GetPageCount(d.recordsFiltered, d.pageSize);
            this.dbDataTable.totalItems = d.recordsFiltered;
            this.dbDataTable.itemsOnCurrentPage = tempData.length;
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
      },
    });
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    console.log("[ngAfterViewInit]");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.filterFormNav.GenerateAndSetNavMatrices(true, true, NavMatrixOrientation.ONLY_HORIZONTAL);
    this.AddSearchButtonToFormMatrix();
    console.log(this.filterFormNav.Matrix);

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.DisableFooter = true;

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

  private RefreshAll(params?: GetStocksParamsModel): void {
    this.Refresh(params);
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

  IsNumber(val: string): boolean {
    let val2 = val.replace(' ', '');
    return !isNaN(parseFloat(val2));
  }

  RefreshData(): void { }
  TableRowDataChanged(changedData?: any, index?: number, col?: string): void { }
  RecalcNetAndVat(): void { }

  HandleFunctionKey(event: Event | KeyBindings): void {
    const val = event instanceof Event ? (event as KeyboardEvent).code : event;
    console.log(`[HandleFunctionKey]: ${val}`);
    switch (val) {
      // NEW
      case this.KeySetting[Actions.CrudNew].KeyCode:
        this.Create();
        break;
      // EDIT
      case this.KeySetting[Actions.CrudEdit].KeyCode:
        this.Edit();
        break;
      // DELETE
      case this.KeySetting[Actions.CrudDelete].KeyCode:
      case this.KeySetting[Actions.CrudDelete].AlternativeKeyCode:
        if (!this.isDeleteDisabled) {
          this.Delete();
        }
        break;
    }
  }

  Create(): void {}

  Edit(): void {}

  Delete(): void {}

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.filterFormNav?.HandleFormShiftEnter(event)
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      case this.KeySetting[Actions.CSV].KeyCode:
      case this.KeySetting[Actions.Email].KeyCode:
      case this.KeySetting[Actions.Details].KeyCode:
      case this.KeySetting[Actions.CrudNew].KeyCode:
      case this.KeySetting[Actions.CrudEdit].KeyCode:
      case this.KeySetting[Actions.CrudReset].KeyCode:
      case this.KeySetting[Actions.CrudSave].KeyCode:
      case this.KeySetting[Actions.CrudDelete].KeyCode:
      case this.KeySetting[Actions.CrudDelete].AlternativeKeyCode:
      case this.KeySetting[Actions.Print].KeyCode:
      case this.KeySetting[Actions.ToggleForm].KeyCode:
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.HandleFunctionKey(event);
        break;
    }
  }
}