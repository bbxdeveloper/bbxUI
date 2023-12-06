import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { ProductGroup } from '../../product-group/models/ProductGroup';
import { ProductGroupService } from '../../product-group/services/product-group.service';
import { UnitOfMeasure } from '../models/UnitOfMeasure';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CreateProductRequest } from '../models/CreateProductRequest';
import { UpdateProductRequest } from '../models/UpdateProductRequest';
import { environment } from 'src/environments/environment';
import { StatusService } from 'src/app/services/status.service';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { VatRate } from '../../vat-rate/models/VatRate';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { lastValueFrom } from 'rxjs';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { Actions, KeyBindings } from 'src/assets/util/KeyBindings';
import { LoggerService } from 'src/app/services/logger.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { GetProductsResponse } from '../models/GetProductsResponse';

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
    'unitWeight',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Kód',
      objectKey: 'productCode',
      colKey: 'productCode',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '400px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megnevezés',
      objectKey: 'description',
      colKey: 'description',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '100%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Csoport',
      objectKey: 'productGroup',
      colKey: 'productGroup',
      defaultValue: '',
      type: 'string',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Me.e.',
      objectKey: 'unitOfMeasureX',
      colKey: 'unitOfMeasureX',
      defaultValue: '',
      type: 'string',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Listaár',
      objectKey: 'unitPrice1',
      colKey: 'unitPrice1',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Egységár',
      objectKey: 'unitPrice2',
      colKey: 'unitPrice2',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: false,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Áfakód',
      objectKey: 'vatRateCode',
      colKey: 'vatRateCode',
      defaultValue: '',
      type: 'string',
      fRequired: false,
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Súly',
      objectKey: 'unitWeight',
      colKey: 'unitWeight',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: false,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
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

  idParam?: number;
  public override getInputParams(override?: Constants.Dct): GetProductsParamListModel {
    const params = {
      OrderBy: "ProductCode",
      PageNumber: 1 + '',
      PageSize: this.dbDataTable.pageSize,
      SearchString: this.searchString ?? '',
      ID: this.idParam,
      FilterByCode: true,
      FilterByName: true
    } as GetProductsParamListModel
    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"] + ''
    }
    this.idParam = undefined
    return params
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
        vatPercentage: 0,
        noDiscount: false
      } as Product
    };
  }

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Product>>,
    private seInv: ProductService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private productGroupApi: ProductGroupService,
    private originApi: OriginService,
    private vatApi: VatRateService,
    cs: CommonService,
    sts: StatusService,
    private khs: KeyboardHelperService,
    loggerService: LoggerService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'product-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  override GetRecordName(data: Product): string | number | undefined {
    return data.productCode
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
      minStock: HelperFunctions.ToFloat(p.minStock),
      latestSupplyPrice: HelperFunctions.ToFloat(p.latestSupplyPrice),
      ordUnit: HelperFunctions.ToFloat(p.ordUnit),
      originCode: originCode,
      productGroupCode: productGroupCode,
      unitPrice1: HelperFunctions.ToFloat(p.unitPrice1),
      unitPrice2: HelperFunctions.ToFloat(p.unitPrice2),
      unitOfMeasure: unitOfMeasureValue,
      productFee: HelperFunctions.ToFloat(p.productFee),
      productCode: p.productCode,
      vatRateCode: vatRatecode,
      noDiscount: p.noDiscount,
      unitWeight: p.unitWeight !== undefined ? HelperFunctions.ToFloat(p.unitWeight) : undefined
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
      id: HelperFunctions.ToInt(p.id),
      ean: p.ean as string,
      vtsz: p.vtsz,
      active: p.active,
      description: p.description,
      isStock: p.isStock,
      minStock: HelperFunctions.ToFloat(p.minStock),
      latestSupplyPrice: HelperFunctions.ToInt(p.latestSupplyPrice),
      ordUnit: HelperFunctions.ToFloat(p.ordUnit),
      originCode: originCode,
      productGroupCode: productGroupCode,
      unitPrice1: HelperFunctions.ToFloat(p.unitPrice1),
      unitPrice2: HelperFunctions.ToFloat(p.unitPrice2),
      unitOfMeasure: unitOfMeasureValue,
      productFee: HelperFunctions.ToFloat(p.productFee),
      productCode: p.productCode,
      vatRateCode: vatRatecode,
      noDiscount: p.noDiscount,
      unitWeight: p.unitWeight !== undefined ? HelperFunctions.ToFloat(p.unitWeight) : undefined
    } as UpdateProductRequest;
    return res;
  }

  override ProcessActionNew(data?: IUpdateRequest<Product>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {

      this.RefreshComboValues().then(() => {
        const createRequest = this.FormProductToCreateRequest(data.data);

        console.log('ActionNew request: ', createRequest);

        this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);

        this.seInv.Create(createRequest).subscribe({
          next: async d => {
            if (d.succeeded && !!d.data) {
              this.idParam = d.data.id;
              await this.RefreshAsync(this.getInputParams());
              this.dbDataTable.SelectRowById(d.data.id);
              this.simpleToastrService.show(
                Constants.MSG_SAVE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
            } else {
              console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
              this.simpleToastrService.show(
                d.errors!.join('\n'),
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR_5_SEC
              );
              this.isLoading = false;
              this.kbS.ClickCurrentElement()
            }
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            this.dbDataTable.SetFormReadonly(false)
          },
          error: (err) => {
            this.HandleError(err);
            this.dbDataTable.SetFormReadonly(false)
          },
        });
      });
    }
  }

  override ProcessActionPut(data?: IUpdateRequest<Product>): void {
    console.log('ActionPut: ', data?.data, JSON.stringify(data?.data));
    if (!!data && !!data.data) {

      this.RefreshComboValues().then(() => {
        const updateRequest = this.FormProductToUpdateRequest(data.data);

        console.log('ActionPut request: ', updateRequest);

        this.sts.pushProcessStatus(Constants.CRUDPutStatuses[Constants.CRUDPutPhases.UPDATING]);

        data.data.id = parseInt(data.data.id + ''); // TODO
        this.seInv.Update(updateRequest).subscribe({
          next: async (d) => {
            if (!d.succeeded || !d.data) {
              this.bbxToastrService.showError(d.errors!.join('\n'), true)
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
              this.dbDataTable.SetFormReadonly(false)
              this.kbS.ClickCurrentElement()

              return
            }

            this.idParam = d.data.id
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            await this.RefreshAsync(this.getInputParams())
            this.dbDataTable.SelectRowById(d.data.id)
          },
          error: (err) => {
            this.HandleError(err);
            this.dbDataTable.SetFormReadonly(false)
          },
        });
      });
    }
  }

  override ProcessActionDelete(data?: IUpdateRequest<Product>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);

    if (id !== undefined) {
      this.sts.pushProcessStatus(Constants.DeleteStatuses[Constants.DeletePhases.DELETING]);
      this.seInv
        .Delete({
          id: id,
        } as DeleteProductRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              const di = this.dbData.findIndex((x) => x.data.id === id);
              this.dbData.splice(di, 1);
              this.simpleToastrService.show(
                Constants.MSG_DELETE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
              this.HandleGridSelectionAfterDelete(di);
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            } else {
              this.simpleToastrService.show(
                d.errors!.join('\n'),
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR_5_SEC
              );
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            }
          },
          error: (err) => {
            this.HandleError(err);
          },
        });
    }
  }

  private validateProductGroup(control: AbstractControl): any {
    if (this.productGroups === undefined || this.productGroups.length === 0) {
      return null
    }

    const chosenValue = control.value

    if (HelperFunctions.isEmptyOrSpaces(chosenValue)) {
      return null
    }

    const wrong = this.productGroups.find(x => x.productGroupDescription === chosenValue) === undefined
    return wrong ? { invalidSelectedValue: { value: control.value } } : null;
  }

  private validateUom(control: AbstractControl): any {
    if (this.uom === undefined || this.uom.length === 0) {
      return null
    }

    const chosenValue = control.value

    if (HelperFunctions.isEmptyOrSpaces(chosenValue)) {
      return null
    }

    const wrong = this.uom.find(x => x.text === chosenValue) === undefined
    return wrong ? { invalidSelectedValue: { value: control.value } } : null;
  }

  private validateOrigin(control: AbstractControl): any {
    if (this.origins === undefined || this.origins.length === 0) {
      return null
    }

    const chosenValue = control.value

    if (HelperFunctions.isEmptyOrSpaces(chosenValue)) {
      return null
    }

    const wrong = this.origins.find(x => x.originDescription === chosenValue) === undefined
    return wrong ? { invalidSelectedValue: { value: control.value } } : null;
  }

  private validateVats(control: AbstractControl): any {
    if (this.vats === undefined || this.vats.length === 0) {
      return null
    }

    const chosenValue = control.value

    if (HelperFunctions.isEmptyOrSpaces(chosenValue)) {
      return null
    }

    const wrong = this.vats.find(x => x.vatRateDescription === chosenValue) === undefined
    return wrong ? { invalidSelectedValue: { value: control.value } } : null;
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(undefined, []),
      productCode: new FormControl(undefined, [Validators.required]),
      description: new FormControl(undefined, [Validators.required]),
      productGroup: new FormControl(undefined, [this.validateProductGroup.bind(this)]),
      origin: new FormControl(undefined, [this.validateOrigin.bind(this)]),
      unitOfMeasure: new FormControl(undefined, [Validators.required, this.validateUom.bind(this)]),
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
      vatRateCode: new FormControl(undefined, [this.validateVats.bind(this)]),
      noDiscount: new FormControl(false, []),
      unitWeight: new FormControl(undefined, []),
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
      this.bbxSidebarService,
      this.sidebarFormService,
      this,
      this.blankProductRow
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams({ 'PageNumber': newPageNumber }));
      },
    });
    this.dbDataTable.flatDesignForm.FillFormWithObject = (data: Product) => {
      if (!!data && !!this.dbDataTable.flatDesignForm) {
        data = {...data};

        data.origin = HelperFunctions.GetOriginDescription(data.origin, this.origins, '');

        if (HelperFunctions.isEmptyOrSpaces(data.productGroup) || HelperFunctions.isEmptyOrSpaces(data.productGroupCode)) {
          data.productGroup = undefined
        } else {
          const _productGroupFirstPart = data.productGroupCode + '-'
          const productGroupParts: string[] = data.productGroup?.split(_productGroupFirstPart)
          
          data.productGroup = HelperFunctions.GetProductGroupDescription(data.productGroupCode, this.productGroups, productGroupParts.pop());
        }

        Object.keys(this.dbDataTable.flatDesignForm.form.controls).forEach((x: string) => {
          this.dbDataTable.flatDesignForm!.form.controls[x].setValue(data[x as keyof Product]);
          if (environment.flatDesignFormDebug) {
            console.log(`[FillFormWithObject] with Product: ${x}, ${data[x as keyof Product]},
              ${this.dbDataTable.flatDesignForm!.form.controls[x].value}`);
          }
        });
      }
    }

    this.bbxSidebarService.collapse();

    this.RefreshAll(this.getInputParams());
  }

  override Refresh(params?: GetProductsParamListModel): void {
    if (!!this.Subscription_Refresh && !this.Subscription_Refresh.closed) {
      this.Subscription_Refresh.unsubscribe();
    }

    console.log('Refreshing');

    this.isLoading = true;
    this.Subscription_Refresh = this.seInv.GetAll(params).subscribe({
      next: this.getProductCallback.bind(this),
      error: (err) => {
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  async RefreshAsync(params?: GetProductsParamListModel): Promise<void> {
    console.log('Refreshing');
    this.isLoading = true;
    await lastValueFrom(this.seInv.GetAll(params))
      .then(this.getProductCallback.bind(this))
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => {
        this.isLoading = false;
      })
  }

  private async getProductCallback(response: GetProductsResponse): Promise<void> {
    if (!response.succeeded || !response.data) {
      this.bbxToastrService.showError(response.errors!.join('\n'))
      return
    }

    await this.RefreshComboValues();

    this.dbData = response.data.map((x) => {
      return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
    });
    this.dbDataDataSrc.setData(this.dbData);
    this.dbDataTable.SetPaginatorData(response);

    this.RefreshTable();
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.SetTableAndFormCommandListFromManager();

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.PushFooterCommandList();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  async RefreshComboValues(
    getProductGroups: boolean = true, getUom: boolean = true, getOrigins: boolean = true, getVatRes: boolean = true
  ): Promise<void> {
    if (getProductGroups) {
      const productGroupRes = await lastValueFrom(this.productGroupApi.GetAll({ PageSize: '1000' }));
      if (productGroupRes.succeeded && !!productGroupRes.data) {
        this.productGroups = productGroupRes.data;
      } else {
        this.cs.HandleError(productGroupRes.errors);
      }
    }
    if (getUom) {
      const uomRes = await lastValueFrom(this.seInv.GetAllUnitOfMeasures());
      if (!!uomRes && uomRes.length > 0) {
        this.uom = uomRes;
      }
    }
    if (getOrigins) {
      const originRes = await lastValueFrom(this.originApi.GetAll({ PageSize: '1000' }));
      if (originRes.succeeded && !!originRes.data) {
        this.origins = originRes.data;
      } else {
        this.cs.HandleError(originRes.errors);
      }
    }
    if (getVatRes) {
      const vatRes = await lastValueFrom(this.vatApi.GetAll({ PageSize: '1000' }));
      if (vatRes.succeeded && !!vatRes.data) {
        this.vats = vatRes.data;
      } else {
        this.cs.HandleError(vatRes.errors);
      }
    }
  }

  private RefreshAll(params?: GetProductsParamListModel): void {
    this.Refresh(params);
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onKeyDown2(event: KeyboardEvent) {
    if (this.khs.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      case KeyBindings.F11: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        break
      }
      case this.KeySetting[Actions.Lock].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        break;
      }
      case this.KeySetting[Actions.JumpToForm].KeyCode: {
        // TODO: 'active-prod-search' into global variable
        if ((event as any).target.id !== 'active-prod-search') {
          return;
        }

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.JumpToForm].KeyLabel} Pressed: ${this.KeySetting[Actions.JumpToForm].FunctionLabel}`);
        this.dbDataTable?.HandleSearchFieldTab();
        break;
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.ToggleForm].KeyLabel} Pressed: ${this.KeySetting[Actions.ToggleForm].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Create].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Create].KeyLabel} Pressed: ${this.KeySetting[Actions.Create].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Edit].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        if (this.kbS.ElementIdSelected.value === this.searchInputId) {
          break
        }

        console.log(`${this.KeySetting[Actions.Edit].KeyLabel} Pressed: ${this.KeySetting[Actions.Edit].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Delete].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Delete].KeyLabel} Pressed: ${this.KeySetting[Actions.Delete].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Reset].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        this.loggerService.info(`${this.KeySetting[Actions.Reset].KeyLabel} Pressed: ${this.KeySetting[Actions.Reset].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event)
        break
      }
      default: { }
    }
  }
}
