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
import { Counter } from '../models/Counter';
import { CounterService } from '../services/counter.service';
import { DeleteCounterRequest } from '../models/DeleteCounterRequest';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { GetCountersParamListModel } from '../models/GetCountersParamListModel';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { UpdateCounterRequest } from '../models/UpdateCounterRequest';
import { WareHouse, WareHouseDescriptionToCode } from '../../warehouse/models/WareHouse';
import { CreateCounterRequest } from '../models/CreateCounterRequest';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-counter-manager',
  templateUrl: './counter-manager.component.html',
  styleUrls: ['./counter-manager.component.scss'],
})
export class CounterManagerComponent extends BaseManagerComponent<Counter> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  override allColumns = [
    'counterCode',
    'counterDescription',
    'warehouse',
    'prefix',
    'currentNumber',
    'numbepartLength',
    'suffix',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Kód',
      objectKey: 'counterCode',
      colKey: 'counterCode',
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
      objectKey: 'counterDescription',
      colKey: 'counterDescription',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Raktár',
      objectKey: 'warehouse',
      colKey: 'warehouse',
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
      label: 'Prefix',
      objectKey: 'prefix',
      colKey: 'prefix',
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
      label: 'Számláló',
      objectKey: 'currentNumber',
      colKey: 'currentNumber',
      defaultValue: '',
      type: 'formatted-number',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Számláló számjegyek száma',
      objectKey: 'numbepartLength',
      colKey: 'numbepartLength',
      defaultValue: '',
      type: 'formatted-number',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Lezárójel',
      objectKey: 'suffix',
      colKey: 'suffix',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
  ];

  // CounterGroup
  wareHouses: WareHouse[] = [];

  override get getInputParams(): GetCountersParamListModel {
    return { PageNumber: this.dbDataTable.currentPage + '', PageSize: this.dbDataTable.pageSize, SearchString: this.searchString ?? '' };
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Counter>>,
    private seInv: CounterService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private cs: CommonService,
    private wareHouseApi: WareHouseService
  ) {
    super(dialogService, kbS, fS, sidebarService);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'counter-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  private ConvertCombosForPost(data: Counter): Counter {
    if (data.warehouse !== undefined && this.wareHouses.length > 0)
      data.warehouse = WareHouseDescriptionToCode(
        data.warehouse,
        this.wareHouses
      );

    return data;
  }

  private ConvertCombosForGet(data: Counter): Counter {
    // if (data.warehouse !== undefined && this.wareHouses.length > 0)
    //   data.warehouse = WareHouseCodeToDescription(
    //     data.warehouse,
    //     this.wareHouses
    //   );

    if (environment.flatDesignCRUDManagerDebug) {
        console.log(`[ConvertCombosForGet] result: `, data);
    }

    return data;
  }

  private CounterToCreateRequest(p: Counter): CreateCounterRequest {
    let wareHouseCode = !!p.warehouse?.includes('-') ? p.warehouse.split('-')[0] : '';

    const res = {
      counterCode: p.counterCode,
      counterDescription: p.counterDescription,
      warehouse: wareHouseCode,
      prefix: p.prefix,
      currentNumber: p.currentNumber,
      numbepartLength: p.numbepartLength,
      suffix: p.suffix
    } as CreateCounterRequest;
    return res;
  }

  private CounterToUpdateRequest(p: Counter): UpdateCounterRequest {
    let wareHouseCode = !!p.warehouse?.includes('-') ? p.warehouse.split('-')[0] : '';

    const res = {
      id: parseInt(p.id + ''), // TODO
      counterCode: p.counterCode,
      counterDescription: p.counterDescription,
      warehouse: wareHouseCode,
      prefix: p.prefix,
      currentNumber: p.currentNumber,
      numbepartLength: p.numbepartLength,
      suffix: p.suffix
    } as UpdateCounterRequest;
    return res;
  }

  override ProcessActionNew(data?: IUpdateRequest<Counter>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {

      const createRequest = this.CounterToCreateRequest(data.data);

      console.log('ActionNew request: ', createRequest);

      this.seInv.Create(createRequest).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            this.seInv.Get({ ID: d.data.id }).subscribe({
              next: newData => {
                if (!!newData) {
                  d.data = this.ConvertCombosForGet(newData);
                  console.log("New counter: ", d.data);
                  const newRow = { data: newData } as TreeGridNode<Counter>;
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

  override ProcessActionPut(data?: IUpdateRequest<Counter>): void {
    console.log('ActionPut: ', data?.data, JSON.stringify(data?.data));
    if (!!data && !!data.data) {

      const updateRequest = this.CounterToUpdateRequest(data.data);

      console.log('ActionPut request: ', updateRequest);

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
                  } as TreeGridNode<Counter>
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

  override ProcessActionDelete(data?: IUpdateRequest<Counter>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);
    if (id !== undefined) {
      this.seInv
        .Delete({
          id: id,
        } as DeleteCounterRequest)
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

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(0, []),
      counterCode: new FormControl('', [Validators.required]),
      counterDescription: new FormControl('', [Validators.required]),
      warehouse: new FormControl('', [Validators.required]),
      prefix: new FormControl('', [Validators.required]),
      currentNumber: new FormControl(0, [Validators.required]),
      numbepartLength: new FormControl(0, [Validators.required]),
      suffix: new FormControl('', [Validators.required]),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'Counter',
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
          counterCode: '',
          counterDescription: '',
          warehouse: this.wareHouses[0]?.warehouseDescription,
          prefix: '',
          currentNumber: 0,
          numbepartLength: 0,
          suffix: ''
        } as Counter;
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams);
      },
    });

    this.sidebarService.collapse();

    this.RefreshAll(this.getInputParams);
  }

  override Refresh(params?: GetCountersParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.seInv.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetCounters response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.currentPage = d.pageNumber;
            this.dbDataTable.allPages = Math.round(d.recordsTotal / d.pageSize);
            this.dbDataTable.totalItems = d.recordsTotal;
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
        this.cs.HandleError(err);
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

  private RefreshAll(params?: GetCountersParamListModel): void {
    this.wareHouseApi.GetAll().subscribe({
      next: (data) => {
        if (!!data.data) this.wareHouses = data.data;
      },
      error: (err) => {
        this.cs.HandleError(err);
        this.isLoading = false;
      },
      complete: () => {
        this.Refresh(params);
      },
    });
  }
}
