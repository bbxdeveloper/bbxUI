import { NbDialogService } from "@nebular/theme";
import { Product } from "src/app/modules/product/models/Product";
import { KeyboardModes, KeyboardNavigationService } from "src/app/services/keyboard-navigation.service";
import { LoggerService } from "src/app/services/logger.service";
import { ProductDialogTableSettings } from "src/assets/model/TableSettings";
import { InlineEditableNavigatableTable } from "src/assets/model/navigation/InlineEditableNavigatableTable";
import { ProductSelectTableDialogComponent } from "../../dialogs/product-select-table-dialog/product-select-table-dialog.component";
import { OutGoingInvoiceFullData } from "src/app/modules/invoice/models/CreateOutgoingInvoiceRequest";
import { ProductCodeManagerServiceService } from "src/app/services/product-code-manager-service.service";
import { InvoiceTypes } from "src/app/modules/invoice/models/InvoiceTypes";
import { StatusService } from "src/app/services/status.service";
import { of } from "rxjs";
import { Constants } from "src/assets/util/Constants";

export module BbxProductCodeInputModule {
    export interface ChooseProductRequest {
        dbDataTable: InlineEditableNavigatableTable<any>
        rowIndex: number
        wasInNavigationMode: boolean
    }

    export interface ChooseReceiptProductRequest extends ChooseProductRequest {
        handleProductChooseOverrideCallback: any
        outGoingInvoiceData: OutGoingInvoiceFullData
        productToInvoiceLine: any
    }

    /**
     * Extended @see InvoiceTypes
     */
    export enum ProductManagerType {
        /** not defined */
        NOT_DEFINED = "NOT_DEFINED",
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

    export class ProductManagerFactory {
        static Create(
            // Type
            type: ProductManagerType,
            // Services
            dialogService: NbDialogService,
            loggerService: LoggerService,
            keyboardService: KeyboardNavigationService,
            productCodeManagerService: ProductCodeManagerServiceService,
            statusService: StatusService): ProductManager {
            switch (type) {
                case ProductManagerType.BLK:
                default:
                    return new ReceiptProductManager(dialogService, loggerService, keyboardService, productCodeManagerService, statusService)
            }
        }
    }

    export abstract class ProductManager {
        constructor(protected dialogService: NbDialogService,
                    protected loggerService: LoggerService,
                    protected keyboardService: KeyboardNavigationService,
                    protected productCodeManagerService: ProductCodeManagerServiceService,
                    protected statusService: StatusService) {
            // this.productCodeManagerService.chooseProductTrigger.subscribe({
            //     next: request => this.ProcessChooseProductRequest(request)
            // })
        }

        public ProcessChooseProductRequest(request: any): void {}
    }

    export class ReceiptProductManager extends ProductManager {
        constructor(dialogService: NbDialogService,
                    loggerService: LoggerService,
                    keyboardService: KeyboardNavigationService,
                    productCodeManagerService: ProductCodeManagerServiceService,
                    statusService: StatusService) {
            super(dialogService, loggerService, keyboardService, productCodeManagerService, statusService)
        }

        public override ProcessChooseProductRequest(request: any): void {
            this.loggerService.info("Selecting InvoiceLine from avaiable data.");

            this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);

            const dialogRef = this.dialogService.open(ProductSelectTableDialogComponent, {
                context: {
                    searchString: request.dbDataTable.editedRow?.data.productCode ?? '',
                    allColumns: ProductDialogTableSettings.ProductSelectorDialogAllColumns,
                    colDefs: ProductDialogTableSettings.ProductSelectorDialogColDefs,
                    exchangeRate: request.outGoingInvoiceData.exchangeRate ?? 1
                }
            });
            dialogRef.onClose.subscribe(async (res: Product) => {
                this.loggerService.info("Selected item: " + res);
                if (request.handleProductChooseOverrideCallback) {
                    await request.handleProductChooseOverrideCallback(res, request.wasInNavigationMode);
                } else {
                    await this.HandleProductChoose(res, request.wasInNavigationMode, request);
                }
            });
        }

        async HandleProductChoose(res: Product, wasInNavigationMode: boolean, request: any): Promise<void> {
            if (!!res) {
                this.statusService.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);

                if (!wasInNavigationMode) {
                    let currentRow = request.dbDataTable.FillCurrentlyEditedRow({ data: await request.productToInvoiceLine(res) });
                    currentRow?.data.Save('productCode');

                    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);

                    request.dbDataTable.MoveNextInTable();

                    setTimeout(() => {
                        this.keyboardService.setEditMode(KeyboardModes.EDIT);
                        this.keyboardService.ClickCurrentElement();
                    }, 200);
                } else {
                    const index = request.dbDataTable.data.findIndex((x: any) => x.data.productCode === res.productCode);
                    if (index !== -1) {
                        this.keyboardService.SelectElementByCoordinate(0, index);
                    }
                }
            }
            else if (!wasInNavigationMode) {
                setTimeout(() => {
                    this.keyboardService.setEditMode(KeyboardModes.EDIT)
                    this.keyboardService.ClickCurrentElement()
                }, 200)
            }

            this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
            return of().toPromise();
        }
    }
}