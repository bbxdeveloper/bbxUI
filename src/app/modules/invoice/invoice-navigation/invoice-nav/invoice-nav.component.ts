import { ChangeDetectorRef, Component, HostListener, OnInit, Optional } from '@angular/core';
import { NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FormControl, FormGroup } from '@angular/forms';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { TileCssClass, AttachDirection, TileCssColClass } from 'src/assets/model/navigation/Navigatable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { InvoiceService } from '../../services/invoice.service';
import { WareHouse } from '../../../warehouse/models/WareHouse';
import { WareHouseService } from '../../../warehouse/services/ware-house.service';
import { Invoice } from '../../models/Invoice';
import { GetInvoicesParamListModel } from '../../models/GetInvoicesParamListModel';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { GetFooterCommandListFromKeySettings, InvoiceNavKeySettings, Actions, KeyBindings } from 'src/assets/util/KeyBindings';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { IFunctionHandler } from 'src/assets/model/navigation/IFunctionHandler';
import { BaseManagerComponent } from '../../../shared/base-manager/base-manager.component';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { TokenStorageService } from '../../../auth/services/token-storage.service';
import { InvoiceNavFilter } from '../../models/InvoiceNavFilter';
import { SystemService } from '../../../system/services/system.service';
import { InvoiceType } from '../../../system/models/InvoiceType';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { LoggerService } from 'src/app/services/logger.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { InvoiceLinesDialogComponent } from 'src/app/modules/shared/dialogs/invoice-lines-dialog/invoice-lines-dialog.component';

@Component({
  selector: 'app-invoice-nav',
  templateUrl: './invoice-nav.component.html',
  styleUrls: ['./invoice-nav.component.scss']
})
export class InvoiceNavComponent extends BaseManagerComponent<Invoice> implements IFunctionHandler, IInlineManager, OnInit {
  private filterData: InvoiceNavFilter = {} as InvoiceNavFilter

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  IsTableFocused: boolean = false;
  isDeleteDisabled: boolean = false;

  override KeySetting: Constants.KeySettingsDct = InvoiceNavKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  override allColumns = [
    'invoiceNumber',
    'warehouse',
    'customerName',
    'paymentMethodX',
    'invoiceDeliveryDate',
    'invoiceIssueDate',
    'invoiceNetAmount',
    'invoiceVatAmount',
    'invoiceGrossAmount',
    'currencyCode',
    'invoicePaidAmount',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Bizonylatszám',
      objectKey: 'invoiceNumber',
      colKey: 'invoiceNumber',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '120px',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Raktár',
      objectKey: 'warehouse',
      colKey: 'warehouse',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Partner',
      objectKey: 'customerName',
      colKey: 'customerName',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '50%',
      colMinWidth: '200px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Partner címe',
      objectKey: 'customerCity',
      colKey: 'customerCity',
      defaultValue: '',
      type: 'getter',
      fInputType: 'text',
      mask: '',
      colWidth: '50%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
      calc: (val: any) => {
        let invoice = val as Invoice;
        return invoice.customerPostalCode + ', ' + invoice.customerCity +
          (!!invoice.customerAdditionalAddressDetail && invoice.customerAdditionalAddressDetail.length > 0 ?
            ', ' + invoice.customerAdditionalAddressDetail : '')
      }
    },
    {
      label: 'Fizetési mód',
      objectKey: 'paymentMethodX',
      colKey: 'paymentMethodX',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '85px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Teljesítés',
      objectKey: 'invoiceDeliveryDate',
      colKey: 'invoiceDeliveryDate',
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
      label: 'Kelt.',
      objectKey: 'invoiceIssueDate',
      colKey: 'invoiceIssueDate',
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
      label: 'Fiz.hat.',
      objectKey: 'paymentDate',
      colKey: 'paymentDate',
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
      label: 'Nettó érték',
      objectKey: 'invoiceNetAmount',
      colKey: 'invoiceNetAmount',
      defaultValue: '',
      type: 'formatted-number',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Áfa értéke',
      objectKey: 'invoiceVatAmount',
      colKey: 'invoiceVatAmount',
      defaultValue: '',
      type: 'formatted-number',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Pénznem',
      objectKey: 'currencyCode',
      colKey: 'currencyCode',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '100px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Bruttó érték',
      objectKey: 'invoiceGrossAmount',
      colKey: 'invoiceGrossAmount',
      defaultValue: '',
      type: 'formatted-number',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megjegyzés',
      objectKey: 'notice',
      colKey: 'notice',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '13%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kiegyenlítve',
      objectKey: 'invoicePaidAmount',
      colKey: 'invoicePaidAmount',
      defaultValue: '',
      type: 'formatted-number',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
  ];

  public override getInputParams(override?: Constants.Dct): GetInvoicesParamListModel {
    const params = {
      PageNumber: 1,
      PageSize: parseInt(this.dbDataTable.pageSize),

      InvoiceType: this.invoiceTypes.find(x => x.text === this.filterData.InvoiceType)?.value ?? '',

      WarehouseCode: HelperFunctions
        .ConvertChosenWareHouseToCode(this.filterData.WarehouseCode, this.warehouses, ''),

      // Radio 1
      InvoiceIssueDateFrom: this.filterData.GetInvoiceIssueDateFrom,
      InvoiceIssueDateTo: this.filterData.GetInvoiceIssueDateTo,

      // Radio 2
      InvoiceDeliveryDateFrom: this.filterData.GetInvoiceDeliveryDateFrom,
      InvoiceDeliveryDateTo: this.filterData.GetInvoiceDeliveryDateTo,

      CustomerID: HelperFunctions.ToOptionalInt(this.filterData.CustomerID),

      OrderBy: 'InvoiceNumber'
    }

    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"]
    }

    return params
  }

  // WareHouse
  warehouses: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  invoiceTypes: InvoiceType[] = []
  invoiceTypes$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])

  //#region Getters

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  sumGrossAmount = 0
  sumNetAmount = 0
  sumVatAmount = 0

  //#endregion Getters

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Invoice>>,
    private readonly cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private readonly simpleToastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private readonly sidebarFormService: SideBarFormService,
    private readonly invoiceService: InvoiceService,
    private readonly wareHouseApi: WareHouseService,
    cs: CommonService,
    sts: StatusService,
    private readonly keyboardHelperService: KeyboardHelperService,
    tokenStorage: TokenStorageService,
    private readonly systemService: SystemService,
    private readonly printAndDownloadService: PrintAndDownloadService,
    loggerService: LoggerService  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'invoices-table';
    this.dbDataTableEditId = 'invoices-cell-edit-input';

    this.kbS.ResetToRoot();

    this.Setup();

    this.isLoading = false;
  }

  //#region Misc

  override GetRecordName(data: Invoice): string | number | undefined {
    return data.invoiceNumber
  }

  ToInt(p: any): number {
    return parseInt(p + '');
  }

  //#endregion Misc

  //#region Refresh

  override async Refresh(params?: GetInvoicesParamListModel): Promise<void> {
    this.sts.waitForLoad(true)

    try {
      const response = await this.invoiceService.getAllAsync(params ?? this.getInputParams())

      if (response && response.succeeded && !!response.data) {
        this.sumGrossAmount = response.summaryGross
        this.sumNetAmount = response.summaryNet
        this.sumVatAmount = response.summaryVat

        const tempData = response.data.map((x) => {
          return { data: x, uid: this.nextUid() };
        });
        this.dbData = tempData;
        this.dbDataDataSrc.setData(this.dbData);
        this.dbDataTable.SetPaginatorData(response);

        this.RefreshTable(undefined, true);

        await this.getWarehouses()
      } else {
        this.simpleToastrService.show(
          response.errors!.join('\n'),
          Constants.TITLE_ERROR,
          Constants.TOASTR_ERROR
        );
      }
    }
    catch (error) {
      this.cs.HandleError(error);
    }
    finally {
      this.sts.waitForLoad(false)
      // TODO: DELETE
      this.openDetails()
    }
  }

  private async getWarehouses(): Promise<void> {
    try {
      const response = await this.wareHouseApi.GetAllPromise();
      if (!!response && !!response.data) {
        this.warehouses = response.data;
        this.wareHouseData$.next(this.warehouses.map(x => x.warehouseDescription));
      }
    }
    catch (error) {
      this.cs.HandleError(error);
      this.isLoading = false;
    }
  }

  private async getInvoiceTypes(): Promise<void> {
    try {
      const invoiceTypes = await this.systemService.getInvoiceTypes()
      if (invoiceTypes) {
        this.invoiceTypes = invoiceTypes
        this.invoiceTypes$.next(invoiceTypes.map(x => x.text))
      }
    }
    catch (error) {
      this.cs.HandleError(error)
    }
  }

  public refreshClicked(filterData: InvoiceNavFilter | undefined): void {
    this.filterData = filterData ?? {} as InvoiceNavFilter

    this.UpdateKeySettingsAndCommand()

    this.Refresh(this.getInputParams())
  }

  //#endregion Refresh

  //#region Utility

  public getCsv(): void {
    HelperFunctions.confirm(this.dialogService, 'Export CSV formátumban?', () => {
      try {
        this.sts.pushProcessStatus(Constants.DownloadReportStatuses[Constants.DownloadOfferNavCSVProcessPhases.PROC_CMD])

        const reportParams = {
          report_params: this.getInputParams(),
        } as Constants.Dct

        this.printAndDownloadService.downloadCsvOrXml(reportParams, this.invoiceService.getCsv.bind(this.invoiceService))
      }
      catch (error) {
        this.cs.HandleError(error)
      }
      finally {
        this.sts.pushProcessStatus(Constants.BlankProcessStatus)
      }
    })
  }

  private printSelectedInvoice(): void {
    const selectedRow = this.dbDataTable.prevSelectedRow

    const invoiceNumber = selectedRow?.data.invoiceNumber ?? ''

    this.printAndDownloadService.openPrintDialog({
      DialogTitle: Constants.TITLE_PRINT_INVOICE,
      DefaultCopies: Constants.OutgoingIncomingInvoiceDefaultPrintCopy,
      MsgError: `A(z) ${invoiceNumber} számla nyomtatása közben hiba történt.`,
      MsgCancel: `A(z) ${invoiceNumber} számla nyomtatása nem történt meg.`,
      MsgFinish: `A(z) ${invoiceNumber} számla nyomtatása véget ért.`,
      Obs: this.invoiceService.GetReport.bind(this.invoiceService),
      Reset: () => {},
      ReportParams: {
        id: selectedRow?.data.id,
        copies: 1
      } as Constants.Dct
    } as PrintDialogRequest)
  }

  private openDetails(): void {
    const selectedRow = this.dbDataTable.prevSelectedRow?.data
    this.dialogService.open(InvoiceLinesDialogComponent, {
      context: {
        // TODO: DELETE
        invoice: { id: 15373 } as Invoice // {...selectedRow}
      }
    })
  }

  //#endregion Utility

  //#region Keyboard

  HandleFunctionKey(event: Event | KeyBindings): void {
    const val = event instanceof Event ? (event as KeyboardEvent).code : event;
    console.log(`[HandleFunctionKey]: ${val}`);
    switch (val) {
      // NEW
      case this.KeySetting[Actions.Create].KeyCode:
        break;
      // EDIT
      case this.KeySetting[Actions.Edit].KeyCode:
        break;
      // DELETE
      case this.KeySetting[Actions.Delete].KeyCode:
        break;
    }
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event'])
  public onKeyDown2(event: KeyboardEvent): void {
    if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }

    if (this.keyboardHelperService.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }

    switch (event.key) {
      case this.KeySetting[Actions.Details].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Details].KeyLabel} Pressed: ${this.KeySetting[Actions.Details].FunctionLabel}`);
        this.openDetails()
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
      case this.KeySetting[Actions.Print].KeyCode: {
        event.preventDefault()
        event.stopImmediatePropagation()

        this.printSelectedInvoice()
        break
      }
      case this.KeySetting[Actions.CSV].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        this.getCsv()
        break
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.ToggleForm].KeyLabel} Pressed: ${this.KeySetting[Actions.ToggleForm].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break
      }
    }
  }

  //#endregion Keyboard

  //#region Init

  public async ngOnInit(): Promise<void> {
    const requests = [
      this.getWarehouses(),
      this.getInvoiceTypes()
    ]

    await Promise.all(requests)

    this.fS.pushCommands(this.commands);

    this.dbDataTable.ReadonlySideForm = true;
  }

  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  public filterFormPageReady(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)

    this.SetTableAndFormCommandListFromManager()

    this.dbDataTable.PushFooterCommandList()
    this.dbDataTable.GenerateAndSetNavMatrices(true)
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.dbDataTableForm = new FormGroup({
      invoiceNumber: new FormControl(0, []),
      warehouse: new FormControl(undefined, []),
      customerName: new FormControl(undefined, []),
      customerCity: new FormControl(undefined, []),
      paymentMethodX: new FormControl(undefined, []),
      invoiceDeliveryDate: new FormControl(undefined, []),
      invoiceIssueDate: new FormControl(undefined, []),
      paymentDate: new FormControl(undefined, []),
      invoiceNetAmount: new FormControl(undefined, []),
      invoiceVatAmount: new FormControl(undefined, []),
      invoiceGrossAmount: new FormControl(undefined, []),
      invoicePaidAmount: new FormControl(undefined, []),
      invoicePaidAmountHUF: new FormControl(undefined, []),
      invoiceNetAmountHUF: new FormControl(undefined, []),
      invoiceVatAmountHUF: new FormControl(undefined, []),
      invoiceGrossAmountHUF: new FormControl(undefined, []),
      invoicePaidDates: new FormControl(undefined, []),
      notice: new FormControl(undefined, [])
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'InvoiceNav',
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
        return {} as Invoice;
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

    this.dbDataTable!.OuterJump = true;
  }

  //#endregion Init

  //#region Unimplemented

  RefreshData(): void { }
  TableRowDataChanged(changedData?: any, index?: number, col?: string): void { }
  RecalcNetAndVat(): void { }

  Create(): void { }

  Edit(): void { }

  Delete(): void { }

  ChooseDataForTableRow(rowIndex: number): void { }

  ChooseDataForCustomerForm(): void {
    throw new Error('Method not implemented.');
  }

  //#endregion Unimplemented

}
