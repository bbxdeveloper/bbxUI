import { AfterContentInit, AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { SelectedCell } from 'src/assets/model/navigation/SelectedCell';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CustomerService } from '../../customer/services/customer.service';
import { SelectTableDialogComponent } from '../../shared/select-table-dialog/select-table-dialog.component';

const NavMap: string[][] = [
  ['active-prod-search', 'show-all', 'show-less']
];

@Component({
  selector: 'app-customer-select-table-dialog',
  templateUrl: './customer-select-table-dialog.component.html',
  styleUrls: ['./customer-select-table-dialog.component.scss']
})
export class CustomerSelectTableDialogComponent extends SelectTableDialogComponent<Customer>
  implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked {

  get getInputParams(): GetCustomersParamListModel {
    return { SearchString: this.searchString ?? '', IsOwnData: false };
  }

  constructor(
    private toastrService: BbxToastrService,
    private cdref: ChangeDetectorRef,
    private cs: CommonService,
    dialogRef: NbDialogRef<SelectTableDialogComponent<Customer>>,
    kbS: KeyboardNavigationService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Customer>>,
    private customerService: CustomerService
  ) {
    super(dialogRef, kbS, dataSourceBuilder);

    this.Matrix = NavMap;

    this.dbDataTable = new SimpleNavigatableTable<Customer>(
      this.dataSourceBuilder, this.kbS, this.cdref, this.dbData, '', AttachDirection.DOWN, this
    );
    this.dbDataTable.InnerJumpOnEnter = true;
    this.dbDataTable.OuterJump = true;
  }

  override ngOnInit(): void {
    this.Refresh();
  }
  ngAfterContentInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.kbS.SelectFirstTile();
  }
  ngAfterViewChecked(): void {
    $('#active-prod-search').val(this.searchString);
    this.kbS.SelectCurrentElement();
  }
  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }

  RefreshTable(): void {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataSource,
      this.allColumns,
      this.colDefs,
      [],
      'TABLE-CELL'
    );
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(this.DownNeighbour === undefined);
    }, 200);
  }

  override Refresh(params?: GetCustomersParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.customerService.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetCustomers response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataSource.setData(this.dbData);
          }
          this.RefreshTable();
        } else {
          this.toastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
      },
      error: (err) => {
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  override Search(searchString: string): void {
    this.Refresh(this.getInputParams);
  }

  HandleItemChoice(item: SelectedCell): void {

  }

}
