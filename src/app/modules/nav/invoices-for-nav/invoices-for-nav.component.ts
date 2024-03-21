import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, EMPTY, Subject, catchError, combineLatest, switchMap, takeUntil, tap } from 'rxjs';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FooterService } from 'src/app/services/footer.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { CommonService } from 'src/app/services/common.service';
import { StatusService } from 'src/app/services/status.service';
import { LoggerService } from 'src/app/services/logger.service';
import { NavInvoice } from '../Models/NavInvoice';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { FormGroup } from '@angular/forms';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { Constants } from 'src/assets/util/Constants';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { GetFooterCommandListFromKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';

const emptyKeySetting: Constants.KeySettingsDct = {
    // Unset
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Értesítések', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'XML export', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Készlet', KeyType: Constants.KeyTypes.Unset },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
}

@Component({
  selector: 'app-invoices-for-nav',
  templateUrl: './invoices-for-nav.component.html',
  styleUrls: ['./invoices-for-nav.component.scss']
})
export class InvoicesForNavComponent extends BaseManagerComponent<NavInvoice> implements OnInit, OnDestroy, AfterViewInit {
  public readonly TileCssClass = TileCssClass

  public override KeySetting: Constants.KeySettingsDct = emptyKeySetting
  override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting)

  override allColumns = [
    'invoiceNumber',
    'invoiceIssueDate',
    'invoiceDeliveryDate',
    'customerName',
    'customerTaxpayerNumber',
    'customerThirdStateTaxId',
    'currencyCodeX',
    'invoiceNetAmount',
    'invoiceVatAmount',
    'invoiceGrossAmount',
  ]
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Bizonylatszám', objectKey: 'invoiceNumber', colKey: 'invoiceNumber',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "140px", textAlign: "left", fInputType: 'code-field',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kelt.', objectKey: 'invoiceIssueDate', colKey: 'invoiceIssueDate',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "140px", textAlign: "left", fInputType: 'code-field',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Telj.', objectKey: 'invoiceDeliveryDate', colKey: 'invoiceDeliveryDate',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "140px", textAlign: "left", fInputType: 'code-field',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Partner', objectKey: 'customerName', colKey: 'customerName',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "40%", textAlign: "left", fInputType: 'code-field',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Adószám', objectKey: 'customerTaxpayerNumber', colKey: 'customerTaxpayerNumber',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "200px", textAlign: "left", fInputType: 'code-field',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'EU adószám', objectKey: 'customerThirdStateTaxId', colKey: 'customerThirdStateTaxId',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "140px", textAlign: "left", fInputType: 'code-field',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Pénznem', objectKey: 'currencyCodeX', colKey: 'currencyCodeX',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "140px", textAlign: "left", fInputType: 'code-field',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Nettó', objectKey: 'invoiceNetAmount', colKey: 'invoiceNetAmount',
      defaultValue: '', type: 'formatted-number', mask: Constants.ProductCodeMask,
      colWidth: "140px", textAlign: "right", fInputType: 'code-field',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Áfa', objectKey: 'invoiceVatAmount', colKey: 'invoiceVatAmount',
      defaultValue: '', type: 'formatted-number', mask: Constants.ProductCodeMask,
      colWidth: "140px", textAlign: "right", fInputType: 'code-field',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Bruttó', objectKey: 'invoiceGrossAmount', colKey: 'invoiceGrossAmount',
      defaultValue: '', type: 'formatted-number', mask: Constants.ProductCodeMask,
      colWidth: "140px", textAlign: "right", fInputType: 'code-field',
      navMatrixCssClass: TileCssClass,
    },
  ]

  private readonly destroy$ = new Subject()

  public readonly searchFormId = 'search-form-id'

  public readonly searchForm = new FormGroup({})

  public readonly searchFormNav = new InlineTableNavigatableForm(
    this.searchForm,
    this.kbS,
    this.cdref,
    [],
    this.searchFormId,
    AttachDirection.DOWN,
    {} as IInlineManager
  )

  public readonly searchClicked$ = new Subject()
  private readonly newPageSelected$ = new BehaviorSubject<number>(1)

  private readonly search$ = combineLatest([this.searchClicked$, this.newPageSelected$])
    .pipe(
      tap(() => this.isLoading = true),
      switchMap(() => this.invoiceService.queryUnsent()
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            this.cs.HandleError(error)
            this.isLoading = false
            return EMPTY
          })
        )
      ),
      tap(() => this.isLoading = false)
    )
    .subscribe(response => {
      if (response.data === undefined || response.data === null) {
        return
      }

      this.dbData = response.data.map(x => ({ data: NavInvoice.create(x), uid: this.nextUid() }))
      this.dbDataDataSrc.setData(this.dbData)
      this.dbDataTable.SetPaginatorData(response)

      this.kbS.SetCurrentNavigatable(this.dbDataTable)

      this.RefreshTable()
    })

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly cdref: ChangeDetectorRef,
    dialogService: BbxDialogServiceService,
    keyboardService: KeyboardNavigationService,
    footerService: FooterService,
    sidebarService: BbxSidebarService,
    sidebarFormService: SideBarFormService,
    commonService: CommonService,
    statusService: StatusService,
    loggerService: LoggerService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<NavInvoice>>,
  )
  {
    super(dialogService, keyboardService, footerService, sidebarService, commonService, statusService, loggerService)

    this.isLoading = false

    this.searchFormNav.OuterJump = true

    this.dbDataTableId = 'invoices-for-nav-id'
    this.dbDataDataSrc = dataSourceBuilder.create(this.dbData)
    this.dbDataTable = new FlatDesignNavigatableTable(
      new FormGroup({}),
      '',
      dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      '',
      AttachDirection.RIGHT,
      sidebarService,
      sidebarFormService,
      this,
      NavInvoice.create,
      false
    )
    this.dbDataTable.OuterJump = true
    this.dbDataTable.KeySetting = emptyKeySetting
    this.dbDataTable.NewPageSelected.subscribe(newPageNumber => this.newPageSelected$.next(newPageNumber))
  }

  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)

    this.searchFormNav.GenerateAndSetNavMatrices(true)
    this.dbDataTable.GenerateAndSetNavMatrices(true)

    this.cdref.detectChanges()

    this.kbS.SetCurrentNavigatable(this.searchFormNav)
    this.kbS.SelectFirstTile()
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next(true)
    this.search$.unsubscribe()

    this.kbS.Detach()
  }

}
