import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { lastValueFrom } from 'rxjs';
import { BaseManagerComponent } from 'src/app/modules/shared/base-manager/base-manager.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Actions, GetFooterCommandListFromKeySettings, CustomerInvoiceSummaryKeySettings } from 'src/assets/util/KeyBindings';
import { CustomerInvoiceSummary } from '../../models/CustomerInvoiceSummary/CustomerInvoiceSummary';
import { CustomerInvoiceSummaryFilterFormData } from '../customer-invoice-summary-filter-form/CustomerInvoiceSummaryFilterFormData';
import { GetCustomerInvoiceSummaryParamListModel } from '../../models/CustomerInvoiceSummary/GetCustomerInvoiceSummaryParamListModel';
import { InvoiceService } from '../../services/invoice.service';
import { LoggerService } from 'src/app/services/logger.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

@Component({
  selector: 'app-customer-invoice-summary-manager',
  templateUrl: './customer-invoice-summary-manager.component.html',
  styleUrls: ['./customer-invoice-summary-manager.component.scss']
})
export class CustomerInvoiceSummaryManagerComponent extends BaseManagerComponent<CustomerInvoiceSummary> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  public override KeySetting: Constants.KeySettingsDct = CustomerInvoiceSummaryKeySettings;
  public override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  override allColumns = [
    'customerName',
    'invoiceCount',
    'invoiceDiscountHUFSum',
    'invoiceNetAmountHUFSum',
    'invoiceVatAmountHUFSum',
    'invoiceGrossAmountHUFSum'
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Partner',
      objectKey: 'customerName',
      colKey: 'customerName',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '100%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Biz.száma',
      objectKey: 'invoiceCount',
      colKey: 'invoiceCount',
      defaultValue: '',
      type: 'number',
      fRequired: true,
      mask: '',
      colWidth: '80px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kedvezmény',
      objectKey: 'invoiceDiscountHUFSum',
      colKey: 'invoiceDiscountHUFSum',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Nettó',
      objectKey: 'invoiceNetAmountHUFSum',
      colKey: 'invoiceNetAmountHUFSum',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Áfa',
      objectKey: 'invoiceVatAmountHUFSum',
      colKey: 'invoiceVatAmountHUFSum',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Bruttó',
      objectKey: 'invoiceGrossAmountHUFSum',
      colKey: 'invoiceGrossAmountHUFSum',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    }
  ];

  private filterData: CustomerInvoiceSummaryFilterFormData = {} as CustomerInvoiceSummaryFilterFormData
  public override getInputParams(override?: Constants.Dct): GetCustomerInvoiceSummaryParamListModel {
    const params = {
      Incoming: this.filterData.Incoming,
      CustomerID: this.filterData.CustomerID,
      InvoiceDeliveryDateFrom: this.filterData.InvoiceDeliveryDateFrom,
      InvoiceDeliveryDateTo: this.filterData.InvoiceDeliveryDateTo,
      WarehouseCode: this.filterData.WarehouseCode,
      OrderBy: "customerName",
      PageNumber: 1,
      PageSize: HelperFunctions.ToInt(this.dbDataTable.pageSize)
    } as GetCustomerInvoiceSummaryParamListModel;
    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"]
    }
    return params;
  }

  get blankRow(): () => CustomerInvoiceSummary {
    return () => {
      return new CustomerInvoiceSummary()
    }
  }

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<CustomerInvoiceSummary>>,
    private invoiceService: InvoiceService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    cs: CommonService,
    sts: StatusService,
    private khs: KeyboardHelperService,
    private printAndDownloadService: PrintAndDownloadService,
    loggerService: LoggerService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'product-table';
    this.dbDataTableEditId = 'user-cell-edit-input';

    this.kbS.ResetToRoot();
    this.Setup();
  }

  override GetRecordName(data: CustomerInvoiceSummary): string | number | undefined {
    return data.customerName
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      customerName: new FormControl(undefined, []),
      customerFullAddress: new FormControl(undefined, []),
      invoiceCount: new FormControl(undefined, []),
      invoiceDiscountHUFSum: new FormControl(undefined, []),
      invoiceNetAmountHUFSum: new FormControl(undefined, []),
      invoiceVatAmountHUFSum: new FormControl(undefined, []),
      invoiceGrossAmountHUFSum: new FormControl(undefined, []),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'CustomerInvoiceSummaryManager',
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
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams({ 'PageNumber': newPageNumber }));
      },
    });

    this.bbxSidebarService.collapse();

    this.isLoading = false;
  }

  public refreshClicked(filterData: CustomerInvoiceSummaryFilterFormData | undefined): void {
    this.filterData = filterData ?? {} as CustomerInvoiceSummaryFilterFormData;
    this.RefreshAll(this.getInputParams());
  }

  override Refresh(params?: GetCustomerInvoiceSummaryParamListModel): void {
    console.log('Refreshing');
    this.isLoading = true;
    this.invoiceService.GetAllCustomerInvoiceSummary(params).subscribe({
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
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  async RefreshAsync(params?: GetCustomerInvoiceSummaryParamListModel): Promise<void> {
    console.log('Refreshing');
    this.isLoading = true;

    await lastValueFrom(this.invoiceService.GetAllCustomerInvoiceSummary(params))
      .then(async d => {
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
  ngAfterViewInit(): void {

  }
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

  private RefreshAll(params?: GetCustomerInvoiceSummaryParamListModel): void {
    this.Refresh(params);
  }

  private print(): void {
    const selectedRow = this.dbDataTable.prevSelectedRow?.data

    const params = this.getInputParams()
    const name = selectedRow?.customerName

    this.printAndDownloadService.printAfterConfirm({
      DialogTitle: Constants.TITLE_PRINT_QUESTION,
      DefaultCopies: 1,
      MsgError: `A ${name} partnerhez tartozó bizonylat nyomtatása közben hiba történt.`,
      MsgCancel: `A ${name} partnerhez tartozó bizonylat nyomtatása nem történt meg.`,
      MsgFinish: Constants.TITLE_PRINT_FINISHED,
      Obs: this.invoiceService.GetReportForCustomerInvoiceSummary.bind(this.invoiceService),
      Reset: () => { },
      ReportParams: {
        incoming: params.Incoming === undefined ? false : params.Incoming,
        customerID: HelperFunctions.ToOptionalInt(params.CustomerID),
        warehouseCode: HelperFunctions.isEmptyOrSpaces(params.WarehouseCode) ? undefined : params.WarehouseCode,
        invoiceDeliveryDateFrom: HelperFunctions.isEmptyOrSpaces(params.InvoiceDeliveryDateFrom) ? undefined : params.InvoiceDeliveryDateFrom,
        invoiceDeliveryDateTo: HelperFunctions.isEmptyOrSpaces(params.InvoiceDeliveryDateTo) ? undefined : params.InvoiceDeliveryDateTo
      } as Constants.Dct,
    } as PrintDialogRequest)
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

        if (!this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
          this.simpleToastrService.show(
            "Csak aktívan kijelölt rekord mellett lehet nyomtatni!",
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          )
          return
        }

        console.log(`${this.KeySetting[Actions.Print].KeyLabel} Pressed: ${this.KeySetting[Actions.Print].FunctionLabel}`);
        this.print()
        break;
      }
      case this.KeySetting[Actions.JumpToForm].KeyCode: {
        // TODO: 'active-prod-search' into global variable
        if ((event as any).target.id !== 'active-prod-search') {
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
        this.dbDataTable?.HandleKey(event);
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
      default: { }
    }
  }

}
