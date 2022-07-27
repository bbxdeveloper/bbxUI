import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { BlankInvCtrlPeriod, InvCtrlPeriod } from '../models/InvCtrlPeriod';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { StatusService } from 'src/app/services/status.service';
import { CreateInvCtrlPeriodRequest } from '../models/CreateInvCtrlPeriodRequest';
import { UpdateInvCtrlPeriodRequest } from '../models/UpdateInvCtrlPeriodRequest';
import { validDate } from 'src/assets/model/Validators';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { InventoryService } from '../services/inventory.service';
import { GetAllInvCtrlPeriodsParamListModel } from '../models/GetAllInvCtrlPeriodsParamListModel';
import { DeleteInvCtrlPeriodParamListModel } from '../models/DeleteInvCtrlPeriodParamListModel';
import { environment } from 'src/environments/environment';
import { GetFooterCommandListFromKeySettings, InventoryPeriodsKeySettings } from 'src/assets/util/KeyBindings';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { CloseInvCtrlPeriodParamListModel } from '../models/CloseInvCtrlPeriodParamListModel';
import { GetInvCtrlPeriodParamListModel } from '../models/GetInvCtrlPeriodParamListModel';

@Component({
  selector: 'app-inv-ctrl-period-manager',
  templateUrl: './inv-ctrl-period-manager.component.html',
  styleUrls: ['./inv-ctrl-period-manager.component.scss']
})
export class InvCtrlPeriodManagerComponent
  extends BaseManagerComponent<InvCtrlPeriod>
  implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  public override KeySetting: Constants.KeySettingsDct = InventoryPeriodsKeySettings;
  public override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  override allColumns = [
    'id',
    'warehouse',
    'dateFrom',
    'dateTo',
    'closed',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Azonosító',
      objectKey: 'id',
      colKey: 'id',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Raktár',
      objectKey: 'warehouse',
      colKey: 'warehouse',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '100%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kezdő dátum',
      objectKey: 'dateFrom',
      colKey: 'dateFrom',
      defaultValue: '',
      type: 'onlyDate',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Végdátum',
      objectKey: 'dateTo',
      colKey: 'dateTo',
      defaultValue: '',
      type: 'onlyDate',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Zárolt',
      objectKey: 'closed',
      colKey: 'closed',
      defaultValue: '',
      type: 'bool',
      fInputType: 'bool',
      fRequired: false,
      mask: '',
      colWidth: '100px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    }
  ];

  override get getInputParams(): GetAllInvCtrlPeriodsParamListModel {
    return {
      PageNumber: HelperFunctions.ToInt(this.dbDataTable.currentPage),
      PageSize: HelperFunctions.ToInt(this.dbDataTable.pageSize),
      SearchString: this.searchString ?? '',
    };
  }

  wareHouses: WareHouse[] = [];

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvCtrlPeriod>>,
    private seInv: InventoryService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    cs: CommonService,
    sts: StatusService,
    private wService: WareHouseService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'customer-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  private ConvertCombosForGet(data: InvCtrlPeriod): InvCtrlPeriod {
    if (data.warehouseID !== undefined && this.wareHouses.length > 0) {
      data.warehouseID =
        this.wareHouses.find((x) => x.id == data.warehouseID)?.warehouseDescription ?? '';
    }
    if (environment.managerComponentLogs) {
      console.log(`[ConvertCombosForGet] res: `, data);
    }
    return data;
  }

  private InvCtrlPeriodToCreateRequest(p: InvCtrlPeriod): CreateInvCtrlPeriodRequest {
    let warehouseID = HelperFunctions.ToInt(this.wareHouses.find(x => x.warehouseDescription === p.warehouseID)?.id ?? 0);
    const res = {
      id: HelperFunctions.ToInt(p.id),
      dateFrom: p.dateFrom,
      dateTo: p.dateTo,
      warehouseID: warehouseID,
    } as CreateInvCtrlPeriodRequest;
    if (environment.managerComponentLogs) {
      console.log(`[InvCtrlPeriodToCreateRequest] res: `, res);
    }
    return res;
  }

  private InvCtrlPeriodToUpdateRequest(p: InvCtrlPeriod): UpdateInvCtrlPeriodRequest {
    let warehouseID = HelperFunctions.ToInt(this.wareHouses.find(x => x.warehouseDescription === p.warehouseID)?.id ?? 0);
    p.warehouseID = warehouseID;
    p.id = HelperFunctions.ToInt(p.id);
    const res = {
      id: p.id,
      dateFrom: p.dateFrom,
      dateTo: p.dateTo,
      warehouseID: p.warehouseID
    } as UpdateInvCtrlPeriodRequest;
    if (environment.managerComponentLogs) {
      console.log(`[InvCtrlPeriodToUpdateRequest] res: `, res);
    }
    return res;
  }

  override ProcessActionLock(data?: IUpdateRequest<InvCtrlPeriod>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {
      data.data.id = parseInt(data.data.id + '');

      this.sts.pushProcessStatus(
        Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]
      );
      this.seInv.Close({ ID: data.data.id } as CloseInvCtrlPeriodParamListModel).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            this.seInv.Get({ ID: data.data.id } as GetInvCtrlPeriodParamListModel).subscribe({
              next: getRes => {
                const newRow = { data: this.ConvertCombosForGet(getRes) } as TreeGridNode<InvCtrlPeriod>;
                this.dbData[data.rowIndex] = newRow;
                this.dbDataTable.SetDataForForm(newRow, false, false);
                this.RefreshTable();
                this.simpleToastrService.show(
                  Constants.MSG_SAVE_SUCCESFUL,
                  Constants.TITLE_INFO,
                  Constants.TOASTR_SUCCESS_5_SEC
                );
                this.dbDataTable.flatDesignForm.SetFormStateToDefault();
                this.isLoading = false;
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);
              },
              error: (err) => {
                this.cs.HandleError(err);
                this.isLoading = false;
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);
              },
            });
          } else {
            console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
            this.bbxToastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          }
        },
        error: (err) => {
          this.cs.HandleError(err);
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        },
      });
    }
  }

  override ProcessActionNew(data?: IUpdateRequest<InvCtrlPeriod>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {
      data.data.id = parseInt(data.data.id + ''); // TODO

      const createRequest = this.InvCtrlPeriodToCreateRequest(data.data);

      this.sts.pushProcessStatus(
        Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]
      );
      this.seInv.Create(createRequest).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            const newRow = { data: this.ConvertCombosForGet(d.data) } as TreeGridNode<InvCtrlPeriod>;
            this.dbData.push(newRow);
            this.dbDataTable.SetDataForForm(newRow, false, false);
            this.RefreshTable(newRow.data.id);
            this.simpleToastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
            this.dbDataTable.flatDesignForm.SetFormStateToDefault();
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          } else {
            console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
            this.bbxToastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          }
        },
        error: (err) => {
          this.cs.HandleError(err);
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        },
      });
    }
  }

  override ProcessActionPut(data?: IUpdateRequest<InvCtrlPeriod>): void {
    console.log(
      'ActionPut: ',
      data?.data,
      JSON.stringify(data?.data),
      typeof data?.data.id
    );
    if (!!data && !!data.data) {
      data.data.id = parseInt(data.data.id + ''); // TODO

      const updateRequest = this.InvCtrlPeriodToUpdateRequest(data.data);

      console.log(data.data.id);
      this.sts.pushProcessStatus(
        Constants.CRUDPutStatuses[Constants.CRUDPutPhases.UPDATING]
      );
      this.seInv.Update(updateRequest).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            const newRow = { data: this.ConvertCombosForGet(d.data) } as TreeGridNode<InvCtrlPeriod>;
            this.dbData[data.rowIndex] = newRow;
            this.dbDataTable.SetDataForForm(newRow, false, false);
            this.RefreshTable();
            this.simpleToastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
            this.dbDataTable.flatDesignForm.SetFormStateToDefault();
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          } else {
            this.bbxToastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          }
        },
        error: (err) => {
          this.cs.HandleError(err);
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        },
      });
    }
  }

  override ProcessActionDelete(data?: IUpdateRequest<InvCtrlPeriod>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);
    if (id !== undefined) {
      this.sts.pushProcessStatus(
        Constants.CRUDDeleteStatuses[Constants.CRUDDeletePhases.DELETING]
      );
      this.seInv
        .Delete({
          ID: id,
        } as DeleteInvCtrlPeriodParamListModel)
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
              this.bbxToastrService.show(
                d.errors!.join('\n'),
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR
              );
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            }
          },
          error: (err) => {
            this.cs.HandleError(err);
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          },
        });
    }
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(0, []),
      warehouseID: new FormControl(undefined, [Validators.required]),
      dateFrom: new FormControl(undefined, [Validators.required, validDate]),
      dateTo: new FormControl(undefined, [Validators.required, validDate]),
      closed: new FormControl(undefined, []),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'InvCtrlPeriod',
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
        return BlankInvCtrlPeriod();
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

  private RefreshAll(params?: GetAllInvCtrlPeriodsParamListModel): void {
    this.wService.GetAll().subscribe({
      next: (data) => {
        if (!!data && !!data?.data) this.wareHouses = data?.data;
      },
      error: (err) => {
        this.cs.HandleError(err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
    this.Refresh(params);
  }

  override Refresh(params?: GetAllInvCtrlPeriodsParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.seInv.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetInvCtrlPeriods response: ', d); // TODO: only for debug
          if (!!d) {
            this.dbData = d.data.map((x) => {
              return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
            });
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.currentPage = d.pageNumber;
            this.dbDataTable.allPages = this.GetPageCount(
              d.recordsFiltered,
              d.pageSize
            );
            this.dbDataTable.totalItems = d.recordsFiltered;
            this.dbDataTable.itemsOnCurrentPage = this.dbData.length;
          }
          this.RefreshTable();
        } else {
          this.bbxToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
      },
      error: (err) => {
        this.HandleError(err);
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
}
