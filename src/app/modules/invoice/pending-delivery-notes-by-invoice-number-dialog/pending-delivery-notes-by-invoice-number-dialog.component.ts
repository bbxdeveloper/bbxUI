import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { SelectTableDialogComponent } from '../../shared/select-table-dialog/select-table-dialog.component';
import { PendingDeliveryNote } from '../models/PendingDeliveryNote';

@Component({
  selector: 'app-pending-delivery-notes-by-invoice-number-dialog',
  templateUrl: './pending-delivery-notes-by-invoice-number-dialog.component.html',
  styleUrls: ['./pending-delivery-notes-by-invoice-number-dialog.component.scss']
})
export class PendingDeliveryNotesByInvoiceNumberDialogComponent extends SelectTableDialogComponent<PendingDeliveryNote> implements OnInit {
  @Input()
  public invoices: PendingDeliveryNote[] = []

  public isLoaded = false

  constructor(
    dialogRef: NbDialogRef<PendingDeliveryNotesByInvoiceNumberDialogComponent>,
    private readonly kns: KeyboardNavigationService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<PendingDeliveryNote>>,
    cdref: ChangeDetectorRef
  ) {
    super(dialogRef, kns, dataSourceBuilder)
    const navMap: string[][] = [[]];
    this.Matrix = navMap

    this.dbDataTable = new SimpleNavigatableTable<PendingDeliveryNote>(dataSourceBuilder, kns, cdref, this.dbData, '', AttachDirection.DOWN, this)
  }

  public override ngOnInit(): void {
    this.dbData = this.invoices.map(x => ({ data: x, uid: this.nextUid() }))

    this.dbDataSource.setData(this.dbData)

    this.refreshTable()
  }

  public ngAfterContentInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.kbS.SelectFirstTile();
  }

  public ngAfterViewChecked(): void {
    if (!this.isLoaded) {
      $('#active-prod-search').val(this.searchString);
      this.isLoaded = true;
    }
    this.kbS.SelectCurrentElement();
  }

  public ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }

  public GetDateString(val: string): string {
    return HelperFunctions.GetDateStringFromDate(val)
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
  override selectRow(event: any, row: TreeGridNode<PendingDeliveryNote>): void {
    HelperFunctions.StopEvent(event)

    this.close(row.data)
  }
}
