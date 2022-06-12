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
import { AttachDirection, BlankComboBoxValue, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { Origin } from '../../origin/models/Origin';
import { OriginService } from '../../origin/services/origin.service';
import { ProductGroup, ProductGroupDescriptionToCode } from '../../product-group/models/ProductGroup';
import { ProductGroupService } from '../../product-group/services/product-group.service';
import { UnitOfMeasure, UnitOfMeasureTextToValue } from '../models/UnitOfMeasure';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CreateProductRequest } from '../models/CreateProductRequest';
import { UpdateProductRequest } from '../models/UpdateProductRequest';
import { environment } from 'src/environments/environment';
import { StatusService } from 'src/app/services/status.service';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { VatRate } from '../../vat-rate/models/VatRate';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

@Component({
  selector: 'app-product-manager',
  templateUrl: './product-manager.component.html',
  styleUrls: ['./product-manager.component.scss'],
})
export class ProductManagerComponent extends BaseManagerComponent<Product> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  override allColumns = [
    'productCode',
    'description',
    'productGroup',
    'unitOfMeasureX',
    'unitPrice1',
    'unitPrice2',
  ];
  override colDefs: ModelFieldDescriptor[] = [
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
      objectKey: 'unitOfMeasureX',
      colKey: 'unitOfMeasureX',
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
    {
      label: 'Áfakód',
      objectKey: 'vatRateCode',
      colKey: 'vatRateCode',
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

  // ProductGroup
  productGroups: ProductGroup[] = [];
  // UnitOfMeasure
  uom: UnitOfMeasure[] = [];
  // Origin
  origins: Origin[] = [];
  // VatRate
  vats: VatRate[] = [];

  override get getInputParams(): GetProductsParamListModel {
    return { PageNumber: this.dbDataTable.currentPage + '', PageSize: this.dbDataTable.pageSize, SearchString: this.searchString ?? '' };
  }

  get blankProductRow(): () => Product {
    return () => {
      return {
        id: 0,
        productCode: undefined,
        description: undefined,
        productGroup: BlankComboBoxValue,
        origin: BlankComboBoxValue,
        unitOfMeasure: this.uom[0]?.text,
        unitOfMeasureX: undefined,
        unitPrice1: 0,
        unitPrice2: 0,
        latestSupplyPrice: 0,
        isStock: true,
        minStock: 0,
        ordUnit: 0,
        productFee: 0,
        active: true,
        vtsz: '',
        ean: '',
        vatRateCode: this.vats[0]?.vatRateDescription,
        vatPercentage: 0
      } as Product
    };
  }

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
    private productGroupApi: ProductGroupService,
    private originApi: OriginService,
    private vatApi: VatRateService,
    cs: CommonService,
    sts: StatusService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'product-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  private ConvertCombosForPost(data: Product): Product {
    if (data.productGroup !== undefined && this.productGroups.length > 0)
      data.productGroup = ProductGroupDescriptionToCode(
        data.productGroup,
        this.productGroups
      );
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
    if (data.unitOfMeasure !== undefined && this.uom.length > 0) {
      data.unitOfMeasure = data.unitOfMeasureX;
    }
    if (data.vatRateCode !== undefined && this.vats.length > 0) {
      data.vatRateCode = this.vats.find(x => x.vatRateCode == data.vatRateCode)?.vatRateDescription ?? '';
    }

    if (environment.flatDesignCRUDManagerDebug) {
      console.log(`[ConvertCombosForGet] result: `, data);
    }

    return data;
  }

  ToInt(p: any): number {
    return parseInt(p + '');
  }

  private FormProductToCreateRequest(p: Product): CreateProductRequest {
    let originCode = HelperFunctions.ConvertChosenOriginToCode(p.origin, this.origins, '');
    let productGroupCode = HelperFunctions.ConvertChosenProductGroupToCode(p.productGroup, this.productGroups, '');
    let vatRatecode = HelperFunctions.ConvertChosenVatRateToCode(p.vatRateCode, this.vats, '');

    let smallestUomValue = this.uom.length > 0 ? this.uom[0].value : 'PIECE';
    let unitOfMeasureValue = HelperFunctions.ConvertChosenUOMToCode(p.unitOfMeasure, this.uom, smallestUomValue);

    const res = {
      ean: p.ean as string,
      vtsz: p.vtsz,
      active: p.active,
      description: p.description,
      isStock: p.isStock,
      minStock: this.ToInt(p.minStock),
      latestSupplyPrice: this.ToInt(p.latestSupplyPrice),
      ordUnit: this.ToInt(p.ordUnit),
      originCode: originCode,
      productGroupCode: productGroupCode,
      unitPrice1: this.ToInt(p.unitPrice1),
      unitPrice2: this.ToInt(p.unitPrice2),
      unitOfMeasure: unitOfMeasureValue,
      productFee: this.ToInt(p.productFee),
      productCode: p.productCode,
      vatRateCode: vatRatecode
    } as CreateProductRequest;
    return res;
  }

  private FormProductToUpdateRequest(p: Product): UpdateProductRequest {
    let originCode = HelperFunctions.ConvertChosenOriginToCode(p.origin, this.origins, '');
    let productGroupCode = HelperFunctions.ConvertChosenProductGroupToCode(p.productGroup, this.productGroups, '');
    let vatRatecode = HelperFunctions.ConvertChosenVatRateToCode(p.vatRateCode, this.vats, '');

    let smallestUomValue = this.uom.length > 0 ? this.uom[0].value : 'PIECE';
    let unitOfMeasureValue = HelperFunctions.ConvertChosenUOMToCode(p.unitOfMeasure, this.uom, smallestUomValue);

    const res = {
      id: parseInt(p.id + ''), // TODO
      ean: p.ean as string,
      vtsz: p.vtsz,
      active: p.active,
      description: p.description,
      isStock: p.isStock,
      minStock: this.ToInt(p.minStock),
      latestSupplyPrice: this.ToInt(p.latestSupplyPrice),
      ordUnit: this.ToInt(p.ordUnit),
      originCode: originCode,
      productGroupCode: productGroupCode,
      unitPrice1: this.ToInt(p.unitPrice1),
      unitPrice2: this.ToInt(p.unitPrice2),
      unitOfMeasure: unitOfMeasureValue,
      productFee: this.ToInt(p.productFee),
      productCode: p.productCode,
      vatRateCode: vatRatecode
    } as UpdateProductRequest;
    return res;
  }

  override ProcessActionNew(data?: IUpdateRequest<Product>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {

      const createRequest = this.FormProductToCreateRequest(data.data);

      console.log('ActionNew request: ', createRequest);

      this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);

      this.seInv.Create(createRequest).subscribe({
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
                  this.RefreshTable(newRow.data.id);
                  this.toastrService.show(
                    Constants.MSG_SAVE_SUCCESFUL,
                    Constants.TITLE_INFO,
                    Constants.TOASTR_SUCCESS
                  );
                  this.dbDataTable.flatDesignForm.SetFormStateToDefault();
                  this.isLoading = false;
                  this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                }
              },
              error: (err) => { this.HandleError(err); },
            });
          } else {
            console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
            this.toastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          }
        },
        error: (err) => { this.HandleError(err); },
      });
    }
  }

  override ProcessActionPut(data?: IUpdateRequest<Product>): void {
    console.log('ActionPut: ', data?.data, JSON.stringify(data?.data));
    if (!!data && !!data.data) {

      const updateRequest = this.FormProductToUpdateRequest(data.data);

      console.log('ActionPut request: ', updateRequest);

      this.sts.pushProcessStatus(Constants.CRUDPutStatuses[Constants.CRUDPutPhases.UPDATING]);

      data.data.id = parseInt(data.data.id + ''); // TODO
      this.seInv.Update(updateRequest).subscribe({
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
                  this.isLoading = false;
                  this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                }
              },
              error: (err) => { this.HandleError(err); },
            });
          } else {
            this.toastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          }
        },
        error: (err) => { this.HandleError(err); },
      });
    }
  }

  override ProcessActionDelete(data?: IUpdateRequest<Product>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);

    if (id !== undefined) {
      this.sts.pushProcessStatus(Constants.CRUDDeleteStatuses[Constants.CRUDDeletePhases.DELETING]);
      this.seInv
        .Delete({
          id: id,
        } as DeleteProductRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              const di = this.dbData.findIndex((x) => x.data.id === id);
              this.dbData.splice(di, 1);
              this.toastrService.show(
                Constants.MSG_DELETE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS
              );
              this.HandleGridSelectionAfterDelete(di);
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            } else {
              this.toastrService.show(
                d.errors!.join('\n'),
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR
              );
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            }
          },
          error: (err) => { this.HandleError(err); },
        });
    }
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(undefined, []),
      productCode: new FormControl(undefined, [Validators.required]),
      description: new FormControl(undefined, [Validators.required]),
      productGroup: new FormControl(undefined, []),
      origin: new FormControl(undefined, []),
      unitOfMeasure: new FormControl(undefined, [Validators.required]),
      unitPrice1: new FormControl(undefined, []),
      unitPrice2: new FormControl(undefined, []),
      latestSupplyPrice: new FormControl(undefined, []),
      isStock: new FormControl(true, []),
      minStock: new FormControl(undefined, []),
      ordUnit: new FormControl(undefined, []),
      productFee: new FormControl(undefined, []),
      active: new FormControl(false, []),
      vtsz: new FormControl(undefined, [Validators.required]),
      ean: new FormControl(undefined, []),
      vatRateCode: new FormControl(undefined, [])
    });

    console.log("Manager ProductGroups: ", this.productGroups);

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
      this.blankProductRow
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams);
      },
    });
    this.dbDataTable.flatDesignForm.FillFormWithObject = (data: Product) => {
      if (!!data && !!this.dbDataTable.flatDesignForm) {
        data = {...data};

        data.origin = HelperFunctions.GetOriginDescription(data.origin, this.origins, '');
        data.productGroup = HelperFunctions.GetProductGroupDescription(data.productGroup, this.productGroups, '');

        Object.keys(this.dbDataTable.flatDesignForm.form.controls).forEach((x: string) => {
          this.dbDataTable.flatDesignForm!.form.controls[x].setValue(data[x as keyof Product]);
          if (environment.flatDesignFormDebug) {
            console.log(`[FillFormWithObject] with Product: ${x}, ${data[x as keyof Product]},
              ${this.dbDataTable.flatDesignForm!.form.controls[x].value}`);
          }
        });
      }
    }

    this.sidebarService.collapse();

    this.RefreshAll(this.getInputParams);
  }

  override Refresh(params?: GetProductsParamListModel): void {
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
            this.dbDataTable.allPages = this.GetPageCount(d.recordsFiltered, d.pageSize);
            this.dbDataTable.totalItems = d.recordsFiltered;
            this.dbDataTable.itemsOnCurrentPage = tempData.length;
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
      error: (err) => {
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        // UnitOfMeasure
        this.seInv.GetAllUnitOfMeasures().subscribe({
          next: (data) => {
            if (!!data) this.uom = data;
          },
          error: (err) => {
            { this.cs.HandleError(err); this.isLoading = false; };
            this.isLoading = false;
          },
          complete: () => {
            // Origin
            this.originApi.GetAll().subscribe({
              next: (data) => {
                if (!!data.data) this.origins = data.data;
              },
              error: (err) => {
                { this.cs.HandleError(err); this.isLoading = false; };
                this.isLoading = false;
              },
              complete: () => {
                // VatRates
                this.vatApi.GetAll().subscribe({
                  next: (data) => {
                    if (!!data.data) this.vats = data.data;
                  },
                  error: (err) => {
                    { this.cs.HandleError(err); this.isLoading = false; };
                    this.isLoading = false;
                  },
                  complete: () => {
                    this.Refresh(params);
                  },
                });
              },
            });
          },
        });
      },
    });
  }
}
