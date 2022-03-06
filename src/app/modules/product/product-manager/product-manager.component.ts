import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { NbDialogService, NbTable, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { Product } from '../models/Product';
import { ProductService } from '../services/product.service';
import { DeleteProductRequest } from '../models/DeleteProductRequest';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { GetProductsParamListModel } from '../models/GetProductsParamListModel';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { Origin } from '../../origin/models/Origin';
import { OriginService } from '../../origin/services/origin.service';
import { ProductGroup, ProductGroupDescriptionToCode } from '../../product-group/models/ProductGroup';
import { ProductGroupService } from '../../product-group/services/product-group.service';
import { UnitOfMeasure, UnitOfMeasureTextToValue, UnitOfMeasureValueToText } from '../models/UnitOfMeasure';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';

@Component({
  selector: 'app-product-manager',
  templateUrl: './product-manager.component.html',
  styleUrls: ['./product-manager.component.scss'],
})
export class ProductManagerComponent
  extends BaseManagerComponent<Product>
  implements OnInit
{
  @ViewChild('table') table?: NbTable<any>;

  dbDataTableId = 'product-table';
  dbDataTableEditId = 'user-cell-edit-input';

  colsToIgnore: string[] = [];
  allColumns = [
    'productCode',
    'description',
    'productGroup',
    'unitOfMeasure',
    'unitPrice1',
    'unitPrice2',
  ];
  colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Kód',
      objectKey: 'productCode',
      colKey: 'productCode',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '15%',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megnevezés',
      objectKey: 'description',
      colKey: 'description',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Csoport',
      objectKey: 'productGroup',
      colKey: 'productGroup',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Me.e.',
      objectKey: 'unitOfMeasure',
      colKey: 'unitOfMeasure',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Elad ár 1',
      objectKey: 'unitPrice1',
      colKey: 'unitPrice1',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Elad ár 2',
      objectKey: 'unitPrice2',
      colKey: 'unitPrice2',
      defaultValue: '',
      type: 'string',
      fInputType: 'bool',
      fRequired: false,
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
  ];

  searchString: string = '';

  // ProductGroup
  productGroups: ProductGroup[] = [];
  // UnitOfMeasure
  uom: UnitOfMeasure[] = [];
  // Origin
  origins: Origin[] = [];

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Product>>,
    private seInv: ProductService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private cs: CommonService,
    private productGroupApi: ProductGroupService,
    private originApi: OriginService
  ) {
    super(dialogService, kbS, fS, sidebarService);
    this.searchInputId = 'active-prod-search';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  private ConvertCombosForPost(data: Product): Product {
    if (data.productGroup !== undefined && this.productGroups.length > 0)
      data.productGroup = ProductGroupDescriptionToCode(
        data.productGroup,
        this.productGroups
      );
    // if (data.origin !== undefined && this.origins.length > 0)
    //   data.origin = OriginDescriptionToCode(data.origin, this.origins);
    if (data.unitOfMeasure !== undefined && this.uom.length > 0)
      data.unitOfMeasure = UnitOfMeasureTextToValue(
        data.unitOfMeasure,
        this.uom
      );

    data.vtsz = data.vtsz + '';
    data.ean = data.ean + '';

    return data;
  }

  private ConvertCombosForGet(data: Product): Product {
    // if (data.productGroup !== undefined && this.productGroups.length > 0)
    //   data.productGroup = ProductGroupCodeToDescription(data.productGroup, this.productGroups);
    // if (data.origin !== undefined && this.origins.length > 0)
    //   data.origin = OriginCodeToDescription(data.origin, this.origins);
    if (data.unitOfMeasure !== undefined && this.uom.length > 0)
      data.unitOfMeasure = UnitOfMeasureValueToText(
        data.unitOfMeasure,
        this.uom
      );

    console.log(`[ConvertCombosForGet] result: `, data);

    return data;
  }

  override ProcessActionNew(data?: IUpdateRequest<Product>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {
      data.data.id = parseInt(data.data.id + ''); // TODO
      data.data = this.ConvertCombosForPost(data.data);
      this.seInv.Create(data.data).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            this.seInv.Get({ ID: d.data.id }).subscribe({
              next: newData => {
                if (!!newData) {
                  d.data = this.ConvertCombosForGet(newData);
                  console.log("New product: ", d.data);
                  const newRow = { data: newData } as TreeGridNode<Product>;
                  this.dbData.push(newRow);
                  this.dbDataTable.SetDataForForm(newRow, false, false);
                  this.RefreshTable();
                  this.toastrService.show(
                    Constants.MSG_SAVE_SUCCESFUL,
                    Constants.TITLE_INFO,
                    Constants.TOASTR_SUCCESS
                  );
                  this.dbDataTable.flatDesignForm.SetFormStateToDefault();
                }
              },
              error: (err) => this.cs.HandleError(err),
            });
          } else {
            console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
            this.toastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
          }
        },
        error: (err) => this.cs.HandleError(err),
      });
    }
  }

  override ProcessActionPut(data?: IUpdateRequest<Product>): void {
    console.log('ActionPut: ', data?.data, JSON.stringify(data?.data));
    if (!!data && !!data.data) {
      data.data.id = parseInt(data.data.id + ''); // TODO
      data.data = this.ConvertCombosForPost(data.data);
      this.seInv.Update(data.data).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            this.seInv.Get({ ID: d.data.id }).subscribe({
              next: newData => {
                if (!!newData) {
                  d.data = this.ConvertCombosForGet(newData);
                  const newRow = {
                    data: newData,
                  } as TreeGridNode<Product>
                  const newRowIndex = this.dbData.findIndex(x => x.data.id === newRow.data.id);
                  this.dbData[newRowIndex !== -1 ? newRowIndex : data.rowIndex] = newRow;
                  this.dbDataTable.SetDataForForm(newRow, false, false);
                  this.RefreshTable();
                  this.toastrService.show(
                    Constants.MSG_SAVE_SUCCESFUL,
                    Constants.TITLE_INFO,
                    Constants.TOASTR_SUCCESS
                  );
                  this.dbDataTable.flatDesignForm.SetFormStateToDefault();
                }
              },
              error: (err) => this.cs.HandleError(err),
            });
          } else {
            this.toastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
          }
        },
        error: (err) => this.cs.HandleError(err),
      });
    }
  }

  override ProcessActionDelete(data?: IUpdateRequest<Product>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);
    if (id !== undefined) {
      this.seInv
        .Delete({
          id: id,
        } as DeleteProductRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              const di = this.dbData.findIndex((x) => x.data.id === id);
              this.dbData.splice(di, 1);
              this.RefreshTable();
              this.toastrService.show(
                Constants.MSG_DELETE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS
              );
              this.dbDataTable.SetBlankInstanceForForm(false, false);
              this.dbDataTable.flatDesignForm.SetFormStateToNew();
            } else {
              this.toastrService.show(
                d.errors!.join('\n'),
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR
              );
            }
          },
          error: (err) => this.cs.HandleError(err),
        });
    }
  }

  refreshFilter(event: any): void {
    if (this.searchString === event.target.value) {
      return;
    }
    this.searchString = event.target.value;
    console.log('Search: ', this.searchString);
    this.search();
  }

  search(): void {
    if (this.searchString.length === 0) {
      this.Refresh();
    } else {
      this.Refresh({ SearchString: this.searchString });
    }
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(undefined, []),
      productCode: new FormControl(undefined, [Validators.required]),
      description: new FormControl(undefined, [Validators.required]),
      productGroup: new FormControl(undefined, [Validators.required]),
      origin: new FormControl(undefined, []),
      unitOfMeasure: new FormControl(undefined, [Validators.required]),
      unitPrice1: new FormControl(undefined, []),
      unitPrice2: new FormControl(undefined, []),
      latestSupplyPrice: new FormControl(undefined, []),
      isStock: new FormControl(false, []),
      minStock: new FormControl(undefined, []),
      ordUnit: new FormControl(undefined, []),
      productFee: new FormControl(undefined, []),
      active: new FormControl(false, []),
      vtsz: new FormControl(undefined, [Validators.required]),
      ean: new FormControl(undefined, []),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'Product',
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.RIGHT,
      this.sidebarService,
      this.sidebarFormService,
      this,
      () => {
        return {
          id: 0,
          productCode: undefined,
          description: undefined,
          productGroup: this.productGroups[0].productGroupDescription,
          origin: this.origins[0].originDescription,
          unitOfMeasure: this.uom[0].text,
          unitOfMeasureX: undefined,
          unitPrice1: 0,
          unitPrice2: 0,
          latestSupplyPrice: 0,
          isStock: false,
          minStock: 0,
          ordUnit: 0,
          productFee: 0,
          active: true,
          vtsz: 0,
          ean: 0,
        } as Product;
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh({ PageNumber: newPageNumber + '' });
      },
    });

    this.sidebarService.collapse();

    this.RefreshAll();
  }

  private Refresh(params?: GetProductsParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.seInv.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetProducts response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.currentPage = d.pageNumber;
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
      error: (err) => this.cs.HandleError(err),
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private RefreshTable(): void {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore
    );
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(false);
      // this.kbS.InsertNavigatable(this.dbDataTable, AttachDirection.UP, this.searchInputNavigatable);
      // this.kbS.SelectFirstTile();
    }, 200);
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.PushFooterCommandList();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  private RefreshAll(params?: GetProductsParamListModel): void {
    // ProductGroups
    this.productGroupApi.GetAll().subscribe({
      next: (data) => {
        if (!!data.data) this.productGroups = data.data;
      },
      complete: () => {
        // UnitOfMeasure
        this.seInv.GetAllUnitOfMeasures().subscribe({
          next: (data) => {
            if (!!data) this.uom = data;
          },
          complete: () => {
            // Origin
            this.originApi.GetAll().subscribe({
              next: (data) => {
                if (!!data.data) this.origins = data.data;
              },
              complete: () => {
                this.Refresh(params);
              },
            });
          },
        });
      },
    });
  }
}
