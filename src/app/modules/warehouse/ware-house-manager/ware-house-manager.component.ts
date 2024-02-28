import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { DeleteWareHouseRequest } from '../models/DeleteWareHouseRequest';
import { GetWareHousesParamListModel } from '../models/GetWareHousesParamListModel';
import { BlankWareHouse, WareHouse } from '../models/WareHouse';
import { WareHouseService } from '../services/ware-house.service';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { StatusService } from 'src/app/services/status.service';
import { Actions } from 'src/assets/util/KeyBindings';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { lastValueFrom } from 'rxjs';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { LoggerService } from 'src/app/services/logger.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

@Component({
  selector: 'app-ware-house-manager',
  templateUrl: './ware-house-manager.component.html',
  styleUrls: ['./ware-house-manager.component.scss']
})
export class WareHouseManagerComponent extends BaseManagerComponent<WareHouse> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  override allColumns = ['id', 'warehouseCode', 'warehouseDescription'];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Azonosító',
      objectKey: 'id',
      colKey: 'id',
      defaultValue: '',
      type: 'number',
      fInputType: 'readonly',
      mask: '',
      colWidth: '100px',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kód',
      objectKey: 'warehouseCode',
      colKey: 'warehouseCode',
      defaultValue: '',
      type: 'string',
      fInputType: 'code-field',
      fRequired: true,
      mask: '',
      colWidth: '50%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Név',
      objectKey: 'warehouseDescription',
      colKey: 'warehouseDescription',
      defaultValue: '',
      type: 'string',
      fRequired: true,
      fInputType: 'text',
      mask: 'Set in sidebar form.',
      colWidth: '50%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
      fLast: true
    },
  ];

  idParam?: number;
  public override getInputParams(override?: Constants.Dct): GetWareHousesParamListModel {
    const params = {
      ID: this.idParam,
      PageNumber: 1 + '',
      PageSize: this.dbDataTable.pageSize,
      SearchString: this.searchString ?? '',
      OrderBy: 'warehouseCode'
    }
    this.idParam = undefined
    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"] + ''
    }
    return params
  }

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<WareHouse>>,
    private seInv: WareHouseService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    cs: CommonService,
    sts: StatusService,
    private khs: KeyboardHelperService,
    loggerService: LoggerService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'warehouse-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  override GetRecordName(data: WareHouse): string | number | undefined {
    return data.warehouseCode
  }

  override ProcessActionNew(data?: IUpdateRequest<WareHouse>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {
      data.data.id = HelperFunctions.ToInt(data.data.id);
      this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);
      this.seInv.Create(data.data).subscribe({
        next: async d => {
          if (d.succeeded && !!d.data) {
            this.idParam = d.data.id;
            await this.RefreshAsync(this.getInputParams());
            this.dbDataTable.SelectRowById(d.data.id);
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
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
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            this.dbDataTable.SetFormReadonly(false)
            this.kbS.ClickCurrentElement()
          }
        },
        error: (err) => {
          this.HandleError(err);
          this.dbDataTable.SetFormReadonly(false)
        },
      });
    }
  }

  override ProcessActionPut(data?: IUpdateRequest<WareHouse>): void {
    console.log('ActionPut: ', data?.data, JSON.stringify(data?.data));
    if (!!data && !!data.data) {
      data.data.id = HelperFunctions.ToInt(data.data.id);
      this.sts.pushProcessStatus(Constants.CRUDPutStatuses[Constants.CRUDPutPhases.UPDATING]);
      this.seInv.Update(data.data).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            const newRow = {
              data: d.data,
            } as TreeGridNode<WareHouse>;
            const newRowIndex = this.dbData.findIndex(x => x.data.id === newRow.data.id);
            this.dbData[newRowIndex !== -1 ? newRowIndex : data.rowIndex] = newRow;
            this.dbDataTable.SetDataForFormAndOpen(newRow, false, false);
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
            this.simpleToastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR_5_SEC
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            this.dbDataTable.SetFormReadonly(false)
            this.kbS.ClickCurrentElement()
          }
        },
        error: (err) => {
          this.HandleError(err);
          this.dbDataTable.SetFormReadonly(false)
        },
      });
    }
  }

  override ProcessActionDelete(data?: IUpdateRequest<WareHouse>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);
    if (id !== undefined) {
      this.sts.pushProcessStatus(Constants.DeleteStatuses[Constants.DeletePhases.DELETING]);
      this.seInv
        .Delete({
          id: id,
        } as DeleteWareHouseRequest)
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
          error: (err) => { this.HandleError(err); },
        });
    }
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(0, []),
      warehouseCode: new FormControl(undefined, [Validators.required]),
      warehouseDescription: new FormControl(undefined, [Validators.required]),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'WareHouse',
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
        return BlankWareHouse();
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams({ 'PageNumber': newPageNumber }));
      },
    });

    this.bbxSidebarService.collapse();

    this.Refresh(this.getInputParams());
  }

  override Refresh(params?: GetWareHousesParamListModel): void {
    if (!!this.Subscription_Refresh && !this.Subscription_Refresh.closed) {
      this.Subscription_Refresh.unsubscribe();
    }

    console.log('Refreshing');

    this.isLoading = true;
    this.Subscription_Refresh = this.seInv.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          if (!!d) {
            this.dbData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
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
      error: (err) => { this.cs.HandleError(err); this.isLoading = false; this.RefreshTable(); },
      complete: () => {
        this.isLoading = false;
        this.RefreshTable();
      },
    });
  }

  async RefreshAsync(params?: GetWareHousesParamListModel): Promise<void> {
    console.log('Refreshing');
    this.isLoading = true;
    await lastValueFrom(this.seInv.GetAll(params))
      .then(d => {
        if (d.succeeded && !!d.data) {
          if (!!d) {
            this.dbData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
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
      })
      .catch(err => {
        this.cs.HandleError(err); this.isLoading = false; this.RefreshTable();
      })
      .finally(() => {
        this.isLoading = false;
        this.RefreshTable();
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

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onKeyDown2(event: KeyboardEvent) {
    if (this.khs.IsKeyboardBlocked) {
      HelperFunctions.StopEvent(event)
      return;
    }
    switch (event.key) {
      case this.KeySetting[Actions.Lock].KeyCode: {
        HelperFunctions.StopEvent(event)
        break;
      }
      case this.KeySetting[Actions.JumpToForm].KeyCode: {
        // TODO: 'active-prod-search' into global variable
        if ((event as any).target.id !== 'active-prod-search') {
          return;
        }

        HelperFunctions.StopEvent(event)

        console.log(`${this.KeySetting[Actions.JumpToForm].KeyLabel} Pressed: ${this.KeySetting[Actions.JumpToForm].FunctionLabel}`);
        this.dbDataTable?.HandleSearchFieldTab();
        break;
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          break
        }

        console.log(`${this.KeySetting[Actions.ToggleForm].KeyLabel} Pressed: ${this.KeySetting[Actions.ToggleForm].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Create].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          break
        }

        console.log(`${this.KeySetting[Actions.Create].KeyLabel} Pressed: ${this.KeySetting[Actions.Create].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          return
        }

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Edit].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.kbS.ElementIdSelected.value === this.searchInputId) {
          break
        }

        if (this.isDialogOpened) {
          break
        }

        console.log(`${this.KeySetting[Actions.Edit].KeyLabel} Pressed: ${this.KeySetting[Actions.Edit].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Delete].KeyCode: {
        HelperFunctions.StopEvent(event)

        console.log(`${this.KeySetting[Actions.Delete].KeyLabel} Pressed: ${this.KeySetting[Actions.Delete].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Reset].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          return
        }

        this.loggerService.info(`${this.KeySetting[Actions.Reset].KeyLabel} Pressed: ${this.KeySetting[Actions.Reset].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event)
        break
      }
      default: { }
    }
  }
}