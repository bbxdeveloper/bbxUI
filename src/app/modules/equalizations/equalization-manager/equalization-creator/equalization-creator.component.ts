import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { InvPayment, InvPaymentItem, InvPaymentItemPost } from '../../models/InvPayment';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NbTable, NbSortDirection, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
import { BehaviorSubject, Subscription, lastValueFrom } from 'rxjs';
import { BaseInlineManagerComponent } from 'src/app/modules/shared/base-inline-manager/base-inline-manager.component';
import { selectProcutCodeInTableInput, TableKeyDownEvent, isTableKeyDownEvent } from 'src/app/modules/shared/inline-editable-table/inline-editable-table.component';
import { ConfirmationWithAuthDialogComponent, ConfirmationWithAuthDialogesponse } from 'src/app/modules/shared/simple-dialogs/confirmation-with-auth-dialog/confirmation-with-auth-dialog.component';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { TileCssClass, TileCssColClass, AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { EqualizationCreatorKeySettings, GetFooterCommandListFromKeySettings, Actions, KeyBindings } from 'src/assets/util/KeyBindings';
import { EqualizationsService } from '../../services/equalizations.service';
import { InvoiceService } from 'src/app/modules/invoice/services/invoice.service';
import { Invoice } from 'src/app/modules/invoice/models/Invoice';
import { CurrencyCode, CurrencyCodes } from 'src/app/modules/system/models/CurrencyCode';
import { SystemService } from 'src/app/modules/system/services/system.service';
import { GetExchangeRateParamsModel } from 'src/app/modules/system/models/GetExchangeRateParamsModel';

@Component({
  selector: 'app-equalization-creator',
  templateUrl: './equalization-creator.component.html',
  styleUrls: ['./equalization-creator.component.scss']
})
export class EqualizationCreatorComponent extends BaseInlineManagerComponent<InvPaymentItem> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  Subscription_Search?: Subscription;

  public KeySetting: Constants.KeySettingsDct = EqualizationCreatorKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  invPaymentData!: InvPayment;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  currencyCodes: CurrencyCode[] = []
  // currencyCodes: string[] = []
  // currencyCodeValues: { [key: string]: CurrencyCode } = {}
  // get currencyCodeComboData$(): BehaviorSubject<string[]> {
  //   return this.colDefs.find(x => x.objectKey === 'currencyCode')!.comboboxData$!
  // }

  override colsToIgnore: string[] = ["customerName", "paymentDate", "invoicePayedAmount", "invPaymentAmountHUF"];
  override allColumns = [
    'invoiceNumber',
    'customerName',
    'paymentDate',
    'invoicePayedAmount',
    'bankTransaction',
    'invPaymentDate',
    'currencyCode',
    'exchangeRate',
    'invPaymentAmount',
    'GetInvoicePayedAmountHUF'
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Számlaszám', objectKey: 'invoiceNumber', colKey: 'invoiceNumber',
      defaultValue: '', type: 'string', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "30%", textAlign: "left", fInputType: 'invoice-number'
    },
    {
      label: 'Ügyfél', objectKey: 'customerName', colKey: 'customerName',
      defaultValue: '', type: 'string', mask: "", fReadonly: true, navMatrixCssClass: TileCssClass,
      colWidth: "80%", textAlign: "left",
    },
    {
      label: 'Fiz.hat', objectKey: 'paymentDate', colKey: 'paymentDate',
      defaultValue: '', type: 'onlyDate', fRequired: true, fInputType: 'date', navMatrixCssClass: TileCssClass,
      mask: '', colWidth: '120px', textAlign: 'left', fReadonly: true
    },
    {
      label: 'Kiegyenlítve', objectKey: 'invoicePayedAmount', colKey: 'invoicePayedAmount',
      defaultValue: '', type: 'number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Banki azonosító', objectKey: 'bankTransaction', colKey: 'bankTransaction',
      defaultValue: '', type: 'string', mask: "", fInputType: 'uppercase',
      colWidth: "125px", textAlign: "left", navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Dátum', objectKey: 'invPaymentDate', colKey: 'invPaymentDate',
      defaultValue: '', type: 'onlyDate', fInputType: 'date', navMatrixCssClass: TileCssClass,
      mask: '', colWidth: '120px', textAlign: 'left', fReadonly: false
    },
    {
      label: 'Pénznem', objectKey: 'currencyCode', colKey: 'currencyCode', navMatrixCssClass: TileCssClass,
      defaultValue: '', type: 'string', mask: "", //fInputType: 'combobox', fReadonly: false,
      colWidth: "125px", textAlign: "left", fInputType: 'uppercase' //, comboboxData$: new BehaviorSubject<string[]>([])
    },
    {
      label: 'Árfolyam', objectKey: 'exchangeRate', colKey: 'exchangeRate',
      defaultValue: '', type: 'number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: false,
    },
    {
      label: 'Összeg', objectKey: 'invPaymentAmount', colKey: 'invPaymentAmount',
      defaultValue: '', type: 'number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: false,
    },
    {
      label: 'Összeg HUF', objectKey: 'GetInvoicePayedAmountHUF', colKey: 'GetInvoicePayedAmountHUF',
      defaultValue: '', type: 'number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    }
  ]
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  dateForm!: FormGroup;
  dateFormId: string = "buyer-form";
  dateFormNav!: InlineTableNavigatableForm;

  private tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvPaymentItem>>,
    private readonly cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private readonly bbxToastrService: BbxToastrService,
    private readonly simpleToastrService: NbToastrService,
    cs: CommonService,
    sts: StatusService,
    sideBarService: BbxSidebarService,
    khs: KeyboardHelperService,
    router: Router,
    private readonly invPaymentService: EqualizationsService,
    private readonly invoiceService: InvoiceService,
    private readonly systemService: SystemService
  ) {
    super(dialogService, kbS, fS, cs, sts, sideBarService, khs, router);
    this.preventF12 = true
    this.initialSetup();
  }

  private async refreshComboboxData(setIsLoad = false): Promise<void> {
    await lastValueFrom(this.systemService.GetAllCurrencyCodes())
      .then(data => {
        this.currencyCodes = data
        // this.currencyCodes =
        //   data?.map(x => {
        //     let res = x.text;
        //     this.currencyCodeValues[res] = x;
        //     return x.text;
        //   }) ?? [];

        // this.currencyCodes =
        //   data?.map(x => x.text) ?? [];
        // this.currencyCodeComboData$.next(this.currencyCodes);
      })
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => { });
  }

  private initialSetup(): void {
    this.dbDataTableId = "offers-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    this.invPaymentData = {
      invPaymentItems: []
    } as InvPayment

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dateForm = new FormGroup({});

    this.dateFormNav = new InlineTableNavigatableForm(
      this.dateForm,
      this.kbS,
      this.cdref,
      [],
      this.dateFormId,
      AttachDirection.DOWN,
      this
    );

    this.dateFormNav!.OuterJump = true;

    this.dbDataTable = new InlineEditableNavigatableTable(
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      () => {
        return new InvPaymentItem();
      },
      this
    );

    this.dbDataTable.OuterJump = true;

    this.isLoading = false
  }

  refresh(): void {
    this.dbData = [];
    this.dbDataDataSrc.setData(this.dbData);

    this.table?.renderRows();
    this.RefreshTable();
  }

  async ngOnInit(): Promise<void> {
    this.fS.pushCommands(this.commands);
    await this.refreshComboboxData()
  }

  ngAfterViewInit(): void {
    this.AfterViewInitSetup();
  }

  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();
  }

  UpdateSaveData(): void {
    this.invPaymentData.invPaymentItems =
      this.dbDataTable.data
        .filter(x => !x.data.IsUnfinished())
        .map(x => x.data)
        .filter(x => x.invoiceID > 0)

    for (let i = 0; i < this.invPaymentData.invPaymentItems.length; i++) {
      this.invPaymentData.invPaymentItems[i] = {
        invoiceNumber: this.invPaymentData.invPaymentItems[i].invoiceNumber,
        bankTransaction: this.invPaymentData.invPaymentItems[i].bankTransaction,
        invPaymentDate: this.invPaymentData.invPaymentItems[i].invPaymentDate,
        currencyCode: this.invPaymentData.invPaymentItems[i].currencyCode,
        exchangeRate: HelperFunctions.ToFloat(this.invPaymentData.invPaymentItems[i].exchangeRate),
        invPaymentAmount: HelperFunctions.ToFloat(this.invPaymentData.invPaymentItems[i].invPaymentAmount),
        userID: this.invPaymentData.invPaymentItems[i].userID,
      } as InvPaymentItemPost
    }
  }

  Save(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.UpdateSaveData()

    const confirmDialogRef = this.dialogService.open(ConfirmationWithAuthDialogComponent, { context: { title: Constants.MSG_CONFIRMATION_SAVE_DATA } });
    confirmDialogRef.onClose.subscribe(async (res: ConfirmationWithAuthDialogesponse) => {
      if (!res)
        return

      console.log('Save: ', this.invPaymentData);

      try {
        this.isSaveInProgress = true;
        this.status.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING])

        await lastValueFrom(this.invPaymentService.Create(this.invPaymentData))

        this.simpleToastrService.show(
          Constants.MSG_SAVE_SUCCESFUL,
          Constants.TITLE_INFO,
          Constants.TOASTR_SUCCESS_5_SEC
        );

        this.refresh()

        setTimeout(() => {
          this.kbS.SetCurrentNavigatable(this.dbDataTable)
          this.kbS.SelectFirstTile()
        }, 250)
      } catch (error) {
        this.cs.HandleError(error)
      } finally {
        this.isSaveInProgress = false
        this.status.pushProcessStatus(Constants.BlankProcessStatus)
      }
    });
  }

  protected AfterViewInitSetup(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore,
      'PRODUCT'
    );
    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.commandsOnTable = this.commands;
    this.dbDataTable.commandsOnTableEditMode = this.commands;
    this.dbDataTable.PushFooterCommandList();

    this.cdref.detectChanges();

    // TODO
    if (this.dbDataTable.data.length > 1) {
      this.dbDataTable.data = [this.dbDataTable.data[0]];
      this.dbDataDataSrc.setData(this.dbDataTable.data);
    }

    this.kbS.SetCurrentNavigatable(this.dbDataTable)
    this.kbS.SelectFirstTile()
    this.kbS.ClickCurrentElement()
  }

  public isRowInErrorState(row: TreeGridNode<InvPaymentItem>): boolean {
    return !row.data.IsUnfinished() && row.data.invPaymentAmount === 0
  }

  async HandleProductSelection(res: Invoice, rowIndex: number, checkIfCodeEqual: boolean = true) {
    if (res.id === undefined || res.id === -1) {
      return;
    }

    let row = this.dbDataTable.data[rowIndex];
    let count = this.dbDataTable.data.filter(x => x.data.invoiceNumber === res.invoiceNumber).length;
    if (count > 1 || (count === 1 && res.invoiceNumber !== row.data.invoiceNumber)) {
      this.dbDataTable.editedRow!.data.invoiceNumber = "";
      this.kbS.ClickCurrentElement();
      this.bbxToastrService.show(
        Constants.MSG_PRODUCT_ALREADY_THERE,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    } else if (checkIfCodeEqual && res.invoiceNumber === row.data.invoiceNumber) {
      this.bbxToastrService.show(
        Constants.MSG_PRODUCT_ALREADY_THERE,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    }

    let currentRow = this.dbDataTable.FillCurrentlyEditedRow({
      data: await this.FromInvoice(res)
    }, ['invoiceNumber']);
    currentRow?.data.Save('invoiceNumber');

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.dbDataTable.MoveNextInTable();
    setTimeout(() => {
      this.kbS.setEditMode(KeyboardModes.EDIT);
      this.isLoading = false;
      this.kbS.ClickCurrentElement();
    }, 500);

    return;
  }

  private async FromInvoice(res: Invoice): Promise<InvPaymentItem> {
    let newPaymentItem = new InvPaymentItem()
    newPaymentItem = HelperFunctions.PatchObject(res, newPaymentItem, [], [{ from: 'id', to: 'invoiceID'}])
    
    if (newPaymentItem.currencyCode === CurrencyCodes.HUF) {
      newPaymentItem.exchangeRate = 1
    } else {
      const exchangeRate = await lastValueFrom(this.systemService.GetExchangeRate({
        Currency: newPaymentItem.currencyCode,
        ExchengeRateDate: res.invoiceIssueDate
      } as GetExchangeRateParamsModel))
        .catch(err => {
          this.cs.HandleError(err)
        })
    }

    return newPaymentItem
  }

  async HandleProductChoose(): Promise<void> {}

  ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {}

  ChooseDataForCustomerForm(): void { }
  RefreshData(): void { }
  RecalcNetAndVat(): void { }

  HandleGridCodeFieldEnter(event: any, row: TreeGridNode<InvPaymentItem>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!event) {
      this.bbxToastrService.close();
      event.stopPropagation();
    }
    if (this.isEditModeOff) {
      this.dbDataTable.HandleGridEnter(row, rowPos, objectKey, colPos, inputId, fInputType);
      setTimeout(() => {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.kbS.ClickCurrentElement();
      }, 50);
    } else {
      this.TableCodeFieldChanged(row.data, rowPos, row, rowPos, objectKey, colPos, inputId, fInputType);
    }
  }

  protected TableCodeFieldChanged(changedData: any, index: number, row: TreeGridNode<InvPaymentItem>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    const previousValue = this.dbDataTable.data[rowPos].data?.GetSavedFieldValue('invoiceNumber')
    if (previousValue && changedData?.invoiceNumber === previousValue) {
      this.bbxToastrService.show(
        Constants.MSG_PRODUCT_ALREADY_THERE,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return
    }
    if (!!changedData && !!changedData.invoiceNumber && changedData.invoiceNumber.length > 0) {
      let _invoice: Invoice = { id: -1 } as Invoice;
      this.status.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
      this.invoiceService.GetInvoiceByInvoiceNumber({ invoiceNumber: changedData.invoiceNumber })
        .then(
          async (invoice: Invoice) => {
            if (!!invoice && !!invoice?.invoiceNumber) {
              _invoice = invoice;
              await this.HandleProductSelection(_invoice, rowPos, false)
            } else {
              selectProcutCodeInTableInput()
              this.bbxToastrService.showError(Constants.MSG_NO_PRODUCT_FOUND);
            }
          }
        )
        .catch(() => {
          this.dbDataTable.data[rowPos].data.Restore('invoiceNumber')
        })
        .finally(() => {
          this.status.pushProcessStatus(Constants.BlankProcessStatus)
        })
    }
  }

  TableRowDataChanged(changedData?: any, index?: number, col?: string): void {
    if (!changedData || !changedData.invoiceNumber)
      return

    if ((!!col && col === 'invoiceNumber') || col === undefined) {
      this.invoiceNumberChanged(changedData, index)
    }

    if (col === 'currencyCode' && index !== null && index !== undefined) {
      if (this.currencyCodes.find(x => x.value.toLowerCase() === changedData.currencyCode.toLowerCase()) === undefined) {
        setTimeout(() => {
          this.bbxToastrService.show(
            Constants.MSG_ERROR_INVALID_CURRENCY_CODE,
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          )
        }, 0);
        this.dbData[index].data.Restore()

        this.dbDataTable.ClickByObjectKey('currencyCode')
      } else {
        changedData.Save()
      }
    }

    if (col === 'invPaymentDate' && index !== null && index !== undefined) {
      if (!HelperFunctions.IsDateStringValid(changedData.invPaymentDate + '') ) {
        setTimeout(() => {
          this.bbxToastrService.show(
            Constants.MSG_ERROR_INVALID_DATE,
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          )
        }, 0);
        this.dbData[index].data.Restore()

        this.dbDataTable.ClickByObjectKey('invPaymentDate')
      } else {
        changedData.Save()
      }
    }
  }

  private invoiceNumberChanged(changedData: InvPaymentItem, index?: number): void {
    this.invoiceService.GetInvoiceByInvoiceNumber({ invoiceNumber: changedData.invoiceNumber })
      .then(async (invoice: Invoice) => {
        if (index !== undefined) {
          let tmp = this.dbData[index].data;

          tmp = await this.FromInvoice(invoice)

          this.dbData[index].data = tmp;
          this.dbDataDataSrc.setData(this.dbData);
        }

        this.RecalcNetAndVat();
      })
    .catch(err => {
      this.cs.HandleError(err)
    })
  }

  CheckSaveConditionsAndSave(): void {
    this.dateForm.markAllAsTouched();

    if (this.dbData.find(x => !x.data.IsUnfinished()) === undefined) {
      this.bbxToastrService.show(
        `Legalább egy érvényesen megadott tétel szükséges a mentéshez.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    }

    this.Save();
  }

  /////////////////////////////////////////////
  ////////////// KEYBOARD EVENTS //////////////
  /////////////////////////////////////////////

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return;
      }
      this.CheckSaveConditionsAndSave();
      return;
    }

    if (this.kbS.IsCurrentNavigatable(this.dbDataTable) && !!this.dbDataTable.GetEditedRow()) {
      switch (event.key) {
        case this.KeySetting[Actions.EscapeEditor1].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          event.preventDefault();
          this.dbDataTable.GetEditedRow()?.data.Restore('invoiceNumber');
          return;
        }
        case KeyBindings.F11: {
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
          break
        }
      }
    } else {
      switch (event.key) {
        case KeyBindings.F11: {
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
          break
        }
      }
    }
    this.HandleKeyDown(event);
  }

  public override HandleKeyDown(event: Event | TableKeyDownEvent, isForm: boolean = false): void {
    if (isTableKeyDownEvent(event)) {
      let _event = event.Event;
      switch (_event.key) {
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
        case KeyBindings.Enter: {
          if (!this.isSaveInProgress && _event.ctrlKey && _event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
            if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
              _event.preventDefault();
              _event.stopImmediatePropagation();
              _event.stopPropagation();
              return;
            }
            this.CheckSaveConditionsAndSave();
            return;
          }
          break;
        }
      }
    }
  }

}

