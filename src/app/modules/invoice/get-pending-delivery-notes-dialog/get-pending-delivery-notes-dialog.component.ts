import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { SelectTableDialogComponent } from '../../shared/dialogs/select-table-dialog/select-table-dialog.component';
import { InvoiceService } from '../services/invoice.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { NbDialogRef, NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { CommonService } from 'src/app/services/common.service';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { PendingDeliveryNote } from '../models/PendingDeliveryNote';
import { Router } from '@angular/router';
import { KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-get-pending-delivery-notes-dialog',
  templateUrl: './get-pending-delivery-notes-dialog.component.html',
  styleUrls: ['./get-pending-delivery-notes-dialog.component.scss']
})
export class GetPendingDeliveryNotesDialogComponent extends SelectTableDialogComponent<PendingDeliveryNote> implements OnInit {
  public isLoaded = false
  public override isLoading = false

  constructor(
    private readonly kns: KeyboardNavigationService,
    dialogRef: NbDialogRef<GetPendingDeliveryNotesDialogComponent>,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<PendingDeliveryNote>>,
    private readonly invoiceService: InvoiceService,
    private readonly cs: CommonService,
    cdref: ChangeDetectorRef,
    private router: Router,
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

    try {
      let data = await this.invoiceService.GetPendingDeliveryNotes()

      this.dbData = data.map(x => ({ data: x, uid: this.nextUid() }))

      this.dbDataSource.setData(this.dbData)

      this.refreshTable()
    }
    catch (error) {
      this.cs.HandleError(error)
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
    HelperFunctions.StopEvent(event);

    this.close(row.data);
  }

  public GetDateString(val: string): string {
    return HelperFunctions.GetDateStringFromDate(val)
  }

  backToHeader(): void {
    this.kbS.RemoveWidgetNavigatable();
    this.router.navigate(["home"])
    setTimeout(() => {
      this.kbS.setEditMode(KeyboardModes.NAVIGATION)
      this.kbS.ResetToRoot()
      this.kbS.SetPositionById("header-invo")
      this.kbS.SelectCurrentElement()
    }, 700);
  }

  @HostListener('document:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.key == KeyBindings.exit || event.key == KeyBindings.exitIE) {
      this.backToHeader();
    }
  }
}
