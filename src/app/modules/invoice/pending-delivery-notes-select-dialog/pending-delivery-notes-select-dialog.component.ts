import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { SelectTableDialogComponent } from '../../shared/select-table-dialog/select-table-dialog.component';
import { InvoiceService } from '../services/invoice.service';
import { PendingDeliveryInvoiceSummary } from '../models/PendingDeliveriInvoiceSummary'
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { CommonService } from 'src/app/services/common.service';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { PendingDeliveryNote } from '../models/PendingDeliveryNote';
import { KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-pending-delivery-notes-select-dialog',
  templateUrl: './pending-delivery-notes-select-dialog.component.html',
  styleUrls: ['./pending-delivery-notes-select-dialog.component.scss']
})
export class PendingDeliveryNotesSelectDialogComponent extends SelectTableDialogComponent<PendingDeliveryNote> implements OnInit {
  @Input() public customerID!: number
  @Output() public selectedNotes = new EventEmitter<PendingDeliveryNote[]>()

  public isLoaded = false
  public override isLoading = false

  constructor(
    private readonly kns: KeyboardNavigationService,
    dialogRef: NbDialogRef<PendingDeliveryNotesSelectDialogComponent>,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<PendingDeliveryNote>>,
    private readonly invoiceService: InvoiceService,
    private readonly cs: CommonService,
    private readonly cdref: ChangeDetectorRef,
  ) {
    super(dialogRef, kns, dataSourceBuilder)
    const navMap: string[][] = [[]];
    this.Matrix = navMap

    this.dbDataTable = new SimpleNavigatableTable<PendingDeliveryNote>(dataSourceBuilder, kns, cdref, this.dbData, '', AttachDirection.DOWN, this)
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
      warehouseCode: '001',
      incoming: false,
      customerID: this.customerID
    }

    try {
      const data = await this.invoiceService.GetPendingDeliveryNotes(request)

      this.dbData = data.map(x => ({ data: x, uid: this.nextUid() }))
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

  @HostListener('keydown.f7', ['$event'])
  public sendNotesToParent(event: KeyboardEvent) {
    event.preventDefault()

    this.selectedNotes.emit(this.dbData.map(x => x.data))

    this.close()
  }

  @HostListener('keydown.enter', ['$event'])
  public sendNoteToParent(event: KeyboardEvent) {
    event.preventDefault()

    this.selectedNotes.emit([ this.selectedRow ])
  }
}
