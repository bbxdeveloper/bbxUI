import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { InvoiceService } from '../services/invoice.service';
import { SelectTableDialogComponent } from '../../shared/dialogs/select-table-dialog/select-table-dialog.component';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { CommonService } from 'src/app/services/common.service';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { GetInvoiceRequest } from '../models/GetInvoiceRequest';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { StatusService } from 'src/app/services/status.service';
import { CurrencyCodes } from '../../system/models/CurrencyCode';
import { InvoiceLineWithCurrency } from './InvoiceLine';
import { InvoiceLine } from '../models/InvoiceLine';


@Component({
  selector: 'app-invoice-items-dialog',
  templateUrl: './invoice-items-dialog.component.html',
  styleUrls: ['./invoice-items-dialog.component.scss']
})
export class InvoiceItemsDialogComponent extends SelectTableDialogComponent<InvoiceLineWithCurrency> implements OnInit, OnDestroy {
  @Input()
  public invoiceId = -1

  @Input()
  public checkedLineItems: InvoiceLine[] = []

  @Input()
  public currency = CurrencyCodes.HUF

  @Output()
  public selectedItemsChanged = new EventEmitter<InvoiceLine[]>(false)

  public isLoaded = false
  public override isLoading = false

  constructor(
    private readonly keyboardService: KeyboardNavigationService,
    dialogRef: NbDialogRef<InvoiceItemsDialogComponent>,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvoiceLineWithCurrency>>,
    private readonly invoiceService: InvoiceService,
    private readonly commonService: CommonService,
    cdref: ChangeDetectorRef,
    statusService: StatusService
  ) {
    super(dialogRef, keyboardService, dataSourceBuilder, statusService)
    const navMap: string[][] = [[]];
    this.Matrix = navMap

    this.dbDataTable = new SimpleNavigatableTable<InvoiceLineWithCurrency>(dataSourceBuilder, keyboardService, cdref, this.dbData, '', AttachDirection.DOWN, this)
  }

  public override ngOnInit(): void {
    this.Refresh()
  }

  public ngAfterContentInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.kbS.SelectFirstTile();
  }

  public ngAfterViewChecked(): void {
    if (!this.isLoaded) {
      $('#active-prod-search').val(this.searchString);
      this.isLoaded = true;

      setTimeout(() => this.kbS.ClickCurrentElement(), 1000)
    }
    this.kbS.SelectCurrentElement();
    if (!this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      this.kbS.SetCurrentNavigatable(this.dbDataTable)
      setTimeout(() => {
        this.kbS.SelectFirstTile()
        this.kbS.ClickCurrentElement()
        this.kbS.setEditMode(KeyboardModes.NAVIGATION)
        setTimeout(() => {
          this.kbS.SelectCurrentElement()
        }, 200);
      }, 500);
    }
  }

  public ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }

  public override async Refresh(): Promise<void> {
    try {
      this.isLoading = true

      const request = {
        id: this.invoiceId,
        fullData: true
      } as GetInvoiceRequest
      const response = await this.invoiceService.Get(request)

      response.invoiceLines.forEach(datum => {
        datum.vatRate = (datum as any).vatPercentage
        const checkedNote = this.checkedLineItems.find(x => datum.id === x.id)

        datum.limit = -datum.quantity

        if (checkedNote) {
          datum.quantity += parseInt(checkedNote.quantity.toString())
        }
      })

      this.dbData = response.invoiceLines
        .filter(x => x.quantity > 0)
        .map(x => {
          const invoiceLine = Object.assign(new InvoiceLineWithCurrency(), x)
          invoiceLine.currency = response.currencyCode as CurrencyCodes
          return invoiceLine
        })
        .map(x => ({ data: x, uid: this.nextUid() }))

      this.dbDataSource.setData(this.dbData)

      this.refreshTable()
    }
    catch (error) {
      this.commonService.HandleError(error)
    }
    finally {
      this.isLoading = false
    }
  }

  private refreshTable() {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataSource,
      this.allColumns,
      this.colDefs,
      [],
      'TABLE-CELL'
    )
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(this.DownNeighbour === undefined, false);
      this.keyboardService.SetCurrentNavigatable(this.dbDataTable)
    }, 200);
  }

  override selectRow(event: any, row: TreeGridNode<InvoiceLineWithCurrency>): void {
    HelperFunctions.StopEvent(event)

    this.close()

    this.selectedItemsChanged.emit([row.data])
  }

  @HostListener('keydown.f7', ['$event'])
  public onF7KeyDown(event: KeyboardEvent) {
    HelperFunctions.StopEvent(event)

    this.close()

    this.selectedItemsChanged.emit(this.dbData.map(x => x.data))
  }

  HandleGridMovement(event: KeyboardEvent, row: TreeGridNode<InvoiceLineWithCurrency>, rowPos: number, col: string, colPos: number, upward: boolean): void {
    this.dbDataTable.HandleGridMovement(event, row, rowPos, col, colPos, true);
  }
}
