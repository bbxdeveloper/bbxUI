import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { CorrectionInvoiceSelectionDialogComponent } from '../correction-invoice-selection-dialog/correction-invoice-selection-dialog.component';
import { Invoice } from '../models/Invoice';
import { Customer } from '../../customer/models/Customer';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { InvoiceLine } from '../models/InvoiceLine';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FooterService } from 'src/app/services/footer.service';
import { CommonService } from 'src/app/services/common.service';
import { StatusService } from 'src/app/services/status.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { Router } from '@angular/router';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { Constants } from 'src/assets/util/Constants';
import { Actions, GetFooterCommandListFromKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';
import { CreateOutgoingInvoiceRequest, OutGoingInvoiceFullData, OutGoingInvoiceFullDataToRequest } from '../models/CreateOutgoingInvoiceRequest';
import { GetUpdatedKeySettings } from 'src/assets/util/KeyBindings';
import { SummaryInvoiceKeySettings } from 'src/assets/util/KeyBindings';
import { InvoiceItemsDialogTableSettings } from 'src/assets/model/TableSettings';
import { isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { TableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { InvoiceItemsDialogComponent } from '../invoice-items-dialog/invoice-items-dialog.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { NegativeQuantityValidator } from '../models/SummaryInvoiceMode';
import { InvoiceFormData } from '../invoice-form/InvoiceFormData';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';
import { SaveDialogComponent } from '../save-dialog/save-dialog.component';

@Component({
  selector: 'app-correction-invoice',
  templateUrl: './correction-invoice.component.html',
  styleUrls: ['./correction-invoice.component.scss']
})
export class CorrectionInvoiceComponent extends BaseInlineManagerComponent<InvoiceLine> implements OnInit, OnDestroy, AfterViewInit, IInlineManager {
  public senderData: Customer

  public buyerData: Customer

  private selectedInvoiceId?: number

  outGoingInvoiceData!: OutGoingInvoiceFullData

  @ViewChild('invoiceForm')
  public invoiceForm!: InvoiceFormComponent

  public invoiceFormData!: InvoiceFormData

  public KeySetting: Constants.KeySettingsDct = SummaryInvoiceKeySettings;

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
    { // unitofmeasureX show, post unitofmeasureCode
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

  constructor(
    dialogService: NbDialogService,
    keyboardService: KeyboardNavigationService,
    footerService: FooterService,
    commonService: CommonService,
    statusService: StatusService,
    bbxSidebarService: BbxSidebarService,
    keyboardHelperService: KeyboardHelperService,
    router: Router,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvoiceLine>>,
    private readonly bbxToasterService: BbxToastrService,
    private readonly cdref: ChangeDetectorRef,
  ) {
    super(dialogService, keyboardService, footerService, commonService, statusService, bbxSidebarService, keyboardHelperService, router)

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
  }

  public ngAfterViewInit(): void {
    console.log(this)

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
      .open(CorrectionInvoiceSelectionDialogComponent)
      .onClose.subscribe(this.onCorrentionInvoiceSelectionDialogClosed.bind(this))
  }

  private onCorrentionInvoiceSelectionDialogClosed(invoice: Invoice): void {
    this.senderData = {
      customerName: invoice.supplierName,
      postalCode: invoice.supplierPostalCode,
      city: invoice.supplierCity,
      additionalAddressDetail: invoice.supplierAdditionalAddressDetail,
      customerBankAccountNumber: invoice.SupplierBankAccountNumber,
      taxpayerNumber: invoice.supplierTaxpayerNumber,
      thirdStateTaxId: invoice.supplierThirdStateTaxId,
      comment: invoice.supplierComment,
    } as Customer

    this.buyerData = {
      customerName: invoice.customerName,
      postalCode: invoice.customerPostalCode,
      city: invoice.customerCity,
      additionalAddressDetail: invoice.customerAdditionalAddressDetail,
      customerBankAccountNumber: invoice.customerBankAccountNumber,
      taxpayerNumber: invoice.customerTaxpayerNumber,
      thirdStateTaxId: invoice.customerThirdStateTaxId,
      comment: invoice.CustomerComment,
    } as Customer

    this.invoiceFormData = {
      paymentMethod: invoice.paymentMethod,
      paymentDate: invoice.paymentDate,
      invoiceDeliveryDate: invoice.invoiceDeliveryDate,
      invoiceIssueDate: invoice.invoiceIssueDate,
      // invoiceOrdinal: invoice.o
      notice: invoice.notice,
    } as InvoiceFormData

    this.selectedInvoiceId = invoice.id
  }

  public ngOnDestroy(): void {
    this.kbS.Detach()
  }

  public inlineInputFocusChanged(event: any): void {
    if (!event.Focused) {
      this.dbData.forEach(x => x.data.ReCalc());
      this.RecalcNetAndVat();
    }

    if (event?.FieldDescriptor?.keySettingsRow && event?.FieldDescriptor?.keyAction) {
      if (event.Focused) {
        let k = GetUpdatedKeySettings(this.KeySetting, event.FieldDescriptor.keySettingsRow, event.FieldDescriptor.keyAction);
        this.commands = GetFooterCommandListFromKeySettings(k);
        this.fS.pushCommands(this.commands);
      } else {
        let k = this.KeySetting;
        this.commands = GetFooterCommandListFromKeySettings(k);
        this.fS.pushCommands(this.commands);
      }
    }
  }

  public ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const event = new EventEmitter<InvoiceLine[]>(false)

    event.subscribe(this.fillTableWithInvoiceLine.bind(this))

    this.dialogService.open(InvoiceItemsDialogComponent, {
      context: {
        invoiceId: this.selectedInvoiceId,
        checkedLineItems: this.dbData.map(x => x.data),
        allColumns: InvoiceItemsDialogTableSettings.AllColumns,
        colDefs: InvoiceItemsDialogTableSettings.ColDefs,
        selectedItemsChanged: event
      }
    })
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

    // // if (this.mode.incoming) {
    // //   this.outGoingInvoiceData.customerInvoiceNumber = this.outInvForm.controls['customerInvoiceNumber'].value;
    // // }

    this.outGoingInvoiceData.notice = this.invoiceForm!.invoiceFormData!.notice;

    this.outGoingInvoiceData.invoiceDeliveryDate = this.invoiceForm!.invoiceFormData!.invoiceDeliveryDate
    this.outGoingInvoiceData.invoiceIssueDate = this.invoiceForm!.invoiceFormData!.invoiceIssueDate
    this.outGoingInvoiceData.paymentDate = this.invoiceForm!.invoiceFormData!.paymentDate

    // this.outGoingInvoiceData.paymentMethod = this.mode.isSummaryInvoice
    //   ? HelperFunctions.PaymentMethodToDescription(this.outInvForm.controls['paymentMethod'].value, this.paymentMethods)
    //   : this.mode.paymentMethod

    this.outGoingInvoiceData.warehouseCode = '1';

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

    this.outGoingInvoiceData.warehouseCode = '001';

    // this.outGoingInvoiceData.incoming = this.mode.incoming;
    // this.outGoingInvoiceData.invoiceType = this.mode.invoiceType;
    // this.outGoingInvoiceData.invoiceCategory = this.mode.invoiceCategory

    console.log('[UpdateOutGoingData]: ', this.outGoingInvoiceData, this.invoiceForm!.invoiceFormData!.paymentMethod)

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

    // this.outGoingInvoiceData.lineGrossAmount = this.outGoingInvoiceData.invoiceNetAmount + this.outGoingInvoiceData.invoiceVatAmount;

    // let _paymentMethod = this.Delivery ? this.DeliveryPaymentMethod :
    //   HelperFunctions.PaymentMethodToDescription(this.outInvForm.controls['paymentMethod'].value, this.paymentMethods);

    // if (_paymentMethod === "CASH" && this.outGoingInvoiceData.currencyCode === CurrencyCodes.HUF) {
    //   this.outGoingInvoiceData.lineGrossAmount = HelperFunctions.CashRound(this.outGoingInvoiceData.lineGrossAmount);
    // } else {
    //   this.outGoingInvoiceData.lineGrossAmount = HelperFunctions.Round(this.outGoingInvoiceData.lineGrossAmount);
    // }

    this.outGoingInvoiceData.invoiceNetAmount = HelperFunctions.Round2(this.outGoingInvoiceData.invoiceNetAmount, 1);
    this.outGoingInvoiceData.invoiceVatAmount = HelperFunctions.Round(this.outGoingInvoiceData.invoiceVatAmount);
  }

  public TableRowDataChanged(changedData?: any, index?: number | undefined, col?: string | undefined): void {
    if (!changedData && !changedData.productCode) {
      return
    }

    if (col === 'quantity' && index !== null && index !== undefined) {
      const validationResult = new NegativeQuantityValidator()
        .validate(changedData.quantity, changedData.limit)

      if (!validationResult) {
        changedData.quantity = parseInt(changedData.quantity)
        changedData.Save()
        return
      }

      setTimeout(() => {
        this.bbxToasterService.show(
          validationResult,
          Constants.TITLE_ERROR,
          Constants.TOASTR_ERROR
        )
      }, 0);
      this.dbData[index].data.Restore('quantity')
    }
  }

  private Save(): void {
    const dialogRef = this.dialogService.open(SaveDialogComponent, {
      context: {
        data: this.outGoingInvoiceData
      }
    })

    dialogRef.onClose.subscribe(res => {
      debugger
    })
  }

  @HostListener('window:keydown', ['$event'])
  public onFunctionKeyDown(event: KeyboardEvent) {
    if (!this.isSaveInProgress && event.ctrlKey && event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return;
      }
      // this.Save();
      return;
    }
    this.HandleKeyDown(event);
  }

  public override HandleKeyDown(event: Event | TableKeyDownEvent, isForm: boolean = false): void {
    if (isTableKeyDownEvent(event)) {
      let _event = event.Event;
      switch (_event.key) {
        case KeyBindings.F3: {
          HelperFunctions.StopEvent(_event);
          return;
        }
        case this.KeySetting[Actions.Delete].KeyCode: {
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
        case this.KeySetting[Actions.Search].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event);
            return;
          }
          _event.preventDefault();
          this.ChooseDataForTableRow(event.RowPos, event.WasInNavigationMode);
          break;
        }
        case KeyBindings.Enter: {
          if (!this.isSaveInProgress && _event.ctrlKey && _event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
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
