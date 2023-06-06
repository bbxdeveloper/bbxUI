import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { SelectTableDialogComponent } from '../../shared/select-table-dialog/select-table-dialog.component';
import { InvoiceService } from '../services/invoice.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { NbDialogRef, NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { CommonService } from 'src/app/services/common.service';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { PendingDeliveryNoteItem } from '../models/PendingDeliveryNoteItem';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PendingDeliveryNotesByInvoiceNumberDialogComponent } from '../pending-delivery-notes-by-invoice-number-dialog/pending-delivery-notes-by-invoice-number-dialog.component';
import { PendingDeliveryNotesByInvoiceNumberTableSettings } from 'src/assets/model/TableSettings';
import { SummaryInvoiceMode } from '../models/SummaryInvoiceMode';
import { TokenStorageService } from '../../auth/services/token-storage.service';

@Component({
  selector: 'app-pending-delivery-notes-select-dialog',
  templateUrl: './pending-delivery-notes-select-dialog.component.html',
  styleUrls: ['./pending-delivery-notes-select-dialog.component.scss']
})
export class PendingDeliveryNotesSelectDialogComponent extends SelectTableDialogComponent<PendingDeliveryNoteItem> implements OnInit {
  @Input() public customerID!: number
  @Input() public checkedNotes!: PendingDeliveryNoteItem[]
  @Output() public selectedNotes = new EventEmitter<PendingDeliveryNoteItem[]>()
  @Input() public mode!: SummaryInvoiceMode

  public isLoaded = false
  public override isLoading = false

  constructor(
    private readonly kns: KeyboardNavigationService,
    dialogRef: NbDialogRef<PendingDeliveryNotesSelectDialogComponent>,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<PendingDeliveryNoteItem>>,
    private readonly invoiceService: InvoiceService,
    private readonly cs: CommonService,
    cdref: ChangeDetectorRef,
    private readonly dialogService: NbDialogService,
    private readonly tokenService: TokenStorageService,
  ) {
    super(dialogRef, kns, dataSourceBuilder)
    const navMap: string[][] = [[]];
    this.Matrix = navMap

    this.dbDataTable = new SimpleNavigatableTable<PendingDeliveryNoteItem>(dataSourceBuilder, kns, cdref, this.dbData, '', AttachDirection.DOWN, this)
  }

  public override ngOnInit(): void {
    this.Refresh()
  }

  ngAfterContentInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.kbS.SelectFirstTile();
  }

  ngAfterViewChecked(): void {
    if (!this.isLoaded) {
      $('#active-prod-search').val(this.searchString);
      this.isLoaded = true;
    }
    this.kbS.SelectCurrentElement();
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }

  public override async Refresh(): Promise<void> {
    this.isLoading = true
    const request = {
      currencyCode: 'HUF',
      warehouseCode: this.tokenService.wareHouse?.warehouseCode ?? '',
      incoming: this.mode.incoming,
      customerID: this.customerID
    }

    try {
      let data = await this.invoiceService.GetPendingDeliveryNotesItems(request)

      data.forEach(datum => {
        const checkedNote = this.checkedNotes.find(note => note.relDeliveryNoteInvoiceLineID === datum.relDeliveryNoteInvoiceLineID)

        if (checkedNote) {
          if (this.mode.isSummaryInvoice) {
            datum.quantity -= checkedNote.quantity
          }
          else {
            datum.quantity += checkedNote.quantity
          }
        }

        return datum
      })

      this.dbData = data.filter(datum => datum.quantity > 0)
        .map(x => ({ data: x, uid: this.nextUid() }))

      this.dbDataSource.setData(this.dbData)

      this.refreshTable()
      this.isLoading = false
    }
    catch (error) {
      this.cs.HandleError(error)
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
      this.kns.SetCurrentNavigatable(this.dbDataTable)
    }, 200);
  }

  /**
   * Enter esetén ez hívódik meg, a "@HostListener('keydown.enter', ['$event'])"
   * nem működne.
   * @param event
   * @param row
   */
  override selectRow(event: any, row: TreeGridNode<PendingDeliveryNoteItem>): void {
    HelperFunctions.StopEvent(event);

    this.close({} as PendingDeliveryNoteItem);

    this.selectedNotes.emit([row.data])
  }

  public GetDateString(val: string): string {
    return HelperFunctions.GetDateStringFromDate(val)
  }

  @HostListener('keydown.f7', ['$event'])
  public sendNotesToParent(event: KeyboardEvent) {
    HelperFunctions.StopEvent(event);

    this.selectedNotes.emit(this.dbData.map(x => x.data))

    this.close()
  }

  @HostListener('keydown.f6', ['$event'])
  public notesByInvoiceNumber(event: KeyboardEvent) {
    HelperFunctions.StopEvent(event)

    this.close()

    const invoices = this.dbData.map(x => x.data).filter(
      (thing, i, arr) => arr.findIndex(t => t.invoiceNumber === thing.invoiceNumber) === i
    );

    const dialog = this.dialogService.open(PendingDeliveryNotesByInvoiceNumberDialogComponent, {
      context: {
        allColumns: PendingDeliveryNotesByInvoiceNumberTableSettings.AllColumns,
        colDefs: PendingDeliveryNotesByInvoiceNumberTableSettings.ColDefs,
        invoices: invoices
      }
    })

    dialog.onClose.subscribe((selected: PendingDeliveryNoteItem) => {
      const notes = this.dbData
        .filter(x => x.data.invoiceNumber === selected.invoiceNumber)
        .map(x => x.data)

      this.selectedNotes.emit(notes)
    })
  }
}
