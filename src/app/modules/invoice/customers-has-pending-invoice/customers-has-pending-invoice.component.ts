import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SelectTableDialogComponent } from '../../shared/select-table-dialog/select-table-dialog.component';
import { InvoiceService } from '../services/invoice.service';
import { PendingDeliveryInvoiceSummary } from '../models/PendingDeliveriInvoiceSummary'
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { CommonService } from 'src/app/services/common.service';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';

@Component({
  selector: 'app-customers-has-pending-invoice',
  templateUrl: './customers-has-pending-invoice.component.html',
  styleUrls: ['./customers-has-pending-invoice.component.scss']
})
export class CustomersHasPendingInvoiceComponent extends SelectTableDialogComponent<PendingDeliveryInvoiceSummary> implements OnInit {

  public isLoaded = false
  public override isLoading = false

  constructor(
    kns: KeyboardNavigationService,
    dialogRef: NbDialogRef<CustomersHasPendingInvoiceComponent>,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<PendingDeliveryInvoiceSummary>>,
    private readonly invoiceService: InvoiceService,
    private readonly cs: CommonService,
    private readonly cdref: ChangeDetectorRef,
  ) {
    super(dialogRef, kns, dataSourceBuilder)
    const navMap: string[][] = [
      ['active-prod-search', 'show-all', 'show-less']
    ];
    this.Matrix = navMap

    this.dbDataTable = new SimpleNavigatableTable<PendingDeliveryInvoiceSummary>(dataSourceBuilder, kns, cdref, this.dbData, '', AttachDirection.DOWN, this)

    this.dbDataTable.InnerJumpOnEnter = true;
    this.dbDataTable.OuterJump = true;
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

  public override Refresh(): void {
    this.isLoading = true
    const request = {
      currencyCode: 'HUF',
      warehouseCode: '001',
      incoming: false
    }
    this.invoiceService.GetPendingDeliveriInvoices(request)
      .subscribe({
        next: data => {
          if (!data) {
            console.error('missing data')
          }

          this.dbData = data.map(x => ({ data: x, uid: this.nextUid() }))
          this.dbDataSource.setData(this.dbData)

          this.refreshTable()
        },
        error: (err: any) => {
          this.cs.HandleError(err)
          this.isLoading = false
        },
        complete: () => this.isLoading = false
      })
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
    }, 200);
  }
}
