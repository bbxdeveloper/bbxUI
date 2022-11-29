import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { NavigatableForm } from 'src/assets/model/navigation/Nav';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { SelectedCell } from 'src/assets/model/navigation/SelectedCell';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { IsKeyFunctionKey, KeyBindings } from 'src/assets/util/KeyBindings';
import { GetProductsParamListModel } from '../../product/models/GetProductsParamListModel';
import { Product } from '../../product/models/Product';
import { ProductService } from '../../product/services/product.service';
import { SelectTableDialogComponent } from '../../shared/select-table-dialog/select-table-dialog.component';
import { CurrencyCodes } from '../../system/models/CurrencyCode';

const NavMap: string[][] = [
  ['radio-1', 'radio-2'],
  ['active-prod-search', 'show-all', 'show-less']
];

@Component({
  selector: 'app-product-select-table-dialog',
  templateUrl: './product-select-table-dialog.component.html',
  styleUrls: ['./product-select-table-dialog.component.scss']
})
export class ProductSelectTableDialogComponent extends SelectTableDialogComponent<Product>
  implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked, AfterViewInit {
  currentChooserValue: any = 1;

  inputForm!: FormGroup;
  formNav!: NavigatableForm;

  TileCssClass = TileCssClass;

  AlwaysFirstX = 0;
  AlwaysFirstY = 1;

  @Input() exchangeRate: number = 1;
  @Input() currency: string = CurrencyCodes.HUF;

  get srcString(): string {
    return (this.searchString ?? '').trim();
  }

  get getInputParams(): GetProductsParamListModel {
    return {
      SearchString: this.srcString,
      PageSize: '10',
      PageNumber: '1',
      OrderBy: 'ProductCode',
      FilterByName: this.currentChooserValue == 1,
      FilterByCode: this.currentChooserValue != 1,
    };
  }

  get getInputParamsForAll(): GetProductsParamListModel {
    return {
      SearchString: this.srcString,
      PageSize: '999999',
      OrderBy: 'ProductCode',
      FilterByName: this.currentChooserValue == 1,
      FilterByCode: this.currentChooserValue != 1,
    };
  }

  isLoaded: boolean = false;
  override isLoading: boolean = false;

  constructor(
    private simpleToastrService: BbxToastrService,
    private bbxToastrService: BbxToastrService,
    private cdref: ChangeDetectorRef,
    private cs: CommonService,
    dialogRef: NbDialogRef<SelectTableDialogComponent<Product>>,
    kbS: KeyboardNavigationService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Product>>,
    private productService: ProductService,
    private cdrf: ChangeDetectorRef,
  ) {
    super(dialogRef, kbS, dataSourceBuilder);

    this.dbDataTable = new SimpleNavigatableTable<Product>(
      this.dataSourceBuilder, this.kbS, this.cdref, this.dbData, '', AttachDirection.DOWN, this
    );
    this.dbDataTable.InnerJumpOnEnter = true;
    this.dbDataTable.OuterJump = true;
  }

  override Setup(): void {
    this.dbData = []; // this.allData;
    this.dbDataSource = this.dataSourceBuilder.create(this.dbData);
    this.selectedRow = {} as Product;

    this.IsDialog = true;
    this.InnerJumpOnEnter = true;    
    this.OuterJump = true;

    this.Matrix = NavMap;

    this.inputForm = new FormGroup({
      chooser: new FormControl(this.currentChooserValue, []),
      searchString: new FormControl("", []),
    });

    this.inputForm.controls['chooser'].valueChanges.subscribe({
      next: newValue => {
        const change = this.currentChooserValue !== newValue;
        this.currentChooserValue = newValue;
        if (change) {
          this.Refresh(this.getInputParams);
        }
      }
    });

    this.formNav = new NavigatableForm(
      this.inputForm, this.kbS, this.cdrf, [], 'productSearchDialogForm', AttachDirection.UP, {} as IInlineManager
    );
  }

  override ngOnInit(): void {
    this.Refresh(this.getInputParams);
  }
  ngAfterViewInit(): void {
  }
  ngAfterContentInit(): void {
    $('*[type=radio]').addClass(TileCssClass);

    $('*[type=radio]')[0].id = 'radio-1';
    $('*[type=radio]')[1].id = 'radio-2';

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

  override refreshFilter(event: any): void {
    if ((event.key.length > 1 && event.key.toLowerCase() !== 'backspace') || event.ctrlKey || event.key == KeyBindings.F2 || IsKeyFunctionKey(event.key)) {
      return;
    }

    if (this.searchString.length !== 0 && event.target.value.length === 0) {
      this.searchString = event.target.value;
      this.Refresh(this.getInputParams);
    } else {
      this.searchString = event.target.value;
      this.Search(this.searchString);
    }
  }

  exit(): void {
    this.close(undefined);
  }

  override showAll(): void {
    this.Refresh(this.getInputParamsForAll);
  }

  override showLess(): void {
    this.kbS.SelectFirstTile();
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
      this.dbDataTable.GenerateAndSetNavMatrices(this.DownNeighbour === undefined, false);
    }, 200);
  }

  override Refresh(params?: GetProductsParamListModel): void {
    if (!!this.Subscription_Search && !this.Subscription_Search.closed) {
      this.Subscription_Search.unsubscribe();
    }

    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;

    this.Subscription_Search = this.productService.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetProducts response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
            tempData.forEach(x => {
              x.data.exhangedUnitPrice1 = x.data.unitPrice1;
              x.data.exhangedUnitPrice2 = x.data.unitPrice2;
              if (x.data.exhangedUnitPrice1) {
                x.data.exhangedUnitPrice1 = x.data.exhangedUnitPrice1 / this.exchangeRate;

                if (this.currency !== CurrencyCodes.HUF) {
                  x.data.exhangedUnitPrice1 = HelperFunctions.Round2(x.data.exhangedUnitPrice1, 2);
                }
              }
              if (x.data.exhangedUnitPrice2) {
                x.data.exhangedUnitPrice2 = x.data.exhangedUnitPrice2 / this.exchangeRate;

                if (this.currency !== CurrencyCodes.HUF) {
                  x.data.exhangedUnitPrice2 = HelperFunctions.Round2(x.data.exhangedUnitPrice2, 2);
                }
              }
            });
            this.dbData = tempData;
            this.dbDataSource.setData(this.dbData);
          }
          this.RefreshTable();
        } else {
          this.bbxToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
        this.isLoading = false;
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
