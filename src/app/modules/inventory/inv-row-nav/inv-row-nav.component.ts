import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
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
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Customer } from '../../customer/models/Customer';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { IFunctionHandler } from 'src/assets/model/navigation/IFunctionHandler';
import { Actions, KeyBindings, GetFooterCommandListFromKeySettings, InvRowNavKeySettings } from 'src/assets/util/KeyBindings';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { InvRow } from '../models/InvRow';
import { GetAllInvCtrlItemsParamListModel } from '../models/GetAllInvCtrlItemsParamListModel';
import { InvCtrlPeriod } from '../models/InvCtrlPeriod';
import { InventoryService } from '../services/inventory.service';
import { InventoryCtrlItemService } from '../services/inventory-ctrl-item.service';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { ProductSelectTableDialogComponent, SearchMode } from '../../shared/dialogs/product-select-table-dialog/product-select-table-dialog.component';
import { Product } from '../../product/models/Product';
import { CsvExport } from '../models/CsvExport';

@Component({
  selector: 'app-inv-row-nav',
  templateUrl: './inv-row-nav.component.html',
  styleUrls: ['./inv-row-nav.component.scss']
})
export class InvRowNavComponent extends BaseNoFormManagerComponent<InvRow> implements IFunctionHandler, IInlineManager, OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;


  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  readonly SearchButtonId: string = 'invrow-button-search';
  IsTableFocused: boolean = false;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  customerInputFilterString: string = '';

  isDeleteDisabled: boolean = false;

  buyerData!: Customer;
  buyersData: Customer[] = [];

  override allColumns = [
    'productCode',
    'product',
    'oRealQty',
    'nRealQty',
    'oRealAmount',
    'nRealAmount',
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
      label: 'Termkéknév',
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
      label: 'Raktári Klt.',
      objectKey: 'oRealQty',
      colKey: 'oRealQty',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Leltári Klt.',
      objectKey: 'nRealQty',
      colKey: 'nRealQty',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Rkt. ért.',
      objectKey: 'oRealAmount',
      colKey: 'oRealAmount',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Lelt. ért.',
      objectKey: 'nRealAmount',
      colKey: 'nRealAmount',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
  ];

  get CustomerId(): number | undefined {
    if (!!this.buyerData && this.buyerData.id > -1) {
      return this.buyerData.id;
    } else {
      return undefined
    }
  }

  invCtrlPeriods: string[] = [];
  invCtrlPeriodValues: { [key: string]: InvCtrlPeriod } = {};
  invCtrlPeriodComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  get SelectedInvCtrlPeriod(): InvCtrlPeriod | undefined {
    return this.filterForm.controls['invCtrlPeriod'].value !== undefined ?
      this.invCtrlPeriodValues[this.filterForm.controls['invCtrlPeriod'].value ?? -1] : undefined;
  }

  get SelectedInvCtrlPeriodComboValue(): string | undefined {
    return this.filterForm.controls['invCtrlPeriod'].value;
  }

  get showDeficit(): boolean|undefined {
    switch(this.filterForm.controls['showDeficit'].value) {
      case 'true':
        return true
      case 'false':
        return false
      default:
        return undefined
    }
  }

  public override getInputParams(override?: Constants.Dct): GetAllInvCtrlItemsParamListModel {
    const params = {
      PageNumber: 1,
      PageSize: parseInt(this.dbDataTable.pageSize),
      InvCtrlPeriodID: this.SelectedInvCtrlPeriod?.id,
      SearchString: this.filterForm.controls['searchString'].value,
      ShowDeficit: this.showDeficit
    }
    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"]
    }
    return params
  }

  filterFormId = 'invrow-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: FlatDesignNoTableNavigatableForm;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  public KeySetting: Constants.KeySettingsDct = InvRowNavKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  get IsTableActive(): boolean {
    return this.kbS.IsCurrentNavigatable(this.dbDataTable);
  }

  isPageReady: boolean = false;

  public oRealAmountSum = 0
  public nRealAmountSum = 0

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvRow>>,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private inventoryService: InventoryService,
    private inventoryCtrlItemService: InventoryCtrlItemService,
    cs: CommonService,
    sts: StatusService,
    private printAndDownLoadService: PrintAndDownloadService,
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'invrow-table';
    this.dbDataTableEditId = 'invrow-cell-edit-input';

    this.kbS.ResetToRoot();

    this.Setup();
  }

  ToInt(p: any): number {
    return parseInt(p + '');
  }

  InitFormDefaultValues(): void {}

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.filterForm = new FormGroup({
      invCtrlPeriod: new FormControl(undefined, [Validators.required]),
      searchString: new FormControl(undefined, []),
      showDeficit: new FormControl('null', []),
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
      'InvRow',
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
        return {} as InvRow;
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.NewPageSelected.subscribe({
      next: async (newPageNumber: number) => {
        await this.Refresh(this.getInputParams({ 'PageNumber': newPageNumber }));
      },
    });

    this.filterFormNav!.OuterJump = true;
    this.dbDataTable!.OuterJump = true;
  }

  public async RefreshAndJumpToTable(): Promise<void> {
    await this.Refresh(this.getInputParams(), true);
  }

  JumpToFirstCellAndNav(): void {
    console.log("[JumpToFirstCellAndNav]");
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.kbS.SetCurrentNavigatable(this.dbDataTable);
    this.kbS.SelectElementByCoordinate(0, 0);
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    setTimeout(() => {
      this.kbS.MoveDown();
    }, 300);
  }

  private async refreshComboboxData(setIsLoad = false): Promise<void> {
    if (setIsLoad) {
      this.isLoading = true;
    }
    await lastValueFrom(this.inventoryService.GetAll({ PageSize: 10000, OrderBy: 'warehouse' }))
      .then(data => {
        console.log("[refreshComboboxData]: ", data);
        this.invCtrlPeriods = data?.data
          ?.map(x => {
            let res = x.warehouse + ' ' + HelperFunctions.GetOnlyDateFromUtcDateString(x.dateFrom) + ' ' + HelperFunctions.GetOnlyDateFromUtcDateString(x.dateTo);
            this.invCtrlPeriodValues[res] = x;
            return res;
          }) ?? [];
        this.invCtrlPeriodComboData$.next(this.invCtrlPeriods);
        if (this.invCtrlPeriods.length > 0) {
          const currentVal = this.filterForm.controls['invCtrlPeriod'].value
          const matching = currentVal === undefined || currentVal === null ? undefined : this.invCtrlPeriods.find(x => x === currentVal)
          if (matching === undefined) {
            this.filterForm.controls['invCtrlPeriod'].setValue(this.invCtrlPeriods[0]);
          }
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => {
        if (setIsLoad) {
          this.isLoading = false;
        }
      });
  }

  override async Refresh(params?: GetAllInvCtrlItemsParamListModel, jumpToFirstTableCell: boolean = false): Promise<void> {
    console.log('Refreshing: ', params); // TODO: only for debug
    this.refreshComboboxData();
    this.isLoading = true;
    await lastValueFrom(this.inventoryCtrlItemService.GetAll(params))
      .then(d => {
        if (!d.succeeded || !d.data) {
          this.bbxToastrService.showError(d.errors!.join('\n'));
          return
        }

        console.log('GetProducts response: ', d); // TODO: only for debug
        if (!!d) {
          this.oRealAmountSum = 0
          this.nRealAmountSum = 0

          this.dbData = d.data.map((x) => {
            this.oRealAmountSum += x.oRealAmount
            this.nRealAmountSum += x.nRealAmount

            return { data: InvRow.fromInvCtrlItemForGet(x), uid: this.nextUid() };
          });
          this.dbDataDataSrc.setData(this.dbData);
          this.dbDataTable.SetPaginatorData(d);
        }

        this.RefreshTable(undefined, this.isPageReady);

        if (!!d.data && d.data.length > 0) {
          this.JumpToFirstCellAndNav();
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
        this.isLoading = false;
      })
      .finally(() => {
        this.isLoading = false;
        if (!this.isPageReady) {
          this.isPageReady = true;
        }
      });
  }

  async ngOnInit(): Promise<void> {
    this.fS.pushCommands(this.commands);
    await this.refreshComboboxData(true);
  }
  ngAfterViewInit(): void {
    console.log("[ngAfterViewInit]");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    document.querySelectorAll('*[type="radio"]')
      .forEach(element => element.classList.add(TileCssClass))

    this.filterFormNav.GenerateAndSetNavMatrices(true, true, NavMatrixOrientation.ONLY_HORIZONTAL);
    this.AddSearchButtonToFormMatrix();
    console.log(this.filterFormNav.Matrix);

    this.dbDataTable.GenerateAndSetNavMatrices(true, undefined, false);
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

  ChooseDataForCustomerForm(): void {}

  RefreshData(): void { }
  TableRowDataChanged(changedData?: any, index?: number, col?: string): void { }
  RecalcNetAndVat(): void { }

  private async csvExport(): Promise<void> {
    if (!this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      return
    }

    this.sts.pushProcessStatus(Constants.DownloadReportStatuses[Constants.DownloadOfferNavCSVProcessPhases.PROC_CMD])

    this.printAndDownLoadService.download_csv({
      report_params: {
        InvCtrlPeriodID: Number(this.SelectedInvCtrlPeriod?.id),
        SearchString: this.filterForm.controls['searchString'].value ?? '',
        ShowDeficit: this.showDeficit,
      } as CsvExport
    } as Constants.Dct, this.inventoryCtrlItemService.csvExport.bind(this.inventoryCtrlItemService))
  }

  HandleFunctionKey(event: Event | KeyBindings): void {
    const val = event instanceof Event ? (event as KeyboardEvent).code : event;
    console.log(`[HandleFunctionKey]: ${val}`);
    switch (val) {
      // PRINT
      case this.KeySetting[Actions.Print].KeyCode:
        this.Print();
        break;
      // SEARCH
      case this.KeySetting[Actions.Search].KeyCode:
        this.ChooseDataForTableRow();
        break;
    }
  }

  Print(): void {
    if (this.SelectedInvCtrlPeriod?.id !== undefined) {
      const id = this.SelectedInvCtrlPeriod.id;
      const title = this.SelectedInvCtrlPeriodComboValue;

      this.kbS.setEditMode(KeyboardModes.NAVIGATION);

      this.isLoading = false;
      this.printAndDownLoadService.printAfterConfirm({
        DialogTitle: Constants.MSG_CONFIRMATION_PRINT,
        MsgError: `Az leltári időszak nyomtatása közben hiba történt.`,
        MsgCancel: `Az leltári időszak nyomtatása nem történt meg.`,
        MsgFinish: `Az leltári időszak nyomtatása véget ért.`,
        Obs: this.inventoryService.GetReport.bind(this.inventoryService),
        ReportParams: {
          "invCtrlPeriodID": id, "invPeriodTitle": title
        } as Constants.Dct
      } as PrintDialogRequest);
    }
  }

  ChooseDataForTableRow(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: this.filterForm.controls['searchString'].value ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
        defaultSearchModeForEnteredFilter: SearchMode.SEARCH_NAME_CODE
      }
    });
    dialogRef.onClose.subscribe(async (res: Product) => {
      console.log("ChooseDataForTableRow Selected item: ", res);
      if (!!res) {
        this.filterForm.controls['searchString'].setValue(res.productCode);
      }
      this.kbS.setEditMode(KeyboardModes.EDIT);
    });
  }

  @HostListener('window:keydown', ['$event']) override onKeyDown(event: KeyboardEvent) {
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
      case this.KeySetting[Actions.Search].KeyCode:
      case this.KeySetting[Actions.Email].KeyCode:
      case this.KeySetting[Actions.Details].KeyCode:
      case this.KeySetting[Actions.Create].KeyCode:
      case this.KeySetting[Actions.Edit].KeyCode:
      case this.KeySetting[Actions.Reset].KeyCode:
      case this.KeySetting[Actions.Save].KeyCode:
      case this.KeySetting[Actions.Delete].KeyCode:
      case this.KeySetting[Actions.Print].KeyCode:
      case this.KeySetting[Actions.ToggleForm].KeyCode:
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.HandleFunctionKey(event);
        break;
      case this.KeySetting[Actions.CSV].KeyCode:
        HelperFunctions.StopEvent(event)

        this.csvExport()
        break;
    }
  }
}