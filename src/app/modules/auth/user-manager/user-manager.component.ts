import {ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild} from '@angular/core';
import {ModelFieldDescriptor} from 'src/assets/model/ModelFieldDescriptor';
import {NbTable, NbTreeGridDataSourceBuilder} from '@nebular/theme';
import {FooterService} from 'src/app/services/footer.service';
import {KeyboardModes, KeyboardNavigationService} from 'src/app/services/keyboard-navigation.service';
import {TreeGridNode} from 'src/assets/model/TreeGridNode';
import {User} from '../models/User';
import {UserService} from '../services/user.service';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {SideBarFormService} from 'src/app/services/side-bar-form.service';
import {IUpdateRequest} from 'src/assets/model/UpdaterInterfaces';
import {CreateUserRequest} from '../models/CreateUserRequest';
import {UpdateUserRequest} from '../models/UpdateUserRequest';
import {DeleteUserRequest} from '../models/DeleteUserRequest';
import {Constants} from 'src/assets/util/Constants';
import {CommonService} from 'src/app/services/common.service';
import {BbxSidebarService} from 'src/app/services/bbx-sidebar.service';
import {AttachDirection, FlatDesignNavigatableTable, TileCssClass} from 'src/assets/model/navigation/Nav';
import {GetUsersParamListModel} from '../models/GetUsersParamListModel';
import {BaseManagerComponent} from '../../shared/base-manager/base-manager.component';
import {BbxToastrService} from 'src/app/services/bbx-toastr-service.service';
import {StatusService} from 'src/app/services/status.service';
import {lastValueFrom} from 'rxjs';
import {Actions, KeyBindings} from 'src/assets/util/KeyBindings';
import {KeyboardHelperService} from 'src/app/services/keyboard-helper.service';
import {ConfirmationDialogComponent} from '../../shared/simple-dialogs/confirmation-dialog/confirmation-dialog.component';
import {LoggerService} from 'src/app/services/logger.service';
import {BbxDialogServiceService} from 'src/app/services/bbx-dialog-service.service';
import {WareHouse} from '../../warehouse/models/WareHouse';
import {WareHouseService} from '../../warehouse/services/ware-house.service';
import {GetUsersResponse} from "../models/GetUsersResponse";
import {SystemService} from "../../system/services/system.service";
import {UserLevel} from "../../system/models/UserLevel";
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.scss'],
})
export class UserManagerComponent extends BaseManagerComponent<User> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  wareHousesData: WareHouse[] = []
  userLevels: UserLevel[] = []

  get IsPasswordRequired(): boolean {
    return this.dbDataTable?.flatDesignForm?.formMode !== undefined && this.dbDataTable?.flatDesignForm?.formMode === Constants.FormState.new;
  }

  override allColumns = ['id', 'name', 'loginName', 'userLevel', 'email', 'comment', 'active', 'warehouse'];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'ID',
      objectKey: 'id',
      colKey: 'id',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '45px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Név',
      objectKey: 'name',
      colKey: 'name',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
      fRequired: true
    },
    {
      label: 'Felhasználónév',
      objectKey: 'loginName',
      colKey: 'loginName',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '15%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
      fRequired: true
    },
    {
      label: 'Szint',
      objectKey: 'userLevel',
      colKey: 'userLevel',
      defaultValue: '',
      type: 'string',
      fInputType: '',
      mask: '',
      colWidth: '150px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
      fRequired: true
    },
    {
      label: 'Email',
      objectKey: 'email',
      colKey: 'email',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
      fRequired: true
    },
    {
      label: 'Megjegyzés',
      objectKey: 'comment',
      colKey: 'comment',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Aktív',
      objectKey: 'active',
      colKey: 'active',
      defaultValue: '',
      type: 'bool',
      fInputType: 'bool',
      mask: '',
      colWidth: '80px',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
      fRequired: true
    },
    {
      label: 'Jelszó',
      objectKey: 'password',
      colKey: 'password',
      defaultValue: '',
      type: 'password',
      fInputType: 'password',
      mask: '',
      colWidth: '',
      textAlign: '',
      navMatrixCssClass: TileCssClass,
      fRequired: this.IsPasswordRequired
    },
    {
      label: 'Alapértelmezett raktár',
      objectKey: 'warehouse',
      colKey: 'warehouse',
      defaultValue: '',
      type: 'string',
      fInputType: 'custom',
      mask: '',
      colWidth: '130px',
      textAlign: '',
      navMatrixCssClass: TileCssClass,
      fLast: true,
      fRequired: this.IsPasswordRequired
    },
  ];

  idParam?: number;

  public override getInputParams(override?: Constants.Dct): GetUsersParamListModel {
    const params = {
      ID: this.idParam,
      PageNumber: 1 + '',
      PageSize: this.dbDataTable.pageSize,
      SearchString: this.searchString ?? ''
    }
    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"] + ''
    }
    this.idParam = undefined
    return params
  }

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<User>>,
    private seInv: UserService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    cs: CommonService,
    sts: StatusService,
    private khs: KeyboardHelperService,
    loggerService: LoggerService,
    private wareHouseApi: WareHouseService,
    private readonly systemService: SystemService,
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'usermanager-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  override GetRecordName(data: User): string | number | undefined {
    return data.loginName
  }

  override ActionNew(data?: IUpdateRequest<User>): void {
    console.log("ActionNew: ", data);

    if (data?.needConfirmation) {
      const lastX = this.kbS.p.x;
      const lastY = this.kbS.p.y;
      this.kbS.p.x = 0;
      this.kbS.p.y = 0;
      this.kbS.SetCurrentNavigatable(this.dbDataTable);

      const dialogRef = this.dialogService.open(
        ConfirmationDialogComponent,
        {context: {msg: Constants.MSG_CONFIRMATION_SAVE}}
      );
      dialogRef.onClose.subscribe(res => {
        if (res) {
          if (this.searchString !== undefined && this.searchString.length > 0) {
            const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {context: {msg: Constants.MSG_CONFIRMATION_FILTER_DELETE}});
            dialogRef.onClose.subscribe(res => {
              if (res) {
                this.clearSearch();
              }
              this.ProcessActionNew(data);
            });
          } else {
            this.kbS.SetCurrentNavigatable(this.dbDataTable.flatDesignForm);
            this.kbS.p.x = lastX;
            this.kbS.p.y = lastY;
            this.ProcessActionNew(data);
          }
        } else {
          this.dbDataTable.prevSelectedCol = "name"
          this.dbDataTable.prevSelectedColPos = lastX
          this.dbDataTable.prevSelectedRowPos = lastY
          this.dbDataTable.prevSelectedRow = this.dbDataTable.data[lastY]

          this.kbS.p.x = lastX
          this.kbS.p.y = lastY

          this.kbS.SetCurrentNavigatable(this.dbDataTable)
          this.kbS.ClickCurrentElement()

          this.dbDataTable.Create()

          this.dbDataTable.flatDesignForm.FillFormWithObject(data.data)
        }
      });
    } else {
      this.ProcessActionNew(data);
    }
  }

  override ActionPut(data?: IUpdateRequest<User>): void {
    console.log("ActionPut: ", data);

    if (data?.needConfirmation) {
      const lastX = this.kbS.p.x;
      const lastY = this.kbS.p.y;
      this.kbS.p.x = 0;
      this.kbS.p.y = 0;
      this.kbS.SetCurrentNavigatable(this.dbDataTable);

      const dialogRef = this.dialogService.open(
        ConfirmationDialogComponent,
        {context: {msg: Constants.MSG_CONFIRMATION_SAVE}}
      );
      dialogRef.onClose.subscribe(res => {
        if (res) {
          if (this.searchString !== undefined && this.searchString.length > 0) {
            const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {context: {msg: Constants.MSG_CONFIRMATION_FILTER_DELETE}});
            dialogRef.onClose.subscribe(res => {
              if (res) {
                this.clearSearch();
              }
              this.ProcessActionPut(data);
            });
          } else {
            this.kbS.SetCurrentNavigatable(this.dbDataTable.flatDesignForm);
            this.kbS.p.x = lastX;
            this.kbS.p.y = lastY;
            this.ProcessActionPut(data);
          }
        } else {
          this.dbDataTable.prevSelectedCol = "name"
          this.dbDataTable.prevSelectedColPos = lastX
          this.dbDataTable.prevSelectedRowPos = lastY
          this.dbDataTable.prevSelectedRow = this.dbDataTable.data[lastY]

          this.kbS.p.x = lastX
          this.kbS.p.y = lastY

          this.kbS.SetCurrentNavigatable(this.dbDataTable)
          this.kbS.ClickCurrentElement()

          this.dbDataTable.Edit()

          this.dbDataTable.flatDesignForm.FillFormWithObject(data.data)
        }
      });
    } else {
      this.ProcessActionPut(data);
    }
  }

  override ProcessActionNew(data?: IUpdateRequest<User>): void {
    if (!data || !data.data) {
      return
    }

    data.data.id = parseInt(data.data.id + ''); // TODO
    console.log('ActionNew: ', data.data);
    this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);
    this.seInv
      .Create({
        name: data.data.name,
        email: data.data.email,
        loginName: data.data.loginName,
        password: data.data.password,
        comment: data.data.comment,
        active: data.data.active,
        userLevel: this.userLevels.find(x => x.text === data.data.userLevel)?.value,
        warehouseID: this.getWareHouseFromDescription(data.data.warehouseForCombo).id
      } as CreateUserRequest)
      .subscribe({
        next: async (d) => {
          if (d.succeeded && !!d.data) {
            await lastValueFrom(this.seInv.Get({ID: d.data.id}))
              .then(async res => {
                if (res) {
                  this.idParam = res.id;
                  await this.RefreshAsync(this.getInputParams());
                  setTimeout(() => {
                    this.dbDataTable.SelectRowById(res.id);
                    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                    this.bbxToastrService.show(Constants.MSG_SAVE_SUCCESFUL, true);
                  }, 200);
                } else {
                  this.bbxToastrService.showError(Constants.MSG_USER_GET_FAILED + d.data?.name, true);
                  this.dbDataTable.SetFormReadonly(false)
                  this.sts.pushProcessStatus(Constants.BlankProcessStatus)
                  this.kbS.ClickCurrentElement()
                }
              })
              .catch(err => {
                this.HandleError(err);
                this.dbDataTable.SetFormReadonly(false)
              })
              .finally(() => {
              });
          } else {
            console.log(
              d.errors!,
              d.errors!.join('\n'),
              d.errors!.join(', ')
            );
            this.bbxToastrService.showError(d.errors!.join('\n'), true);
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

  override ProcessActionPut(data?: IUpdateRequest<User>): void {
    if (!data || !data.data) {
      return
    }

    this.sts.pushProcessStatus(Constants.CRUDPutStatuses[Constants.CRUDPutPhases.UPDATING]);
    data.data.id = parseInt(data.data.id + ''); // TODO

    const request = {
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      loginName: data.data.loginName,
      password: data.data.password,
      comment: data.data.comment,
      active: data.data.active,
      warehouseID: this.getWareHouseFromDescription(data.data.warehouseForCombo).id,
      userLevel: this.userLevels.find(x => x.text === data.data.userLevel)?.value
    } as UpdateUserRequest

    this.seInv
      .Update(request)
      .subscribe({
        next: async (d) => {
          if (!d.succeeded || !d.data) {
            this.bbxToastrService.showError(d.errors!.join('\n'), true);
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            this.dbDataTable.SetFormReadonly(false)
            this.kbS.ClickCurrentElement()

            return
          }

          await lastValueFrom(this.seInv.Get({ID: d.data.id}))
            .then(async res => {
              if (!res) {
                this.bbxToastrService.showError(Constants.MSG_USER_GET_FAILED + d.data?.name, true);

                this.dbDataTable.SetFormReadonly(false)
                this.sts.pushProcessStatus(Constants.BlankProcessStatus)
                this.kbS.ClickCurrentElement()

                return
              }

              this.idParam = res.id;
              await this.RefreshAsync(this.getInputParams());
              setTimeout(() => {
                this.dbDataTable.SelectRowById(res.id);
                this.sts.pushProcessStatus(Constants.BlankProcessStatus);

                this.bbxToastrService.showSuccess(Constants.MSG_SAVE_SUCCESFUL, true);
              }, 200);
            })
            .catch(err => {
              this.HandleError(err);
              this.dbDataTable.SetFormReadonly(false)
            })
        },
        error: (err) => {
          this.HandleError(err);
          this.dbDataTable.SetFormReadonly(false)
        },
      });
  }

  override ProcessActionDelete(data?: IUpdateRequest<User>): void {
    if (!data || !data.data?.id) {
      return
    }
    this.sts.pushProcessStatus(Constants.DeleteStatuses[Constants.DeletePhases.DELETING]);
    console.log('ActionDelete: ', data.rowIndex);
    this.seInv
      .Delete({
        id: data.data?.id,
      } as DeleteUserRequest)
      .subscribe({
        next: (d) => {
          if (!d.succeeded || !d.data) {
            this.bbxToastrService.showError(d.errors!.join('\n'), true);

            return
          }

          const di = this.dbData.findIndex(
            (x) => x.data.id === data.data.id
          );
          this.dbData.splice(di, 1);
          this.bbxToastrService.showSuccess(Constants.MSG_DELETE_SUCCESFUL, true);

          this.HandleGridSelectionAfterDelete(di);
        },
        error: (err) => {
          this.HandleError(err);
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        },
        complete: () => {
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      });
  }

  private getWareHouseFromDescription(desc?: string): WareHouse {
    if (!desc) {
      throw new Error('Missing WareHouse combobox value!')
    }
    let wareHouse = this.wareHousesData.find(x => x.warehouseDescription === desc)
    return wareHouse!
  }

  private getDescriptionFromWareHouseField(val?: string): string | undefined {
    if (!val || !val.includes('-')) {
      return undefined
    }
    return val.split('-')[1]
  }

  private async refreshComboboxData(): Promise<void> {
    try {
      this.sts.waitForLoad()

      const warehouseRequest = this.wareHouseApi.GetAllPromise()
      const userLevelsRequest = lastValueFrom(this.systemService.userLevels())

      const warehouseData = await warehouseRequest
      this.wareHousesData = warehouseData.data ?? []

      const userLevels = await userLevelsRequest
      this.userLevels = userLevels ?? []
    } catch (error) {
      this.cs.HandleError(error)
    } finally {
      this.sts.waitForLoad(false)
    }
  }

  override search(): void {
    this.Refresh(this.getInputParams());
  }

  validateRequiredPassword(control: AbstractControl): any {
    const wrong = this.IsPasswordRequired && (control.value === undefined || control.value === null || (control.value + "").trim() === "");
    return wrong ? {required: {value: control.value}} : null;
  }

  private Setup(): void {
    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(undefined, []),
      name: new FormControl(undefined, [Validators.required]),
      loginName: new FormControl(undefined, [Validators.required]),
      userLevel: new FormControl(undefined, [Validators.required]),
      email: new FormControl(undefined, [Validators.required]),
      comment: new FormControl(undefined, []),
      active: new FormControl(true, [Validators.required]),
      password: new FormControl(undefined, [this.validateRequiredPassword.bind(this)]),
      warehouseForCombo: new FormControl(undefined, [Validators.required]),
    });
    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'User',
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
      User.createEmpty
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams({'PageNumber': newPageNumber}));
      },
    });

    this.bbxSidebarService.collapse();

    this.Refresh(this.getInputParams());
  }

  override Refresh(params?: GetUsersParamListModel): void {
    if (!!this.Subscription_Refresh && !this.Subscription_Refresh.closed) {
      this.Subscription_Refresh.unsubscribe();
    }

    console.log('Refreshing');

    this.isLoading = true;

    this.refreshComboboxData()

    this.Subscription_Refresh = this.seInv.GetAll(params).subscribe({
      next: this.onGetUsersResponse.bind(this),
      error: (err) => {
        this.cs.HandleError(err);
        this.isLoading = false;
        this.RefreshTable();
      },
      complete: () => {
        this.isLoading = false;
        this.RefreshTable();
      },
    });
  }

  async RefreshAsync(params?: GetUsersParamListModel): Promise<void> {
    console.log('Refreshing');

    this.isLoading = true;

    await this.refreshComboboxData()

    await lastValueFrom(this.seInv.GetAll(params))
      .then(this.onGetUsersResponse.bind(this))
      .catch(err => {
        this.cs.HandleError(err);
        this.isLoading = false;
        this.RefreshTable();
      })
      .finally(() => {
        this.isLoading = false;
        this.RefreshTable();
      });
  }

  private onGetUsersResponse(response: GetUsersResponse): void {
    if (!response.succeeded && !response.data) {
      this.bbxToastrService.showError(response.errors!.join('\n'), true);

      return
    }

    this.dbData = response.data.map(user => ({
      data: User.fromUserObject(user, this.getDescriptionFromWareHouseField(user.warehouse)),
      uid: this.nextUid(),
    }));
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

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onKeyDown2(event: KeyboardEvent) {
    if (this.khs.IsKeyboardBlocked) {
      HelperFunctions.StopEvent(event)
      return;
    }
    switch (event.key) {
      case KeyBindings.F11: {
        HelperFunctions.StopEvent(event)
        break
      }
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
          break
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
          break
        }

        this.loggerService.info(`${this.KeySetting[Actions.Reset].KeyLabel} Pressed: ${this.KeySetting[Actions.Reset].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event)
        break
      }
      default: {
      }
    }
  }
}
