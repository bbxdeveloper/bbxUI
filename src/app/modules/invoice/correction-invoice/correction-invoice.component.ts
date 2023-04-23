import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnDestroy, OnInit } from '@angular/core';
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
import { OutGoingInvoiceFullData } from '../models/CreateOutgoingInvoiceRequest';
import { GetUpdatedKeySettings } from 'src/assets/util/KeyBindings';
import { SummaryInvoiceKeySettings } from 'src/assets/util/KeyBindings';
import { PendingDeliveryNoteItem } from '../models/PendingDeliveryNoteItem';
import { InvoiceItemsDialogTableSettings, PendingDeliveryNotesTableSettings } from 'src/assets/model/TableSettings';
import { isTableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { TableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { InvoiceItemsDialogComponent } from '../invoice-items-dialog/invoice-items-dialog.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { NegativeQuantityValidator } from '../models/SummaryInvoiceMode';

@Component({
  selector: 'app-correction-invoice',
  templateUrl: './correction-invoice.component.html',
  styleUrls: ['./correction-invoice.component.scss']
})
export class CorrectionInvoiceComponent extends BaseInlineManagerComponent<InvoiceLine> implements OnInit, OnDestroy, IInlineManager {
  public senderData: Customer

  public buyerData: Customer

  private selectedInvoiceId?: number

  outGoingInvoiceData!: OutGoingInvoiceFullData

  public KeySetting: Constants.KeySettingsDct = SummaryInvoiceKeySettings;

  override colsToIgnore: string[] = ["productDescription", "lineNetAmount", "lineGrossAmount",
    "unitOfMeasureX", 'unitPrice', 'rowNetPrice','rowGrossPriceRounded']
  private requiredCols: string[] = ['productCode', 'quantity']
  override allColumns = [
    'productCode',
    'productDescription',
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
      label: 'Megnevezés', objectKey: 'productDescription', colKey: 'productDescription',
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
  }

  public ngOnInit(): void {
    this.isLoading = false

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

    this.dbDataTable.Setup(this.dbData, this.dbDataDataSrc, this.allColumns, this.colDefs, this.colsToIgnore, 'PRODUCT')
    this.dbDataTable.GenerateAndSetNavMatrices(true)
    this.dbDataTable.PushFooterCommandList()

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
      // const invoiceDeliveryDate = new Date(note.invoiceDeliveryDate)
      // const relDeliveryDate = new Date(note.relDeliveryDate)

      // if (relDeliveryDate < invoiceDeliveryDate) {
      //   this.outGoingInvoiceData.invoiceDeliveryDate = note.relDeliveryDate
      // }

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

    this.generateWorkNumbers()

    this.RefreshTable()

    // this.UpdateOutGoingData()

    if (notes.length === 1) {
      const index = this.dbData.findIndex(x => x.data.id === notes[0].id)

      const elementId = 'PRODUCT-2-' + index

      this.kbS.SelectElement(elementId)
      this.kbS.ClickElement(elementId)
    }
  }

  private generateWorkNumbers(): void {
    // const workNumbersAsString = () => 'M.Sz.: ' + this.workNumbers.join(', ')

    // const noticeControl = this.outInvForm.get('notice')
    // const existingNotice = noticeControl?.value as string ?? ''

    // const existingWorkNumbers = !!this.workNumbers ? workNumbersAsString() : ''
    // const otherNotes = existingNotice
    //   .substring(existingWorkNumbers.length)
    //   .trim()

    // let workNumbers = this.dbData.filter(x => !!x.data.workNumber)
    //   .map(x => x.data.workNumber)

    // this.workNumbers = [...new Set(workNumbers)]

    // const notice = this.workNumbers.length > 0
    //   ? workNumbersAsString() + ' ' + otherNotes
    //   : otherNotes

    // noticeControl?.setValue(notice.trim())
  }

  public ChooseDataForCustomerForm(): void {}

  public RefreshData(): void {

  }

  public RecalcNetAndVat(): void {

  }

  public TableRowDataChanged(changedData?: any, index?: number | undefined, col?: string | undefined): void {
    if (!changedData && !changedData.productCode) {
      return
    }

    if (col === 'quantity' && index !== null && index !== undefined) {
      const validationResult = new NegativeQuantityValidator()
        .validate(changedData.quantity, changedData.limit)

      if (!validationResult) {
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

            this.generateWorkNumbers()
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
            // this.Save();
            return;
          }
          break;
        }
      }
    }
  }
}
