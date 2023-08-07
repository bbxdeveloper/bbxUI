import { ChangeDetectorRef, Component, HostListener, Input, OnInit } from '@angular/core';
import { SelectTableDialogComponent } from '../../shared/dialogs/select-table-dialog/select-table-dialog.component';
import { InvoiceService } from '../services/invoice.service';
import { PendingDeliveryInvoiceSummary } from '../models/PendingDeliveriInvoiceSummary'
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { CommonService } from 'src/app/services/common.service';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { IPartnerLock } from 'src/app/services/IPartnerLock';

@Component({
  selector: 'app-customers-has-pending-invoice',
  templateUrl: './customers-has-pending-invoice.component.html',
  styleUrls: ['./customers-has-pending-invoice.component.scss']
})
export class CustomersHasPendingInvoiceComponent extends SelectTableDialogComponent<PendingDeliveryInvoiceSummary> implements OnInit {
  @Input() public customerID!: number
  @Input() public incoming: boolean = false
  @Input() public partnerLock: IPartnerLock|undefined

  public isLoaded = false
  public override isLoading = false

  constructor(
    private readonly kns: KeyboardNavigationService,
    dialogRef: NbDialogRef<CustomersHasPendingInvoiceComponent>,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<PendingDeliveryInvoiceSummary>>,
    private readonly invoiceService: InvoiceService,
    private readonly cs: CommonService,
    private readonly tokenService: TokenStorageService,
    cdref: ChangeDetectorRef,
    private router: Router,
  ) {
    super(dialogRef, kns, dataSourceBuilder)
    const navMap: string[][] = [[]];
    this.Matrix = navMap

    this.dbDataTable = new SimpleNavigatableTable<PendingDeliveryInvoiceSummary>(dataSourceBuilder, kns, cdref, this.dbData, '', AttachDirection.DOWN, this)
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
      incoming: this.incoming
    }

    try {
      const data = await this.invoiceService.GetPendingDeliveryInvoices(request)

      if (!data) {
        console.error('missing data')
      }

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

  backToHeader(): void {
    this.kbS.RemoveWidgetNavigatable();
    this.router.navigate(["home"])
    setTimeout(() => {
      this.kbS.setEditMode(KeyboardModes.NAVIGATION)
      this.kbS.ResetToRoot()
      this.kbS.SetPositionById("header-income")
      this.kbS.SelectCurrentElement()
    }, 700);
  }

  override async selectRow(event: any, row: TreeGridNode<PendingDeliveryInvoiceSummary>): Promise<void> {
    if (!!event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const canClose = await this.canClose(row)

    if (canClose) {
      this.close(row.data);
    }
  }

  private async canClose(row: TreeGridNode<PendingDeliveryInvoiceSummary>): Promise<boolean> {
    if (!this.partnerLock) {
      return true
    }

    const result = await this.partnerLock.lockCustomer(row.data.customerID) as any

    return result?.succeeded
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.key == KeyBindings.exit || event.key == KeyBindings.exitIE) {
      this.backToHeader();
    }
  }

  HandleGridMovement(event: KeyboardEvent, row: TreeGridNode<PendingDeliveryInvoiceSummary>, rowPos: number, col: string, colPos: number, upward: boolean): void {
    if (event.key == KeyBindings.exit || event.key == KeyBindings.exitIE) {
      this.backToHeader();
    } else {
      this.dbDataTable.HandleGridMovement(event, row, rowPos, col, colPos, true);
    }
  }
}
