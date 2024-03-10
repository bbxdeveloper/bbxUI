import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, EMPTY, Subject, catchError, combineLatest, map, switchMap, takeUntil, tap } from 'rxjs';
import { FilterData } from '../Models/FilterData';
import { NavHttpService } from '../Services/nav-http.service';
import { CommonService } from 'src/app/services/common.service';
import { IQueryExchangeResponse } from '../Models/QueryExchangeResponse';
import { NavLine } from '../Models/NavLine';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FooterService } from 'src/app/services/footer.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { StatusService } from 'src/app/services/status.service';
import { LoggerService } from 'src/app/services/logger.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { Constants } from 'src/assets/util/Constants';
import { Actions, GetFooterCommandListFromKeySettings, KeyBindings, NavSentDataKeySettings } from 'src/assets/util/KeyBindings';
import { NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { FormControl, FormGroup } from '@angular/forms';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IQueryExchangeRequest } from '../Models/QueryExchangeRequest';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';

@Component({
  selector: 'app-nav-sent-data',
  templateUrl: './nav-sent-data.component.html',
  styleUrls: ['./nav-sent-data.component.scss']
})
export class NavSentDataComponent extends BaseManagerComponent<NavLine> implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject()

  public override KeySetting: Constants.KeySettingsDct = NavSentDataKeySettings;
  public override commands : FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting)

  override allColumns = [
    'invoiceNumber',
    'createTime',
    'statusX',
    'operationX',
    'tokenTime',
    'tokenFuncCode',
    'sendTime',
    'sendFuncCode',
    'queryTime',
    'queryFuncCode',
    'transactionID',
    'navxResultsCount',
  ]
  override colDefs: ModelFieldDescriptor[]  = [
    {
      label: 'Bizonylatszám', objectKey: 'invoiceNumber', colKey: 'invoiceNumber',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "140px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Kezdés', objectKey: 'createTime', colKey: 'createTime',
      defaultValue: '', type: 'onlyDate', mask: Constants.ProductCodeMask,
      colWidth: "120px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Státusz', objectKey: 'statusX', colKey: 'statusX',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "120px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Művelet', objectKey: 'operationX', colKey: 'operationX',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "160px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Token küld.', objectKey: 'tokenTime', colKey: 'tokenTime',
      defaultValue: '', type: 'onlyDate', mask: Constants.ProductCodeMask,
      colWidth: "120px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Token func.', objectKey: 'tokenFuncCode', colKey: 'tokenFuncCode',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "80px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Adat küld', objectKey: 'sendTime', colKey: 'sendTime',
      defaultValue: '', type: 'onlyDate', mask: Constants.ProductCodeMask,
      colWidth: "120px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Adat func', objectKey: 'sendFuncCode', colKey: 'sendFuncCode',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "80px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Lekérd.küld', objectKey: 'queryTime', colKey: 'queryTime',
      defaultValue: '', type: 'onlyDate', mask: Constants.ProductCodeMask,
      colWidth: "120px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Lekérd.func', objectKey: 'queryFuncCode', colKey: 'queryFuncCode',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "80px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Tranzakció ID', objectKey: 'transactionID', colKey: 'transactionID',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "30%", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Ért. száma', objectKey: 'navxResultsCount', colKey: 'navxResultsCount',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "30%", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
  ];

  public readonly searchChanged$ = new Subject<FilterData>()
  private readonly newPageSelected$ = new BehaviorSubject<number>(1)

  private readonly searchChangedSubscription = combineLatest([this.searchChanged$, this.newPageSelected$])
    .pipe(
      tap(() => this.isLoading = true),
      map(([filterData, pageNumber]: [FilterData, number]) => ({
        createTimeFrom: filterData.createTimeFrom,
        createTimeTo: filterData.createTimeTo,
        invoiceNumber: filterData.invoiceNumber,
        errorView: filterData.errorView,
        warningView: filterData.warningView,
        PageSize: Number(this.dbDataTable.pageSize),
        PageNumber: pageNumber,
        OrderBy: 'ID'
      } as IQueryExchangeRequest)),
      switchMap((filterData: IQueryExchangeRequest) => this.navService.exchange(filterData)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            this.isLoading = false
            this.commonService.HandleError(error)
            return EMPTY
          })
        )
      ),
      tap(() => this.isLoading = false),
    )
    .subscribe((response: IQueryExchangeResponse) => {
      if (response.data === undefined || response.data === null) {
        return
      }

      this.dbData = response.data.map(x => ({ data: NavLine.create(x), uid: this.nextUid() }))
      this.dbDataDataSrc.setData(this.dbData)
      this.dbDataTable.SetPaginatorData(response)

      this.RefreshTable()
    })

  constructor(
    private readonly navService: NavHttpService,
    private readonly commonService: CommonService,
    dialogService: BbxDialogServiceService,
    keyboardService: KeyboardNavigationService,
    footerService: FooterService,
    sidebarService: BbxSidebarService,
    statusService: StatusService,
    loggerService: LoggerService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<NavLine>>,
    cdref: ChangeDetectorRef,
    sidebarFormService: SideBarFormService,
  ) {
    super(dialogService, keyboardService, footerService, sidebarService, commonService, statusService, loggerService);

    this.isLoading = false

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(),
      invoiceNumber: new FormControl(),
      createTime: new FormControl(),
      status: new FormControl(),
      operation: new FormControl(),
      tokenTime: new FormControl(),
      tokenFuncCode: new FormControl(),
      tokenMessage: new FormControl(),
      sendTime: new FormControl(),
      sendFuncCode: new FormControl(),
      sendMessage: new FormControl(),
      queryTime: new FormControl(),
      queryFuncCode: new FormControl(),
      queryMessage: new FormControl(),
      transactionId: new FormControl(),
      navxResultsCount: new FormControl(),
    })

    this.dbDataDataSrc = dataSourceBuilder.create(this.dbData)
    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'nav-data',
      dataSourceBuilder,
      keyboardService,
      footerService,
      cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.RIGHT,
      sidebarService,
      sidebarFormService,
      this,
      NavLine.create
    )

    this.dbDataTable.NewPageSelected.subscribe(newPageNumber => this.newPageSelected$.next(newPageNumber))

    this.UpdateKeySettingsAndCommand()
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.searchChangedSubscription.unsubscribe()
    this.destroy$.unsubscribe()
  }

}
