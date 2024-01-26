import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { JumpPosPriority, KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { NavigatableForm } from 'src/assets/model/navigation/Nav';
import { AttachDirection, JumpDestination, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { SelectedCell } from 'src/assets/model/navigation/SelectedCell';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { IsKeyFunctionKey, KeyBindings } from 'src/assets/util/KeyBindings';
import { GetProductsParamListModel } from '../../../product/models/GetProductsParamListModel';
import { Product, ProductRow, ProductRowToProduct, ProductToProductRow } from '../../../product/models/Product';
import { ProductService } from '../../../product/services/product.service';
import { SelectTableDialogComponent } from '../select-table-dialog/select-table-dialog.component';
import { CurrencyCodes } from '../../../system/models/CurrencyCode';
import { ProductStockInformationDialogComponent } from '../product-stock-information-dialog/product-stock-information-dialog.component';
import { StatusService } from 'src/app/services/status.service';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

const LAST_PRODUCT_SEARCH_STRING_KEY = 'last-product-search-string'

const NavMap: string[][] = [
  ['radio-0', 'radio-1', 'radio-2'],
  ['active-prod-search', 'show-all'] // , 'show-less'
];

export enum SearchMode {
  SEARCH_NAME_CODE = 0,
  SEARCH_NAME = 1,
  SEARCH_CODE = 2
}

@Component({
  selector: 'app-product-select-table-dialog',
  templateUrl: './product-select-table-dialog.component.html',
  styleUrls: ['./product-select-table-dialog.component.scss']
})
export class ProductSelectTableDialogComponent extends SelectTableDialogComponent<ProductRow>
  implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked, AfterViewInit {
  currentChooserValue: SearchMode = SearchMode.SEARCH_NAME_CODE;

  inputForm!: FormGroup;
  formNav!: NavigatableForm;

  TileCssClass = TileCssClass;

  AlwaysFirstX = 0;
  AlwaysFirstY = 1;
  JumpPositionPriority = JumpPosPriority.first;
  DestWhenJumpedOnto = JumpDestination.LOWER_LEFT;

  @Input() exchangeRate: number = 1;
  @Input() currency: string = CurrencyCodes.HUF;
  @Input() defaultSearchModeForEnteredFilter: SearchMode = SearchMode.SEARCH_CODE

  detailsDialogOpened: boolean = false

  get srcString(): string {
    return (this.searchString ?? '').trim();
  }

  public getInputParams(override?: Constants.Dct): GetProductsParamListModel {
    return {
      SearchString: this.srcString,
      PageSize: '10',
      PageNumber: '1',
      OrderBy: this.currentChooserValue == SearchMode.SEARCH_NAME ? 'Description' : 'ProductCode',
      FilterByName: this.currentChooserValue == SearchMode.SEARCH_NAME || this.currentChooserValue == SearchMode.SEARCH_NAME_CODE,
      FilterByCode: this.currentChooserValue == SearchMode.SEARCH_CODE || this.currentChooserValue == SearchMode.SEARCH_NAME_CODE,
    };
  }

  public getInputParamsForAll(override?: Constants.Dct): GetProductsParamListModel {
    return {
      SearchString: this.srcString,
      PageSize: '999999',
      OrderBy: this.currentChooserValue == SearchMode.SEARCH_NAME ? 'Description' : 'ProductCode',
      FilterByName: this.currentChooserValue == SearchMode.SEARCH_NAME || this.currentChooserValue == SearchMode.SEARCH_NAME_CODE,
      FilterByCode: this.currentChooserValue == SearchMode.SEARCH_CODE || this.currentChooserValue == SearchMode.SEARCH_NAME_CODE,
    };
  }

  isLoaded: boolean = false;
  override isLoading: boolean = false;

  constructor(
    private bbxToastrService: BbxToastrService,
    private cdref: ChangeDetectorRef,
    private cs: CommonService,
    dialogRef: NbDialogRef<SelectTableDialogComponent<ProductRow>>,
    kbS: KeyboardNavigationService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<ProductRow>>,
    private productService: ProductService,
    private cdrf: ChangeDetectorRef,
    private dialogService: BbxDialogServiceService,
    statusService: StatusService,
    private tokenService: TokenStorageService
  ) {
    super(dialogRef, kbS, dataSourceBuilder, statusService);

    this.dbDataTable = new SimpleNavigatableTable<ProductRow>(
      this.dataSourceBuilder, this.kbS, this.cdref, this.dbData, '', AttachDirection.DOWN, this
    );
    this.dbDataTable.InnerJumpOnEnter = true;
    this.dbDataTable.OuterJump = true;
  }

  override Setup(): void {
    this.dbData = []; // this.allData;
    this.dbDataSource = this.dataSourceBuilder.create(this.dbData);
    this.selectedRow = new ProductRow();

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
          this.Refresh(this.getInputParams());
        }
      }
    });

    this.formNav = new NavigatableForm(
      this.inputForm, this.kbS, this.cdrf, [], 'productSearchDialogForm', AttachDirection.UP, {} as IInlineManager
    );
  }

  override ngOnInit(): void {
    if (!HelperFunctions.isEmptyOrSpaces(this.searchString)) {
      this.inputForm.controls['chooser'].setValue(this.defaultSearchModeForEnteredFilter);
    }
    this.Refresh(this.getInputParams());
  }

  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
    const element = $('*[type=radio]')
    element.addClass(TileCssClass);

    element[SearchMode.SEARCH_NAME_CODE].id = 'radio-0';
    element[SearchMode.SEARCH_NAME].id = 'radio-1';
    element[SearchMode.SEARCH_CODE].id = 'radio-2';

    this.kbS.SetWidgetNavigatable(this);
    this.kbS.SelectFirstTile();
  }

  ngAfterViewChecked(): void {
    if (!this.isLoaded) {
      $('#active-prod-search').val(this.searchString)
      if (!HelperFunctions.isEmptyOrSpaces(this.searchString)) {
        this.tokenService.setValue(LAST_PRODUCT_SEARCH_STRING_KEY, this.searchString)
      }
      this.clickCurrentRadio()
      this.isLoaded = true;
    }
    this.kbS.SelectCurrentElement();
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }

  clickCurrentRadio(): void {
    $(`#radio-${this.currentChooserValue}`).trigger('click')
  }

  MoveToSaveButtons(event: any): void {
    event.preventDefault()
    event.stopImmediatePropagation()
    event.stopPropagation()
    this.kbS.Jump(AttachDirection.DOWN, false)
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)
  }

  override refreshFilter(event: any): void {
    if (event.key == KeyBindings.Enter) {
      this.MoveToSaveButtons(event)
      return
    }

    if ((event.key.length > 1 && event.key.toLowerCase() !== 'backspace') || event.ctrlKey || event.key == KeyBindings.F2 || IsKeyFunctionKey(event.key)) {
      return
    }

    if (this.searchString.length !== 0 && event.target.value.length === 0) {
      this.searchString = event.target.value
      this.Refresh(this.getInputParams())
    } else {
      this.searchString = event.target.value
      this.Search(this.searchString)
    }
  }

  public shouldStoreSearchString(event: any): void {
    const shouldStore = event.key === KeyBindings.up ||
      event.key === KeyBindings.down ||
      event.key === KeyBindings.left ||
      event.key === KeyBindings.right ||
      event.key === KeyBindings.Enter

    if (shouldStore) {
      this.tokenService.setValue(LAST_PRODUCT_SEARCH_STRING_KEY, event.target.value)
    }
  }

  exit(): void {
    this.close(undefined);
  }

  override showAll(): void {
    this.Refresh(this.getInputParamsForAll());
  }

  override showLess(): void {
    this.kbS.SelectFirstTile();
    this.Refresh(this.getInputParams());
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
      next: response => {
        if (!response.succeeded || !response.data) {
          this.bbxToastrService.showError(response.errors!.join('\n'));
          return
        }

        this.dbData = response.data.map(this.productToRow.bind(this))

        this.dbDataSource.setData(this.dbData);

        this.RefreshTable();
        this.isLoading = false;
      },
      error: (err) => {
        this.cs.HandleError(err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private productToRow(product: Product): any {
    const productRow = ProductToProductRow(product, this.tokenService.wareHouse?.id)

    if (productRow.unitPrice1) {
      productRow.exhangedUnitPrice1 = this.calculatePriceBasedOnExchangeRate(productRow.unitPrice1)
    }

    if (productRow.unitPrice2) {
      productRow.exhangedUnitPrice2 = this.calculatePriceBasedOnExchangeRate(productRow.unitPrice2)
    }

    if (productRow.latestSupplyPrice) {
      productRow.latestSupplyPrice = this.calculatePriceBasedOnExchangeRate(productRow.latestSupplyPrice)
    }

    return { data: productRow, uid: this.nextUid() }
  }

  private calculatePriceBasedOnExchangeRate(price: number): number {
    let newPrice = price / this.exchangeRate

    if (this.currency !== CurrencyCodes.HUF) {
      newPrice = HelperFunctions.Round2(newPrice, 2)
    }

    return newPrice
  }

  override Search(searchString: string): void {
    this.Refresh(this.getInputParams());
  }

  HandleItemChoice(item: SelectedCell): void {

  }

  openProductStockInformationDialog(event: any, row: TreeGridNode<Product>): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.detailsDialogOpened = true

    const dialogRef = this.dialogService.open(ProductStockInformationDialogComponent, {
      context: {
        product: row.data
      }
    });
    dialogRef.onClose.subscribe(async (res: Product) => {
      setTimeout(() => {
        this.detailsDialogOpened = false
      }, 500);
    })
  }

  private SetSearch(newSearchString: string): void {
    if (newSearchString === this.inputForm.controls['searchString'].value) {
      return
    }

    this.inputForm.controls['searchString'].setValue(newSearchString)

    if (this.searchString.length !== 0 && newSearchString.length === 0) {
      this.searchString = newSearchString
      this.Refresh(this.getInputParams())
    } else {
      this.searchString = newSearchString
      this.Search(this.searchString)
    }
  }

  // override close(answer?: ProductRow) {
  //   this.closedManually = true;
  //   this.kbS.RemoveWidgetNavigatable();
  //   this.dialogRef.close(answer ? ProductRowToProduct(answer) : answer);
  // }

  @HostListener('document:keydown', ['$event']) override onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Tab') {
      event.preventDefault()
      this.currentChooserValue = (this.currentChooserValue + 1) % 3
      this.clickCurrentRadio()
      this.Refresh(this.getInputParams())
    }
    switch (event.key) {
      case KeyBindings.exit: {
        if (this.detailsDialogOpened) {
          event.preventDefault()
          event.stopImmediatePropagation()
          event.stopPropagation()
          return
        }
        if (this.shouldCloseOnEscape) {
          event.preventDefault()
          // Closing dialog
          this.close(undefined)
        }
        break
      }
      case KeyBindings.F10: {
        event.preventDefault()
        event.stopImmediatePropagation()
        event.stopPropagation()
        this.SetSearch(this.tokenService.getValue(LAST_PRODUCT_SEARCH_STRING_KEY))
        break
      }
      default: { }
    }
  }

}
