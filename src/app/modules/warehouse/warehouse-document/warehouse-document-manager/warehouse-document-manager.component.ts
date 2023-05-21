import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { lastValueFrom } from 'rxjs';
import { OriginService } from 'src/app/modules/origin/services/origin.service';
import { ProductGroupService } from 'src/app/modules/product-group/services/product-group.service';
import { GetProductsParamListModel } from 'src/app/modules/product/models/GetProductsParamListModel';
import { Product } from 'src/app/modules/product/models/Product';
import { ProductService } from 'src/app/modules/product/services/product.service';
import { BaseManagerComponent } from 'src/app/modules/shared/base-manager/base-manager.component';
import { VatRateService } from 'src/app/modules/vat-rate/services/vat-rate.service';
import { WhsTransferFull } from 'src/app/modules/whs/models/WhsTransfer';
import { WhsTransferLine, WhsTransferLineFull } from 'src/app/modules/whs/models/WhsTransferLine';
import { WhsTransferQueryParams } from 'src/app/modules/whs/models/WhsTransferQueryParams';
import { WhsService } from 'src/app/modules/whs/services/whs.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Actions, GetFooterCommandListFromKeySettings, WarehouseDocumentsKeySettings } from 'src/assets/util/KeyBindings';
import { environment } from 'src/environments/environment';
import { WarehouseDocumentFilterFormData } from '../warehouse-document-filter-form/WarehouseDocumentFilterFormData';

@Component({
  selector: 'app-warehouse-document-manager',
  templateUrl: './warehouse-document-manager.component.html',
  styleUrls: ['./warehouse-document-manager.component.scss']
})
export class WarehouseDocumentManagerComponent extends BaseManagerComponent<WhsTransferFull> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  public override KeySetting: Constants.KeySettingsDct = WarehouseDocumentsKeySettings;
  public override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  override allColumns = [
    'whsTransferNumber',
    'fromWarehouse',
    'toWarehouse',
    'transferDate',
    'whsTransferStatusX',
    'whsTransferAmount',
    'user',
    'notice',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Bizonylatszám',
      objectKey: 'whsTransferNumber',
      colKey: 'whsTransferNumber',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '200px',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kiadás raktár',
      objectKey: 'fromWarehouse',
      colKey: 'fromWarehouse',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '35%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Bevétel raktár',
      objectKey: 'toWarehouse',
      colKey: 'toWarehouse',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '35%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Dátum',
      objectKey: 'transferDate',
      colKey: 'transferDate',
      defaultValue: '',
      type: 'onlyDate',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Státusz',
      objectKey: 'whsTransferStatusX',
      colKey: 'whsTransferStatusX',
      defaultValue: '',
      type: 'string',
      fRequired: true,
      mask: '',
      colWidth: '85px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Érték',
      objectKey: 'whsTransferAmount',
      colKey: 'whsTransferAmount',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Felhasználó',
      objectKey: 'user',
      colKey: 'user',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '200px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megjegyzés',
      objectKey: 'notice',
      colKey: 'notice',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
  ];

  private filterData: WarehouseDocumentFilterFormData = {} as WarehouseDocumentFilterFormData
  override get getInputParams(): WhsTransferQueryParams {
    const params = {
      WhsTransferStatus: this.filterData.Status,
      FromWarehouseCode: this.filterData.FromWarehouseCode,
      ToWarehouseCode: this.filterData.ToWarehouseCode,
      TransferDateFrom: this.filterData.FromDate,
      TransferDateTo: this.filterData.ToDate,
      Deleted: false,
      OrderBy: "whsTransferNumber",
      PageNumber: HelperFunctions.ToInt(this.dbDataTable.currentPage + ''),
      PageSize: HelperFunctions.ToInt(this.dbDataTable.pageSize)
    } as WhsTransferQueryParams;
    return params;
  }

  get blankRow(): () => WhsTransferFull {
    return () => {
      return new WhsTransferFull()
    }
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<WhsTransferFull>>,
    private whsService: WhsService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    cs: CommonService,
    sts: StatusService,
    private khs: KeyboardHelperService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'product-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      whsTransferNumber: new FormControl(undefined, []),
      fromWarehouse: new FormControl(undefined, []),
      toWarehouse: new FormControl(undefined, []),
      transferDate: new FormControl(undefined, []),
      whsTransferStatusX: new FormControl(undefined, []),
      whsTransferAmount: new FormControl(undefined, []),
      user: new FormControl(undefined, []),
      notice: new FormControl(undefined, []),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'WarehouseDocumentManager',
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
      this.blankRow
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams);
      },
    });
    // this.dbDataTable.flatDesignForm.FillFormWithObject = (data: Product) => {
    //   if (!!data && !!this.dbDataTable.flatDesignForm) {
    //     data = { ...data };

    //     data.origin = HelperFunctions.GetOriginDescription(data.origin, this.origins, '');
    //     data.productGroup = HelperFunctions.GetProductGroupDescription(data.productGroup, this.productGroups, '');

    //     Object.keys(this.dbDataTable.flatDesignForm.form.controls).forEach((x: string) => {
    //       this.dbDataTable.flatDesignForm!.form.controls[x].setValue(data[x as keyof Product]);
    //       if (environment.flatDesignFormDebug) {
    //         console.log(`[FillFormWithObject] with Product: ${x}, ${data[x as keyof Product]},
    //           ${this.dbDataTable.flatDesignForm!.form.controls[x].value}`);
    //       }
    //     });
    //   }
    // }

    this.bbxSidebarService.collapse();

    this.isLoading = false;
  }

  public refreshClicked(filterData: WarehouseDocumentFilterFormData | undefined): void {
    this.filterData = filterData ?? {} as WarehouseDocumentFilterFormData;
    this.RefreshAll(this.getInputParams);
  }

  override Refresh(params?: WhsTransferQueryParams): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.whsService.GetAll(params).subscribe({
      next: async (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetProducts response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() }; // this.ConvertCombosForGet(x)
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable();
        } else {
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
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

  async RefreshAsync(params?: WhsTransferQueryParams): Promise<void> {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;

    await lastValueFrom(this.whsService.GetAll(params))
      .then(async d => {
        if (d.succeeded && !!d.data) {
          console.log('GetProducts response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() }; // this.ConvertCombosForGet(x)
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable(undefined, true);
        } else {
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          );
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => {
        this.isLoading = false;
      })
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  public filterFormPageReady(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)

    this.SetTableAndFormCommandListFromManager()

    this.dbDataTable.GenerateAndSetNavMatrices(true)
    this.dbDataTable.PushFooterCommandList()
  }

  private RefreshAll(params?: WhsTransferQueryParams): void {
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
      case this.KeySetting[Actions.Print].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Print].KeyLabel} Pressed: ${this.KeySetting[Actions.Print].FunctionLabel}`);
        
        break;
      }
      case this.KeySetting[Actions.CSV].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.CSV].KeyLabel} Pressed: ${this.KeySetting[Actions.CSV].FunctionLabel}`);

        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.RefreshAll(this.getInputParams);
        break;
      }
      case this.KeySetting[Actions.Edit].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

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
      default: { }
    }
  }

}
