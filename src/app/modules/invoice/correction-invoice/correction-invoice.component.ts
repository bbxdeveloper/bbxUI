import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { CorrectionInvoiceSelectionDialogComponent } from '../correction-invoice-selection-dialog/correction-invoice-selection-dialog.component';
import { Invoice } from '../models/Invoice';
import { Customer } from '../../customer/models/Customer';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { InvoiceLine } from '../models/InvoiceLine';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FooterService } from 'src/app/services/footer.service';
import { CommonService } from 'src/app/services/common.service';
import { StatusService } from 'src/app/services/status.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { Constants } from 'src/assets/util/Constants';
import { Actions, CorrectionInvoiceKeySettings, GetFooterCommandListFromKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';
import { CreateOutgoingInvoiceRequest, OutGoingInvoiceFullData, OutGoingInvoiceFullDataToRequest } from '../models/CreateOutgoingInvoiceRequest';
import { GetUpdatedKeySettings } from 'src/assets/util/KeyBindings';
import { isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { TableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { InvoiceBehaviorMode } from '../models/InvoiceBehaviorMode';
import { InvoiceFormData } from '../invoice-form/InvoiceFormData';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';
import { SaveDialogComponent } from '../save-dialog/save-dialog.component';
import { InvoiceService } from '../services/invoice.service';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { InvoiceBehaviorFactoryService } from '../services/invoice-behavior-factory.service';
import { PartnerLockService } from 'src/app/services/partner-lock.service';
import { PartnerLockHandlerService } from 'src/app/services/partner-lock-handler.service';
import { ChooseSummaryInvoiceProductRequest, ProductCodeManagerServiceService } from 'src/app/services/product-code-manager-service.service';
import { ProductStockInformationDialogComponent } from '../../shared/dialogs/product-stock-information-dialog/product-stock-information-dialog.component';
import { ProductService } from '../../product/services/product.service';

@Component({
  selector: 'app-correction-invoice',
  templateUrl: './correction-invoice.component.html',
  styleUrls: ['./correction-invoice.component.scss'],
  providers: [PartnerLockHandlerService, PartnerLockService, InvoiceBehaviorFactoryService]
})
export class CorrectionInvoiceComponent extends BaseInlineManagerComponent<InvoiceLine> implements OnInit, OnDestroy, AfterViewInit, IInlineManager {
  public senderData: Customer

  public buyerData: Customer

  private KeySettings: Constants.KeySettingsDct = CorrectionInvoiceKeySettings

  outGoingInvoiceData!: OutGoingInvoiceFullData

  @ViewChild('invoiceForm')
  public invoiceForm!: InvoiceFormComponent

  public invoiceFormData!: InvoiceFormData

  public readonly isIncomingCorrectionInvoice: boolean

  override colsToIgnore: string[] = ["lineDescription", "unitOfMeasureX", 'unitPrice', 'rowNetPrice', 'rowGrossPriceRounded']
  private requiredCols: string[] = ['productCode', 'quantity']
  override allColumns = [
    'productCode',
    'lineDescription',
    'quantity',
    'unitOfMeasureX',
    'unitPrice',
    'rowNetPrice',
    'rowGrossPriceRounded',
  ]
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Termékkód', objectKey: 'productCode', colKey: 'productCode',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "30%", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create, fReadonly: true,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Megnevezés', objectKey: 'lineDescription', colKey: 'lineDescription',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "70%", textAlign: "left",
    },
   {
      label: 'Mennyiség', objectKey: 'quantity', colKey: 'quantity',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "100px", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Me.e.', objectKey: 'unitOfMeasureX', colKey: 'unitOfMeasureX',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "80px", textAlign: "right"
    },
    {
      label: 'Ár', objectKey: 'unitPrice', colKey: 'unitPrice',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Nettó', objectKey: 'rowNetPrice', colKey: 'rowNetPrice',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Bruttó', objectKey: 'rowGrossPriceRounded', colKey: 'rowGrossPriceRounded',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
  ]

  get editDisabled() {
    return !this.kbS.isEditModeActivated && !this.isLoading && !this.isSaveInProgress;
  }

  public mode!: InvoiceBehaviorMode

  constructor(
    dialogService: NbDialogService,
    keyboardService: KeyboardNavigationService,
    footerService: FooterService,
    commonService: CommonService,
    private readonly statusService: StatusService,
    bbxSidebarService: BbxSidebarService,
    keyboardHelperService: KeyboardHelperService,
    router: Router,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvoiceLine>>,
    private readonly bbxToasterService: BbxToastrService,
    private readonly cdref: ChangeDetectorRef,
    private readonly invoiceService: InvoiceService,
    private readonly printAndDownloadService: PrintAndDownloadService,
    private readonly activatedRoute: ActivatedRoute,
    behaviorFactory: InvoiceBehaviorFactoryService,
    private readonly tokenService: TokenStorageService,
    private readonly productCodeManagerServiceService: ProductCodeManagerServiceService,
    private readonly productService: ProductService
  ) {
    super(dialogService, keyboardService, footerService, commonService, statusService, bbxSidebarService, keyboardHelperService, router)
    this.preventF12 = true

    this.isIncomingCorrectionInvoice = router.url.startsWith('/income')

    this.commands = GetFooterCommandListFromKeySettings(this.KeySettings)
    footerService.pushCommands(this.commands)

    const defaultCustomerData = {
      customerName: '',
      additionalAddressDetail: '',
      customerBankAccountNumber: '',
      taxpayerNumber: '',
      thirdStateTaxId: '',
      comment: '',
      postalCode: '',
      city: '',
    } as Customer

    this.senderData = defaultCustomerData
    this.buyerData= defaultCustomerData

    this.dbDataTableId = 'correction-invoice-table-invoice-line'

    this.dbData = []
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData)

    this.outGoingInvoiceData = new OutGoingInvoiceFullData()
    this.outGoingInvoiceData.invoiceNetAmount = 0
    this.outGoingInvoiceData.invoiceVatAmount = 0
    this.outGoingInvoiceData.lineGrossAmount = 0

    this.activatedRoute.url.subscribe(params => {
      this.mode = behaviorFactory.create(params[0].path)
      this.path = params[0].path

      if (this.mode.incoming) {
        const unitPrice = this.colDefs.find(x => x.objectKey === 'unitPrice')
        if (unitPrice) {
          unitPrice.label = this.mode.unitPriceColumnTitle
        }
      }
    })
  }

  public ngAfterViewInit(): void {
    this.invoiceForm.outInvFormNav.GenerateAndSetNavMatrices(true)

    this.dbDataTable = new InlineEditableNavigatableTable(
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      () => new InvoiceLine(this.requiredCols),
      this,
    )

    this.dbDataTable.OuterJump = true

    this.cellClass = 'PRODUCT'

    this.dbDataTable.Setup(this.dbData, this.dbDataDataSrc, this.allColumns, this.colDefs, this.colsToIgnore, this.cellClass)
    this.dbDataTable.GenerateAndSetNavMatrices(true)
    this.dbDataTable.PushFooterCommandList()
  }

  public ngOnInit(): void {
    this.isLoading = false

    this.dialogService
      .open(CorrectionInvoiceSelectionDialogComponent, {
        context: {
          isIncomingCorrectionInvoice: this.isIncomingCorrectionInvoice,
          partnerLock: this.mode.partnerLock
        }
      })
      .onClose.subscribe(this.onCorrentionInvoiceSelectionDialogClosed.bind(this))
  }

  private onCorrentionInvoiceSelectionDialogClosed(invoice: Invoice): void {
    this.kbS.SetCurrentNavigatable(this.invoiceForm.outInvFormNav)

    this.senderData = {
      customerName: invoice.supplierName,
      postalCode: invoice.supplierPostalCode,
      city: invoice.supplierCity,
      additionalAddressDetail: invoice.supplierAdditionalAddressDetail,
      customerBankAccountNumber: invoice.SupplierBankAccountNumber,
      taxpayerNumber: invoice.supplierTaxpayerNumber,
      thirdStateTaxId: invoice.supplierThirdStateTaxId,
      comment: invoice.supplierComment,
      customerVatStatus: invoice.supplierVatStatus,
    } as Customer

    this.buyerData = {
      id: invoice.customerID,
      customerName: invoice.customerName,
      postalCode: invoice.customerPostalCode,
      city: invoice.customerCity,
      additionalAddressDetail: invoice.customerAdditionalAddressDetail,
      customerBankAccountNumber: invoice.customerBankAccountNumber,
      taxpayerNumber: invoice.customerTaxpayerNumber,
      thirdStateTaxId: invoice.customerThirdStateTaxId,
      comment: invoice.CustomerComment,
      customerVatStatus: invoice.customerVatStatus,
    } as Customer

    this.invoiceFormData = {
      paymentMethod: invoice.paymentMethod,
      paymentDate: invoice.paymentDate,
      customerInvoiceNumber: invoice.customerInvoiceNumber,
      invoiceDeliveryDate: invoice.invoiceDeliveryDate,
      invoiceIssueDate: invoice.invoiceIssueDate,
      notice: invoice.notice,
    } as InvoiceFormData

    this.outGoingInvoiceData.originalInvoiceID = invoice.id
    this.outGoingInvoiceData.invoiceDiscountPercent = invoice.invoiceDiscountPercent

    setTimeout(() => this.kbS.SelectElementByCoordinate(0, 0), 100)
  }

  public ngOnDestroy(): void {
    this.kbS.Detach()

    this.mode.partnerLock?.unlockCustomer()
  }

  public inlineInputFocusChanged(event: any): void {
    if (!event.Focused) {
      this.dbData.forEach(x => x.data.ReCalc());
      this.RecalcNetAndVat();
    }

    if (event?.FieldDescriptor?.keySettingsRow && event?.FieldDescriptor?.keyAction) {
      if (event.Focused) {
        let k = GetUpdatedKeySettings(this.KeySettings, event.FieldDescriptor.keySettingsRow, event.FieldDescriptor.keyAction);
        this.commands = GetFooterCommandListFromKeySettings(k);
        this.fS.pushCommands(this.commands);
      } else {
        let k = this.KeySettings;
        this.commands = GetFooterCommandListFromKeySettings(k);
        this.fS.pushCommands(this.commands);
      }
    }
  }

  public ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    this.productCodeManagerServiceService.ChooseDataForTableRow({
      dbData: this.dbData,
      dbDataTable: this.dbDataTable,
      rowIndex: rowIndex,
      wasInNavigationMode: wasInNavigationMode,
      fillTableWithDataCallback: this.fillTableWithInvoiceLine.bind(this),
      data: this.outGoingInvoiceData,
      path: this.path,
    } as ChooseSummaryInvoiceProductRequest)
  }

  private fillTableWithInvoiceLine(notes: InvoiceLine[]): void {
    this.kbS.SetCurrentNavigatable(this.dbDataTable)

    notes.forEach(note => {
      note.quantity = -note.quantity

      note.Save()

      const checkedNote = this.dbData.find(x => x.data.id === note.id)
      if (checkedNote) {
        note.quantity += parseInt(checkedNote.data.quantity.toString())

        const index = this.dbData.indexOf(checkedNote)
        this.dbData.splice(index, 1)
      }
    })

    const existingNotes = this.dbData
      .map(x => x.data)

    this.dbData = notes
      .concat(existingNotes)
      .map(x => ({ data: x, uid: this.nextUid() }))

    this.dbData.sort((a, b) => {
      const aProperty = parseInt(a.data.id!)
      const bProperty = parseInt(b.data.id!)

      if (aProperty > bProperty)
        return 1

      if (aProperty < bProperty)
        return -1

      return 0
    })

    this.RefreshTable()

    this.UpdateOutGoingData()

    if (notes.length === 1) {
      const index = this.dbData.findIndex(x => x.data.id === notes[0].id)

      const elementId = this.cellClass + '-2-' + index

      this.kbS.SelectElement(elementId)
      this.kbS.ClickElement(elementId)
    }
  }

  private UpdateOutGoingData(): CreateOutgoingInvoiceRequest<InvoiceLine> {
    this.outGoingInvoiceData.customerID = this.buyerData.id;

    this.outGoingInvoiceData.notice = this.invoiceForm!.invoiceFormData!.notice;

    this.outGoingInvoiceData.invoiceDeliveryDate = this.invoiceForm.invoiceFormData!.invoiceDeliveryDate
    this.outGoingInvoiceData.invoiceIssueDate = this.invoiceForm.invoiceFormData!.invoiceIssueDate
    this.outGoingInvoiceData.paymentDate = this.invoiceForm.invoiceFormData!.paymentDate

    this.outGoingInvoiceData.customerInvoiceNumber = this.invoiceForm.invoiceFormData!.customerInvoiceNumber
    this.outGoingInvoiceData.paymentMethod = this.invoiceForm.invoiceFormData!.paymentMethod

    this.outGoingInvoiceData.warehouseCode = this.tokenService.wareHouse?.warehouseCode ?? ""

    this.outGoingInvoiceData.invoiceNetAmount = 0;
    this.outGoingInvoiceData.invoiceVatAmount = 0;

    this.RecalcNetAndVat();

    for (let i = 0; i < this.outGoingInvoiceData.invoiceLines.length; i++) {
      this.outGoingInvoiceData.invoiceLines[i].unitPrice = HelperFunctions.ToFloat(this.outGoingInvoiceData.invoiceLines[i].unitPrice);
      this.outGoingInvoiceData.invoiceLines[i].quantity = HelperFunctions.ToFloat(this.outGoingInvoiceData.invoiceLines[i].quantity);
      this.outGoingInvoiceData.invoiceLines[i].lineNumber = HelperFunctions.ToInt(i + 1);
    }

    this.outGoingInvoiceData.currencyCode = CurrencyCodes.HUF
    this.outGoingInvoiceData.exchangeRate = 1;

    this.outGoingInvoiceData.incoming = this.mode.incoming
    this.outGoingInvoiceData.invoiceType = this.mode.invoiceType
    this.outGoingInvoiceData.invoiceCategory = this.mode.invoiceCategory

    this.outGoingInvoiceData.invoiceCorrection = true

    console.log('[UpdateOutGoingData]: ', this.outGoingInvoiceData, this.invoiceForm.invoiceFormData!.paymentMethod)

    this.outGoingInvoiceData.loginName = this.tokenService.user?.name
    this.outGoingInvoiceData.username = this.tokenService.user?.loginName

    return OutGoingInvoiceFullDataToRequest(this.outGoingInvoiceData, false);
  }

  public ChooseDataForCustomerForm(): void {}

  public RefreshData(): void {
  }

  public RecalcNetAndVat(): void {
    this.outGoingInvoiceData.invoiceLines = this.dbData
      .filter(x => !x.data.IsUnfinished())
      .map(x => x.data);

    this.outGoingInvoiceData.invoiceNetAmount = this.outGoingInvoiceData.invoiceLines
      .map(x => HelperFunctions.ToFloat(x.rowNetPrice))
      .reduce((sum, current) => sum + current, 0);

    this.outGoingInvoiceData.lineGrossAmount = this.outGoingInvoiceData.invoiceLines
      .map(x => x.rowGrossPrice)
      .reduce((sum, current) => sum + current, 0);

    const paymentMethod = this.invoiceForm.invoiceFormData?.paymentMethod

    if (paymentMethod === "CASH" && this.outGoingInvoiceData.currencyCode === CurrencyCodes.HUF) {
      this.outGoingInvoiceData.lineGrossAmount = HelperFunctions.CashRound(this.outGoingInvoiceData.lineGrossAmount);
    } else {
      this.outGoingInvoiceData.lineGrossAmount = HelperFunctions.Round(this.outGoingInvoiceData.lineGrossAmount);
    }

    this.outGoingInvoiceData.invoiceNetAmount = HelperFunctions.Round2(this.outGoingInvoiceData.invoiceNetAmount, 1);
    this.outGoingInvoiceData.invoiceVatAmount = HelperFunctions.Round(this.outGoingInvoiceData.invoiceVatAmount);
  }

  public TableRowDataChanged(changedData?: any, index?: number | undefined, col?: string | undefined): void {
    if (!changedData && !changedData.productCode) {
      return
    }

    if (col === 'quantity' && index !== null && index !== undefined) {
      const validationResult = this.mode.validateQuantity(changedData.quantity, changedData.limit)

      if (!validationResult) {
        changedData.quantity = HelperFunctions.ToInt(changedData.quantity)
        changedData.Save()
        return
      }

      setTimeout(() => {
        this.bbxToasterService.showError(validationResult)
      }, 0);
      this.dbData[index].data.Restore()

      this.dbDataTable.ClickByObjectKey('quantity')
    }
  }

  private Save(): void {
    if (this.invoiceForm.outInvForm.invalid) {
      this.bbxToasterService.showError(`Teljesítési időpont, vagy más számlával kapcsolatos adat nincs megadva.`)
      return
    }

    if (this.dbData.find(x => !x.data.IsUnfinished()) === undefined) {
      this.bbxToasterService.showError(`Legalább egy érvényesen megadott tétel szükséges a mentéshez.`);
      return
    }

    const dialogRef = this.dialogService.open(SaveDialogComponent, {
      context: {
        data: this.outGoingInvoiceData,
        isDiscountDisabled: true,
      }
    })

    dialogRef.onClose.subscribe(async res => {
      if (!res) {
        return
      }

      try {
        this.statusService.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING])

        const request = this.UpdateOutGoingData()

        var response = await this.invoiceService.createOutgoingAsync(request)

        if (!!response.data) {
          this.invoiceForm.outInvFormNav.form.controls['invoiceOrdinal'].setValue(response.data.invoiceNumber ?? '');
        }

        this.mode.partnerLock?.unlockCustomer()

        this.statusService.pushProcessStatus(Constants.BlankProcessStatus)

        await this.printAndDownloadService.openPrintDialog({
          DialogTitle: Constants.TITLE_PRINT_INVOICE,
          DefaultCopies: 1,
          MsgError: `A ${res.data?.invoiceNumber ?? ''} számla nyomtatása közben hiba történt.`,
          MsgCancel: `A ${res.data?.invoiceNumber ?? ''} számla nyomtatása nem történt meg.`,
          MsgFinish: `A ${res.data?.invoiceNumber ?? ''} számla nyomtatása véget ért.`,
          Obs: this.invoiceService.GetReport.bind(this.invoiceService),
          Reset: this.DelayedReset.bind(this),
          ReportParams: {
            "id": response.data?.id,
            "copies": 1 // Ki lesz töltve dialog alapján
          } as Constants.Dct,
          DialogClasses: Constants.INVOICE_PRINT_DIALOG_MARGIN_CLASS
        } as PrintDialogRequest);
      }
      catch (error) {
        this.cs.HandleError(error)
      }
      finally {
        this.statusService.pushProcessStatus(Constants.BlankProcessStatus)
      }
    })
  }

  @HostListener('window:keydown', ['$event'])
  public onFunctionKeyDown(event: KeyboardEvent) {
    if (!this.isSaveInProgress && event.ctrlKey && event.key == 'Enter' && this.KeySettings[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return;
      }
      this.Save();
      return;
    }
    this.HandleKeyDown(event);
  }

  protected async openProductStockInformationDialog(productCode: string): Promise<void> {
    this.sts.waitForLoad(true)

    try {
      const product = await this.productService.getProductByCodeAsync({ ProductCode: productCode })

      this.sts.waitForLoad(false)

      this.dialogService.open(ProductStockInformationDialogComponent, {
        context: {
          product: product
        }
      })
    }
    catch (error) {
      this.cs.HandleError(error)
    }
    finally {
      this.sts.waitForLoad(false)
    }
  }

  public override HandleKeyDown(event: Event | TableKeyDownEvent, isForm: boolean = false): void {
    if (isTableKeyDownEvent(event)) {
      let _event = event.Event;
      if (_event.ctrlKey) {
        return
      }
      switch (_event.key) {
        case KeyBindings.F3: {
          HelperFunctions.StopEvent(_event);
          return;
        }
        case this.KeySettings[Actions.Delete].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event);
            return;
          }
          _event.preventDefault();
          HelperFunctions.confirm(this.dialogService, HelperFunctions.StringFormat(Constants.MSG_CONFIRMATION_DELETE_PARAM, event.Row.data), () => {
            this.dbDataTable?.HandleGridDelete(_event, event.Row, event.RowPos, event.ObjectKey)
          });
          break;
        }
        case this.KeySettings[Actions.Search].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event);
            return;
          }
          _event.preventDefault();
          this.ChooseDataForTableRow(event.RowPos, event.WasInNavigationMode);
          break;
        }
        case this.KeySettings[Actions.Refresh].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event)
            return
          }
          _event.preventDefault()

          if (this.kbS.p.y === this.dbData.length - 1) {
            break
          }

          const productCode = this.dbData[this.kbS.p.y].data.productCode
          this.openProductStockInformationDialog(productCode)
          break
        }
        case KeyBindings.Enter: {
          if (!this.isSaveInProgress && _event.ctrlKey && _event.key == 'Enter' && this.KeySettings[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
            if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
              _event.preventDefault();
              _event.stopImmediatePropagation();
              _event.stopPropagation();
              return;
            }
            this.Save();
            return;
          }
          break;
        }
      }
    }
  }
}
