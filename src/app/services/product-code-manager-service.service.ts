import { Injectable } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from './keyboard-navigation.service';
import { LoggerService } from './logger.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { StatusService } from './status.service';
import { ProductDialogTableSettings } from 'src/assets/model/TableSettings';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { OutGoingInvoiceFullData } from '../modules/invoice/models/CreateOutgoingInvoiceRequest';
import { Product } from '../modules/product/models/Product';
import { ProductSelectTableDialogComponent } from '../modules/shared/dialogs/product-select-table-dialog/product-select-table-dialog.component';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { InvoiceLine } from '../modules/invoice/models/InvoiceLine';
import { GetProductByCodeRequest } from '../modules/product/models/GetProductByCodeRequest';
import { selectProcutCodeInTableInput } from '../modules/shared/inline-editable-table/inline-editable-table.component';
import { ProductService } from '../modules/product/services/product.service';
import { BbxToastrService } from './bbx-toastr-service.service';
import { CommonService } from './common.service';

export interface ChooseProductRequest<T = any> {
  type?: ProductManagerType
  dbDataTable: InlineEditableNavigatableTable<any>
  rowIndex: number
  wasInNavigationMode: boolean
  /**
   * Primary data associated with the page, eg. OutGoingInvoiceFullData for Invoice pages
   */
  data: T
}

export interface CodeFieldChangeRequest {
  type?: ProductManagerType
  dbDataTable: InlineEditableNavigatableTable<any>
  productToGridProductConversionCallback: any
  
  changedData: any
  index: number
  row: TreeGridNode<InvoiceLine>
  // rowPos: number, -> ChooseProductRequest.rowIndex
  objectKey: string
  colPos: number
  inputId: string
  fInputType?: string
  /**
   * Eg. RecalcNetAndVat
   */
  onComplete?: any
}

/**
 * Extended @see InvoiceTypes for supporting offer and other use cases
 */
export enum ProductManagerType {
  /** not defined */
  GENERAL = "GENERAL",
  /** incoming invoice */
  INC = "INC",
  /** incoming delivery */
  DNI = "DNI",
  /** outgoing invoice */
  INV = "INV",
  /** outgoing delivery */
  DNO = "DNO",
  /** receipt */
  BLK = "BLK",
  /** offer */
  offer = "offer"
}

@Injectable({
  providedIn: 'root'
})
export class ProductCodeManagerServiceService {
  constructor(private dialogService: NbDialogService,
              private loggerService: LoggerService,
              private keyboardService: KeyboardNavigationService,
              private statusService: StatusService,
              private productService: ProductService,
              private bbxToastrService: BbxToastrService,
              private commonService: CommonService
              ) {

  }

  ChooseDataForTableRow(request: ChooseProductRequest | any): Observable<any> {
    request.type = request.type === undefined ? ProductManagerType.GENERAL : request.type
    switch (request.type as ProductManagerType) {
      case ProductManagerType.GENERAL:
      case ProductManagerType.INC:
      case ProductManagerType.DNI:
      case ProductManagerType.INV:
      case ProductManagerType.DNO:
      case ProductManagerType.BLK:
      default:
        return this.ChooseDataForGeneralTableRow(request)
    }
  }

  TableCodeFieldChanged(request: CodeFieldChangeRequest | any): void {
    request.type = request.type === undefined ? ProductManagerType.GENERAL : request.type
    switch (request.type as ProductManagerType) {
      case ProductManagerType.GENERAL:
      case ProductManagerType.INC:
      case ProductManagerType.DNI:
      case ProductManagerType.INV:
      case ProductManagerType.DNO:
      case ProductManagerType.BLK:
      default:
        this.GeneralTableCodeFieldChanged(request)
    }
  }
  
  private ChooseDataForGeneralTableRow(request: ChooseProductRequest | any): Observable<any> {
    this.loggerService.info("Selecting InvoiceLine from avaiable data.");

    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
      context: {
        searchString: request.dbDataTable.editedRow?.data.productCode ?? '',
        allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
        colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
        exchangeRate: request.data.exchangeRate ?? 1
      }
    });
    return dialogRef.onClose
  }

  private GeneralTableCodeFieldChanged(request: CodeFieldChangeRequest): void {
    if (!!request.changedData && !!request.changedData.productCode && request.changedData.productCode.length > 0) {
      this.statusService.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING])
      this.productService.GetProductByCode({ ProductCode: request.changedData.productCode } as GetProductByCodeRequest).subscribe({
        next: async product => {
          console.log('[TableRowDataChanged]: ', request.changedData, ' | Product: ', product)

          if (!!product && !!product?.productCode) {
            let currentRow = request.dbDataTable.FillCurrentlyEditedRow({ data: await request.productToGridProductConversionCallback(product) })
            currentRow?.data.Save('productCode')
            this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)
            request.dbDataTable.MoveNextInTable()
            setTimeout(() => {
              this.keyboardService.setEditMode(KeyboardModes.EDIT)
              this.keyboardService.ClickCurrentElement()
            }, 200)
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
}
