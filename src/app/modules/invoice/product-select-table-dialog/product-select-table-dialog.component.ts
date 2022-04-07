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
import { GetProductsParamListModel } from '../../product/models/GetProductsParamListModel';
import { Product } from '../../product/models/Product';
import { ProductService } from '../../product/services/product.service';
import { SelectTableDialogComponent } from '../../shared/select-table-dialog/select-table-dialog.component';

const NavMap: string[][] = [
  ['active-prod-search', 'show-all', 'show-less']
];

@Component({
  selector: 'app-product-select-table-dialog',
  templateUrl: './product-select-table-dialog.component.html',
  styleUrls: ['./product-select-table-dialog.component.scss']
})
export class ProductSelectTableDialogComponent extends SelectTableDialogComponent<Product>
  implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked {

  get getInputParams(): GetProductsParamListModel {
    return { SearchString: this.searchString ?? '', PageSize: '10', PageNumber: '1' };
  }

  get getInputParamsForAll(): GetProductsParamListModel {
    return { SearchString: this.searchString ?? '', PageSize: '999999' };
  }

  constructor(
    private toastrService: BbxToastrService,
    private cdref: ChangeDetectorRef,
    private cs: CommonService,
    dialogRef: NbDialogRef<SelectTableDialogComponent<Product>>,
    kbS: KeyboardNavigationService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Product>>,
    private productService: ProductService
  ) {
    super(dialogRef, kbS, dataSourceBuilder);

    this.Matrix = NavMap;

    this.dbDataTable = new SimpleNavigatableTable<Product>(
      this.dataSourceBuilder, this.kbS, this.cdref, this.dbData, '', AttachDirection.DOWN, this
    );
    this.dbDataTable.InnerJumpOnEnter = true;
    this.dbDataTable.OuterJump = true;
  }

  override ngOnInit(): void {
    this.Refresh(this.getInputParams);
  }
  ngAfterContentInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.kbS.SelectFirstTile();
  }
  ngAfterViewChecked(): void {
    this.kbS.SelectCurrentElement();
  }
  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }

  override refreshFilter(event: any): void {
    this.searchString = event.target.value;

    console.log("Search: ", this.searchString);

    if (this.searchString.length === 0) {
      this.Refresh(this.getInputParams);
    } else {
      this.Search(this.searchString);
    }
  }

  override showAll(): void {
    this.Refresh(this.getInputParamsForAll);
  }

  override showLess(): void {
    this.Refresh(this.getInputParams);
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

  override Refresh(params?: GetProductsParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.productService.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetProducts response: ', d); // TODO: only for debug
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
