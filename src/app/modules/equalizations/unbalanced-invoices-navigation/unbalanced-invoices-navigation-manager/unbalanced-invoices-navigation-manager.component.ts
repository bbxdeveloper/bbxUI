import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { BehaviorSubject, Observable, ReplaySubject, lastValueFrom } from 'rxjs';
import { BaseManagerComponent } from 'src/app/modules/shared/base-manager/base-manager.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Actions, GetFooterCommandListFromKeySettings, UnbalancedInvoicesNavigationManagerComponentKeySettings } from 'src/assets/util/KeyBindings';
import { LoggerService } from 'src/app/services/logger.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { GetUnbalancedInvoicesParamListModel } from '../../models/GetUnbalancedInvoicesParamListModel';
import { UnbalancedInvoicesFilterFormData } from '../unbalanced-invoices-navigation-filter-form/UnbalancedInvoicesFilterFormData';
import { InvoiceService } from 'src/app/modules/invoice/services/invoice.service';
import { Invoice } from 'src/app/modules/invoice/models/Invoice';
import { InvoiceNumberData } from '../unbalanced-invoices-navigation-filter-form/InvoiceNumberData';

@Component({
  selector: 'app-unbalanced-invoices-navigation-manager',
  templateUrl: './unbalanced-invoices-navigation-manager.component.html',
  styleUrls: ['./unbalanced-invoices-navigation-manager.component.scss']
})
export class UnbalancedInvoicesNavigationManagerComponent extends BaseManagerComponent<Invoice> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  public invoiceNumberData$: BehaviorSubject<InvoiceNumberData | undefined> = new BehaviorSubject<InvoiceNumberData | undefined>(undefined)

  public override KeySetting: Constants.KeySettingsDct = UnbalancedInvoicesNavigationManagerComponentKeySettings;
  public override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  get sumGrossAmount(): any {
    return this.dbData
      .map(x => x.data)
      .map(x => x.invoiceNetAmount ?? 0)
      .reduce((sum, current) => sum + current, 0)
      +
      this.dbData
        .map(x => x.data)
        .map(x => x.invoiceVatAmount ?? 0)
        .reduce((sum, current) => sum + current, 0);
  }

  get sumNetAmount(): any {
    return this.dbData
      .map(x => x.data)
      .map(x => x.invoiceNetAmount ?? 0)
      .reduce((sum, current) => sum + current, 0);
  }

  get sumInvoicePaidAmount(): any {
    return this.dbData
      .map(x => x.data)
      .map(x => x.invoicePaidAmount ?? 0)
      .reduce((sum, current) => sum + current, 0);
  }

  override allColumns = [
    'invoiceNumber',
    'customerName',
    'invoiceIssueDate',
    'invoiceDeliveryDate',
    'paymentDate',
    'currencyCodeX',
    'invoiceNetAmount',
    'invoiceGrossAmount',
    'invoicePaidAmount'
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Bizonylatszám',
      objectKey: 'invoiceNumber',
      colKey: 'invoiceNumber',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '20%',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Ügyfél',
      objectKey: 'customerName',
      colKey: 'customerName',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '80%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Ügyfél Bizonylatszám',
      objectKey: 'customerInvoiceNumber',
      colKey: 'customerInvoiceNumber',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '180px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Dátum',
      objectKey: 'invoiceIssueDate',
      colKey: 'invoiceIssueDate',
      defaultValue: '',
      type: 'onlyDate',
      fRequired: true,
      mask: '',
      colWidth: '110px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Teljesítés',
      objectKey: 'invoiceDeliveryDate',
      colKey: 'invoiceDeliveryDate',
      defaultValue: '',
      type: 'onlyDate',
      fRequired: true,
      mask: '',
      colWidth: '110px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Fizhat',
      objectKey: 'paymentDate',
      colKey: 'paymentDate',
      defaultValue: '',
      type: 'onlyDate',
      fRequired: true,
      mask: '',
      colWidth: '110px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Pénznem',
      objectKey: 'currencyCodeX',
      colKey: 'currencyCodeX',
      defaultValue: '',
      type: 'string',
      fRequired: true,
      mask: '',
      colWidth: '90px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Nettó',
      objectKey: 'invoiceNetAmount',
      colKey: 'invoiceNetAmount',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Bruttó',
      objectKey: 'invoiceGrossAmount',
      colKey: 'invoiceGrossAmount',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kiegyenlítve',
      objectKey: 'invoicePaidAmount',
      colKey: 'invoicePaidAmount',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    }
  ];

  private filterData: UnbalancedInvoicesFilterFormData = {} as UnbalancedInvoicesFilterFormData
  public override getInputParams(override?: Constants.Dct): GetUnbalancedInvoicesParamListModel {
    var params = { ...this.filterData } as GetUnbalancedInvoicesParamListModel

    params.CustomerID = HelperFunctions.ToOptionalInt(params.CustomerID)
    params.ID = HelperFunctions.ToOptionalInt(params.ID)
    
    params.InvoiceDeliveryDateFrom = HelperFunctions.isEmptyOrSpaces(params.InvoiceDeliveryDateFrom) ? undefined : params.InvoiceDeliveryDateFrom
    params.InvoiceDeliveryDateTo = HelperFunctions.isEmptyOrSpaces(params.InvoiceDeliveryDateTo) ? undefined : params.InvoiceDeliveryDateTo
    params.InvoiceIssueDateFrom = HelperFunctions.isEmptyOrSpaces(params.InvoiceIssueDateFrom) ? undefined : params.InvoiceIssueDateFrom
    params.InvoiceIssueDateTo = HelperFunctions.isEmptyOrSpaces(params.InvoiceIssueDateTo) ? undefined : params.InvoiceIssueDateTo
    params.PaymentDateFrom = HelperFunctions.isEmptyOrSpaces(params.PaymentDateFrom) ? undefined : params.PaymentDateFrom
    params.PaymentDateTo = HelperFunctions.isEmptyOrSpaces(params.PaymentDateTo) ? undefined : params.PaymentDateTo
    
    params.PageNumber = HelperFunctions.ToInt(this.dbDataTable.currentPage + '')
    params.PageSize = HelperFunctions.ToInt(this.dbDataTable.pageSize + '')

    params.InvoiceNumber = params.InvoiceNumber
    params.CustomerInvoiceNumber = params.CustomerInvoiceNumber

    return params;
  }

  get blankRow(): () => Invoice {
    return () => {
      return {} as Invoice
    }
  }

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Invoice>>,
    private invoiceService: InvoiceService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    cs: CommonService,
    sts: StatusService,
    private khs: KeyboardHelperService,
    loggerService: LoggerService  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);
    this.searchInputId = Constants.SearchInputId;
    this.dbDataTableId = 'product-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  private pushInvoiceNumberData(): void {
    const selectedData = this.dbDataTable.lastKnownSelectedRow?.data
    this.invoiceNumberData$.next({
      InvoiceNumber: selectedData?.invoiceNumber,
      CustomerInvoiceNumber: selectedData?.customerInvoiceNumber,
    } as InvoiceNumberData)
  }

  override GetRecordName(data: Invoice): string | number | undefined {
    return data.invoiceNumber
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'UnbalancedInvoicesNavigationManager',
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
      this.blankRow,
      false
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: () => {
        this.Refresh(this.getInputParams());
      },
    });

    this.bbxSidebarService.collapse();

    this.isLoading = false;
  }

  public refreshClicked(filterData: UnbalancedInvoicesFilterFormData | undefined): void {
    this.filterData = filterData ?? {} as UnbalancedInvoicesFilterFormData

    this.UpdateKeySettingsAndCommand()

    this.RefreshAll(this.getInputParams())
  }

  public HideColumn(col: string): void {
    const index = this.allColumns.findIndex(x => x == col);
    if (index >= 0) {
      this.allColumns.splice(index, 1);
    }
  }

  public ShowColumn(col: string, position?: number): void {
    if (this.allColumns.includes(col)) {
      return;
    }
    if (position !== undefined) {
      this.allColumns.splice(position!, 0, col);
    } else {
      this.allColumns.push(col);
    }
  }

  override Refresh(params?: GetUnbalancedInvoicesParamListModel): void {
    console.log('Refreshing');
    this.isLoading = true;
    this.invoiceService.GetAllUnbalanced(params).subscribe({
      next: async (d) => {
        if (d.succeeded && !!d.data) {
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
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          );
        }
      },
      error: (err) => {
        this.cs.HandleError(err)
        this.isLoading = false
      },
      complete: () => {
        this.isLoading = false

        if (this.filterData?.Incoming) {
          this.ShowColumn('customerInvoiceNumber', 2)
        } else {
          this.HideColumn('customerInvoiceNumber')
        }
      },
    });
  }

  async RefreshAsync(params?: GetUnbalancedInvoicesParamListModel): Promise<void> {
    console.log('Refreshing');
    this.isLoading = true;

    await lastValueFrom(this.invoiceService.GetAllUnbalanced(params))
      .then(async d => {
        if (d.succeeded && !!d.data) {
          console.log('GetProducts response: ', d);
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
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          );
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => {
        this.isLoading = false;
      })
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {}
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  public filterFormPageReady(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)

    this.SetTableAndFormCommandListFromManager()

    this.dbDataTable.GenerateAndSetNavMatrices(true)
    this.dbDataTable.PushFooterCommandList()
  }

  private RefreshAll(params?: GetUnbalancedInvoicesParamListModel): void {
    this.Refresh(params);
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onKeyDown2(event: KeyboardEvent) {
    if (this.khs.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      case this.KeySetting[Actions.Print].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        console.log(`${this.KeySetting[Actions.Print].KeyLabel} Pressed: ${this.KeySetting[Actions.Print].FunctionLabel}`);
        break;
      }
      case this.KeySetting[Actions.JumpToForm].KeyCode: {
        if ((event as any).target.id !== Constants.SearchInputId) {
          return;
        }

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.JumpToForm].KeyLabel} Pressed: ${this.KeySetting[Actions.JumpToForm].FunctionLabel}`);
        this.dbDataTable?.HandleSearchFieldTab();
        break;
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.ToggleForm].KeyLabel} Pressed: ${this.KeySetting[Actions.ToggleForm].FunctionLabel}`);
        break;
      }
      case this.KeySetting[Actions.Lock].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        console.log(`${this.KeySetting[Actions.Lock].KeyLabel} Pressed: ${this.KeySetting[Actions.Lock].FunctionLabel}`);
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.RefreshAll(this.getInputParams());
        break;
      }
      case this.KeySetting[Actions.Reset].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        console.log(`${this.KeySetting[Actions.Reset].KeyLabel} Pressed: ${this.KeySetting[Actions.Reset].FunctionLabel}`);
        break;
      }
      case this.KeySetting[Actions.Edit].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        console.log(`${this.KeySetting[Actions.Edit].KeyLabel} Pressed: ${this.KeySetting[Actions.Edit].FunctionLabel}`);
        break;
      }
      case this.KeySetting[Actions.Delete].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Delete].KeyLabel} Pressed: ${this.KeySetting[Actions.Delete].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      default: { }
    }

    this.pushInvoiceNumberData()
  }

  @HostListener('window:click', ['$event']) onClick(event: any) {
    this.pushInvoiceNumberData()
  }
}
