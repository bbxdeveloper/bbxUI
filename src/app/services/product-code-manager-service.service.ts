import { EventEmitter, Injectable } from '@angular/core';
import { KeyboardModes, KeyboardNavigationService } from './keyboard-navigation.service';
import { LoggerService } from './logger.service';
import { Observable, of } from 'rxjs';
import { StatusService } from './status.service';
import { InvoiceItemsDialogTableSettings, PendingDeliveryNotesTableSettings, PendingDeliveryNotesTableWithWorkNumberSettings, ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { ProductSelectTableDialogComponent } from '../modules/shared/dialogs/product-select-table-dialog/product-select-table-dialog.component';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { InvoiceLine } from '../modules/invoice/models/InvoiceLine';
import { GetProductByCodeRequest } from '../modules/product/models/GetProductByCodeRequest';
import { selectProcutCodeInTableInput } from '../modules/shared/inline-editable-table/inline-editable-table.component';
import { ProductService } from '../modules/product/services/product.service';
import { BbxToastrService } from './bbx-toastr-service.service';
import { CommonService } from './common.service';
import { PendingDeliveryNoteItem } from '../modules/invoice/models/PendingDeliveryNoteItem';
import { PendingDeliveryNotesSelectDialogComponent } from '../modules/invoice/pending-delivery-notes-select-dialog/pending-delivery-notes-select-dialog.component';
import { OutGoingInvoiceFullData } from '../modules/invoice/models/CreateOutgoingInvoiceRequest';
import { InvoiceBehaviorMode } from '../modules/invoice/models/InvoiceBehaviorMode';
import { InvoiceItemsDialogComponent } from '../modules/invoice/invoice-items-dialog/invoice-items-dialog.component';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { CurrencyCode, CurrencyCodes } from '../modules/system/models/CurrencyCode';
import { CreateOfferRequest } from '../modules/offer/models/CreateOfferRequest';
import { Offer } from '../modules/offer/models/Offer';
import { FormGroup } from '@angular/forms';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

//#region Exports

export interface ChooseProductRequest<T = any, Item = any> {
  dbDataTable: InlineEditableNavigatableTable<any>
  dbData?: TreeGridNode<Item>[]
  rowIndex: number
  wasInNavigationMode: boolean
  /**
   * Primary data associated with the page, eg. OutGoingInvoiceFullData for Invoice pages
   */
  data: T
  path: string
}

export interface ChooseSummaryInvoiceProductRequest extends ChooseProductRequest<OutGoingInvoiceFullData, InvoiceLine> {
  fillTableWithDataCallback: any
  originalCustomerID: number
  showWorkNumber?: boolean
  mode: InvoiceBehaviorMode
}

export interface ChooseCreateOfferProductRequest extends ChooseProductRequest<CreateOfferRequest> {
  SelectedCurrency?: CurrencyCode
  buyerForm: FormGroup
}

export interface ChooseEditOfferProductRequest extends ChooseProductRequest<Offer> {
  SelectedCurrency?: CurrencyCode
}

export interface CodeFieldChangeRequest {
  dbDataTable: InlineEditableNavigatableTable<any>
  productToGridProductConversionCallback: any

  changedData: any
  index: number
  row: TreeGridNode<InvoiceLine>
  rowPos: number,
  objectKey: string
  colPos: number
  inputId: string
  fInputType?: string
  /**
   * Eg. RecalcNetAndVat
   */
  onComplete?: any
  path: string
}

//#endregion Exports

@Injectable({
  providedIn: 'root'
})
export class ProductCodeManagerServiceService {
  constructor(private dialogService: BbxDialogServiceService,
              private loggerService: LoggerService,
              private keyboardService: KeyboardNavigationService,
              private statusService: StatusService,
              private productService: ProductService,
              private bbxToastrService: BbxToastrService,
              private commonService: CommonService
              ) {

  }

  //#region ChooseDataForTableRow

  ChooseDataForTableRow(request: any): Observable<any> {
    switch (request.path) {
      case 'invoice':
      case 'invoice-income':
      case 'receipt':
      case 'incoming-delivery-note-income':
      case 'outgoing-delivery-note-income':
        return this.ChooseDataForGeneralTableRow(request)
      case 'price-review':
        break
      case 'incoming-correction-invoice':
      case 'correction-invoice':
        return this.ChooseDataForCorrectionInvoiceTableRow(request)
      case 'summary-invoice':
      case 'incoming-summary-invoice':
      case 'minus-delivery-note':
      case 'minus-incoming-delivery-note':
        return this.ChooseDataForSummaryInvoiceTableRow(request)
        case 'offers-edit':
        return this.ChooseDataForEditOfferTableRow(request)
      case 'offers-create':
        return this.ChooseDataForCreateOfferTableRow(request)
      default:
        throw new Error('Unsupported mode based on path: ' + request.path)
    }
    return of(true)
  }

  private ChooseDataForGeneralTableRow(request: ChooseProductRequest | any): Observable<any> {
    this.loggerService.info("Selecting InvoiceLine from avaiable data.")

    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: request.dbDataTable.editedRow?.data.productCode ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
        exchangeRate: request.data.exchangeRate ?? 1
      }
    })
    return dialogRef.onClose
  }

  private ChooseDataForSummaryInvoiceTableRow(request: ChooseSummaryInvoiceProductRequest): Observable<any> {
    console.log("Selecting InvoiceLine from avaiable data.")

    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)

    const event = new EventEmitter<PendingDeliveryNoteItem[]>()

    event.subscribe(request.fillTableWithDataCallback)

    const checkedNotes = request.dbData!.map((x: any) => {
      const data = {
        relDeliveryNoteInvoiceLineID: x.data.relDeliveryNoteInvoiceLineID,
        quantity: x.data.quantity
      } as PendingDeliveryNoteItem
      return data
    })

    this.dialogService.open(PendingDeliveryNotesSelectDialogComponent, {
      context: {
        allColumns: request.showWorkNumber ? PendingDeliveryNotesTableWithWorkNumberSettings.AllColumns : PendingDeliveryNotesTableSettings.AllColumns,
        colDefs: request.showWorkNumber ? PendingDeliveryNotesTableWithWorkNumberSettings.ColDefs : PendingDeliveryNotesTableSettings.ColDefs,
        checkedNotes: checkedNotes,
        customerID: request.originalCustomerID,
        selectedNotes: event,
        mode: request.mode,
        cssClass: request.showWorkNumber ? 'pending-deliveri-notes-select-wide' : 'pending-deliveri-notes-select-normal'
      }
    });

    return of(true)
  }

  private ChooseDataForCorrectionInvoiceTableRow(request: ChooseSummaryInvoiceProductRequest): Observable<any> {
    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)

    const event = new EventEmitter<InvoiceLine[]>(false)

    event.subscribe(request.fillTableWithDataCallback.bind(this))

    this.dialogService.open(InvoiceItemsDialogComponent, {
      context: {
        invoiceId: request.data.originalInvoiceID,
        checkedLineItems: request.dbData?.map(x => x.data) ?? [],
        allColumns: InvoiceItemsDialogTableSettings.AllColumns,
        colDefs: InvoiceItemsDialogTableSettings.ColDefs,
        selectedItemsChanged: event
      }
    })

    return of(true)
  }

  private ChooseDataForCreateOfferTableRow(request: ChooseCreateOfferProductRequest): Observable<any> {
    console.log("Selecting InvoiceLine from avaiable data.")

    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)

    request.data.exchangeRate = HelperFunctions.ToFloat(request.buyerForm.controls['exchangeRate'].value ?? 1)

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: request.dbDataTable.editedRow?.data.productCode ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
        exchangeRate: request.data.exchangeRate,
        currency: request.SelectedCurrency?.value ?? CurrencyCodes.HUF
      }
    })

    return dialogRef.onClose
  }

  private ChooseDataForEditOfferTableRow(request: ChooseEditOfferProductRequest): Observable<any> {
    console.log("Selecting InvoiceLine from avaiable data.")

    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: request.dbDataTable.editedRow?.data.productCode ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
        exchangeRate: request.data.exchangeRate,
        currency: request.SelectedCurrency?.value ?? CurrencyCodes.HUF
      }
    })

    return dialogRef.onClose
  }

  //#endregion ChooseDataForTableRow

  //#region TableCodeFieldChanged

  TableCodeFieldChanged(request: any): void {
        switch (request.path) {
      // Receipt, Invoice, InvoiceIncome komponensek
      case 'invoice':
      case 'invoice-income':
      case 'receipt':
      case 'incoming-delivery-note-income':
      case 'outgoing-delivery-note-income':
        this.GeneralTableCodeFieldChanged(request)
        break

      // PriceReview komponens
      case 'price-review':
        // Nincs TableCodeFieldChanged függvény.
        break

      // CorrectionInvoice komponens
      case 'incoming-correction-invoice':
      case 'correction-invoice':
        // Nincs TableCodeFieldChanged függvény.
        break

      // SummaryInvoice komponens
      case 'summary-invoice':
      case 'incoming-summary-invoice':
      case 'minus-delivery-note':
        this.SummaryInvoiceTableCodeFieldChanged(request)
        break

      // Offer komponensek
      case 'offers-create':
      case 'offers-edit':
        /**
         * Ez már eleve közös ősosztályban szerepel, Create és Edit eset egységesen van kezelve.
         * @see BaseOfferEditorComponent.TableCodeFieldChanged
         */
        break
      default:
        throw new Error('Unsupported mode based on path: ' + request.path)
    }
  }

  private MoveNextFromCodeField(request: CodeFieldChangeRequest): void {
    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);
    request.dbDataTable.MoveNextInTable();
    setTimeout(() => {
      this.keyboardService.setEditMode(KeyboardModes.EDIT);
      this.keyboardService.ClickCurrentElement();
    }, 200);
  }

  private GeneralTableCodeFieldChanged(request: CodeFieldChangeRequest): void {
    if (!request.dbDataTable.data[request.rowPos].data.Changed('productCode', true)) {
      this.MoveNextFromCodeField(request)
      return
    }
    if (!!request.changedData && !!request.changedData.productCode && request.changedData.productCode.length > 0) {
      this.statusService.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING])
      this.productService.GetProductByCode({ ProductCode: request.changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: async product => {
          console.log('[TableRowDataChanged]: ', request.changedData, ' | Product: ', product)

          if (!!product && !!product?.productCode) {
            let currentRow = request.dbDataTable.FillCurrentlyEditedRow({ data: await request.productToGridProductConversionCallback(product) }, ['productCode'])
            currentRow?.data.Save('productCode')
            this.MoveNextFromCodeField(request)
          } else {
            this.keyboardService.ClickCurrentElement()
            selectProcutCodeInTableInput()
            this.bbxToastrService.showError(Constants.MSG_NO_PRODUCT_FOUND)
          }
        },
        error: err => {
          this.commonService.HandleError(err)
        },
        complete: () => {
          if (request.onComplete) {
            request.onComplete()
          }
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus)
        }
      })
    }
  }

  private SummaryInvoiceTableCodeFieldChanged(request: CodeFieldChangeRequest): void {
    if (!request.dbDataTable.data[request.rowPos].data.Changed('productCode', true)) {
      this.MoveNextFromCodeField(request)
      return
    }
    if (!!request.changedData && !!request.changedData.productCode && request.changedData.productCode.length > 0) {
      this.statusService.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
      this.productService.GetProductByCode({ ProductCode: request.changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: async product => {
          console.log('[TableRowDataChanged]: ', request.changedData, ' | Product: ', product);

          if (!!product && !!product?.productCode) {
            let currentRow = request.dbDataTable.FillCurrentlyEditedRow({ data: await request.productToGridProductConversionCallback(product) }, ['productCode']);
            currentRow?.data.Save('productCode');
            this.MoveNextFromCodeField(request)
          } else {
            request.dbDataTable.data[request.rowPos].data.Restore('productCode');
            this.bbxToastrService.show(
              Constants.MSG_NO_PRODUCT_FOUND,
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
          }
        },
        error: err => {
          request.dbDataTable.data[request.rowPos].data.Restore('productCode');
          this.commonService.HandleError(err);
        },
        complete: () => {
          if (request.onComplete) {
            request.onComplete()
          }
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
        }
      });
    }
  }

  //#endregion TableCodeFieldChanged
}
