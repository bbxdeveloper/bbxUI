import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
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
import { notWhiteSpaceOrNull, validDate } from 'src/assets/model/Validators';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { InventoryService } from '../services/inventory.service';
import { GetAllInvCtrlPeriodsParamListModel } from '../models/GetAllInvCtrlPeriodsParamListModel';
import { DeleteInvCtrlPeriodParamListModel } from '../models/DeleteInvCtrlPeriodParamListModel';
import { environment } from 'src/environments/environment';
import { Actions, GetFooterCommandListFromKeySettings, InventoryPeriodsKeySettings } from 'src/assets/util/KeyBindings';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { CloseInvCtrlPeriodParamListModel } from '../models/CloseInvCtrlPeriodParamListModel';
import { GetInvCtrlPeriodParamListModel } from '../models/GetInvCtrlPeriodParamListModel';
import { lastValueFrom } from 'rxjs';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { LoggerService } from 'src/app/services/logger.service';

@Component({
  selector: 'app-inv-ctrl-period-manager',
  templateUrl: './inv-ctrl-period-manager.component.html',
  styleUrls: ['./inv-ctrl-period-manager.component.scss']
})
export class InvCtrlPeriodManagerComponent
  extends BaseManagerComponent<InvCtrlPeriod>
  implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  firstRefresh: boolean = true;

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
      label: 'Lezárt',
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

  idParam?: number;
  override get getInputParams(): GetAllInvCtrlPeriodsParamListModel {
    const params = {
      PageNumber: HelperFunctions.ToInt(this.dbDataTable.currentPage),
      PageSize: HelperFunctions.ToInt(this.dbDataTable.pageSize),
      SearchString: this.searchString ?? '',
      ID: this.idParam
    };
    this.idParam = undefined;
    return params;
  }

  public ReadonlyPredicator: (x: InvCtrlPeriod) => boolean = (x: InvCtrlPeriod) => {
    if (!!x) {
      return x.closed;
    }
    return false;
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
    private wService: WareHouseService,
    private khs: KeyboardHelperService,
    loggerService: LoggerService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'inv-ctrl-period-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  override GetRecordName(data: InvCtrlPeriod): string | number | undefined {
    const convertDate = (dateString: string): string => {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    }

    return `${data.warehouseID} - ${convertDate(data.dateFrom)} - ${convertDate(data.dateTo)}`
  }

  private ConvertCombosForGet(data: InvCtrlPeriod): InvCtrlPeriod {
    if (!!!data.warehouse) {
      let warehouse = this.wareHouses.find(x => x.id === data.warehouseID);
      if (!!warehouse) {
        data.warehouse = warehouse.warehouseCode + "-" + warehouse.warehouseDescription;
      }
    }
    if (data.warehouseID !== undefined && this.wareHouses.length > 0) {
      data.warehouseID =
        this.wareHouses.find((x) => x.id == data.warehouseID)?.warehouseDescription ?? '';
    }
    if (environment.managerComponentLogs) {
      console.log(`[ConvertCombosForGet] res: `, data);
    }
    return data;
  }

  private async InvCtrlPeriodToCreateRequest(p: InvCtrlPeriod): Promise<CreateInvCtrlPeriodRequest> {
    const _wareHouses = await this.GetWareHouses();
    let warehouseID;
    if (!!_wareHouses) {
      this.wareHouses = _wareHouses;
      warehouseID = HelperFunctions.ToInt(this.wareHouses.find(x => x.warehouseDescription === p.warehouseID)?.id ?? 0);
    }
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

  private async InvCtrlPeriodToUpdateRequest(p: InvCtrlPeriod): Promise<UpdateInvCtrlPeriodRequest> {
    const _wareHouses = await this.GetWareHouses();
    let warehouseID;
    if (!!_wareHouses) {
      this.wareHouses = _wareHouses;
      warehouseID = HelperFunctions.ToInt(this.wareHouses.find(x => x.warehouseDescription === p.warehouseID)?.id ?? 0);
    }
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
    console.log('ActionLock: ', data?.data);
    if (!!data && !!data.data) {
      data.data.id = parseInt(data.data.id + '');

      this.sts.pushProcessStatus(
        Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]
      );
      this.seInv.Close({ ID: data.data.id } as CloseInvCtrlPeriodParamListModel).subscribe({
        next: (d) => {
          if (d.succeeded) {
            this.seInv.Get({ ID: data.data.id } as GetInvCtrlPeriodParamListModel).subscribe({
              next: getRes => {
                const index = this.dbData.findIndex(x => x.data.id === data.data.id);
                this.dbData[index].data.closed = true;
                this.dbDataTable.SetDataForForm(this.dbData[index], false, false);
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
                this.HandleError(err);
              },
            });
          } else {
            console.log(d.errors!, d.errors?.join('\n'), d.errors?.join(', '));
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

  override ProcessActionNew(data?: IUpdateRequest<InvCtrlPeriod>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {
      data.data.id = HelperFunctions.ToInt(data.data.id + '');

      this.InvCtrlPeriodToCreateRequest(data.data)
        .then(async createRequest => {
          this.sts.pushProcessStatus(
            Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]
          );
          await this.seInv.Create(createRequest).subscribe({
            next: async (d) => {
              if (d.succeeded && !!d.data) {
                this.idParam = d.data.id;
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                await this.RefreshAsync(this.getInputParams);
                this.dbDataTable.SelectRowById(d.data.id);
                this.simpleToastrService.show(
                  Constants.MSG_SAVE_SUCCESFUL,
                  Constants.TITLE_INFO,
                  Constants.TOASTR_SUCCESS_5_SEC
                );
              } else {
                this.dbDataTable.SetFormReadonly(false)
                this.HandleError(d.errors)
              }
            },
            error: (err) => {
              this.HandleError(err);
              this.dbDataTable.SetFormReadonly(false)
            },
          });
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
      data.data.id = HelperFunctions.ToInt(data.data.id + '');

      this.InvCtrlPeriodToUpdateRequest(data.data)
        .then(updateRequest => {
          console.log(data.data.id);
          this.sts.pushProcessStatus(
            Constants.CRUDPutStatuses[Constants.CRUDPutPhases.UPDATING]
          );
          this.seInv.Update(updateRequest).subscribe({
            next: (d) => {
              if (d.succeeded && !!d.data) {
                d.data.warehouse = this.GetWareHouseFieldById(d.data.warehouseID);
                const newRow = { data: this.ConvertCombosForGet(d.data) } as TreeGridNode<InvCtrlPeriod>;
                const index = this.dbData.findIndex(x => x.data.id === data.data.id);
                this.dbData[index] = newRow;
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
                this.simpleToastrService.show(
                  d.errors!.join('\n'),
                  Constants.TITLE_ERROR,
                  Constants.TOASTR_ERROR_5_SEC
                );
                this.isLoading = false;
                this.dbDataTable.SetFormReadonly(false)
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                this.kbS.ClickCurrentElement()
              }
            },
            error: (err) => {
              this.HandleError(err);
              this.dbDataTable.SetFormReadonly(false)
            },
          });
        });
    }
  }

  override ProcessActionDelete(data?: IUpdateRequest<InvCtrlPeriod>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);
    if (id !== undefined) {
      this.sts.pushProcessStatus(
        Constants.DeleteStatuses[Constants.DeletePhases.DELETING]
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
            this.cs.HandleError(err);
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          },
        });
    }
  }

  GetWareHouseFieldById(wareHouseId: number): string {
    const w = this.wareHouses.find(x => x.id === wareHouseId);
    const res = w?.warehouseCode + "-" + w?.warehouseDescription;
    return res;
  }

  async GetWareHouses(): Promise<WareHouse[] | undefined> {
    const wareHousesResponse = await lastValueFrom(this.wService.GetAll({ PageSize: '1000' }));

    if (wareHousesResponse.succeeded && !!wareHousesResponse.data && wareHousesResponse.data?.length > 0) {
      return wareHousesResponse.data;
    } else {
      this.cs.HandleError(wareHousesResponse.errors);
      return Promise.reject();
    }
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(0, []),
      warehouseID: new FormControl(undefined, [Validators.required, notWhiteSpaceOrNull]),
      dateFrom: new FormControl(undefined, [Validators.required, validDate]),
      dateTo: new FormControl(undefined, [Validators.required, validDate]),
      closed: new FormControl({value: false, disabled: true}, []),
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
      this.bbxSidebarService,
      this.sidebarFormService,
      this,
      () => {
        return BlankInvCtrlPeriod();
      },
      false
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams);
      },
    });
    this.dbDataTable.ReadonlyPredicator = this.ReadonlyPredicator;

    this.bbxSidebarService.collapse();

    this.RefreshAll(this.getInputParams);
  }

  private RefreshAll(params?: GetAllInvCtrlPeriodsParamListModel): void {
    this.Refresh(params);
  }

  override Refresh(params?: GetAllInvCtrlPeriodsParamListModel): void {
    this.isLoading = true;
    this.sts.waitForLoad(true)
    this.seInv.GetAll(params).subscribe({
      next: async (d) => {
        if (d.succeeded && !!d.data) {
          const wHouses = await this.GetWareHouses();
          if (!!wHouses) {
            this.wareHouses = wHouses;
          }
          if (!!d) {
            this.dbData = d.data.map((x) => {
              return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
            });
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable();
          setTimeout(() => {
            if (this.firstRefresh) {
              this.firstRefresh = false;
              this.kbS.SetCurrentNavigatable(this.dbDataTable);
              this.kbS.SelectElementByCoordinate(0,0);
              this.kbS.SelectCurrentElement();
            }
          }, 300);
        } else {
          this.sts.waitForLoad(false)
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          );
        }
      },
      error: (err) => {
        this.sts.waitForLoad(false)
        this.HandleError(err);
      },
      complete: () => {
        this.isLoading = false;
        this.sts.waitForLoad(false)
      },
    });
  }

  async RefreshAsync(params?: GetAllInvCtrlPeriodsParamListModel): Promise<void> {
    this.isLoading = true;
    this.sts.waitForLoad(true)
    await lastValueFrom(this.seInv.GetAll(params))
      .then(async d => {
        if (d.succeeded && !!d.data) {
          const wHouses = await this.GetWareHouses();
          if (!!wHouses) {
            this.wareHouses = wHouses;
          }
          if (!!d) {
            this.dbData = d.data.map((x) => {
              return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
            });
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable();
          setTimeout(() => {
            if (this.firstRefresh) {
              this.firstRefresh = false;
              this.kbS.SetCurrentNavigatable(this.dbDataTable);
              this.kbS.SelectElementByCoordinate(0, 0);
              this.kbS.SelectCurrentElement();
            }
          }, 300);
        } else {
          this.sts.waitForLoad(false)
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          )
        }
      })
      .catch(err => {
        this.sts.waitForLoad(false)
        this.HandleError(err)
      })
      .finally(() => {
        this.isLoading = false
        this.sts.waitForLoad(false)
      });
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.SetTableAndFormCommandListFromManager();

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.PushFooterCommandList();

    //this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
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
      case this.KeySetting[Actions.Lock].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Lock].KeyLabel} Pressed: ${this.KeySetting[Actions.Lock].FunctionLabel}`);
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
