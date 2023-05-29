import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { User } from '../models/User';
import { UserService } from '../services/user.service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { CreateUserRequest } from '../models/CreateUserRequest';
import { UpdateUserRequest } from '../models/UpdateUserRequest';
import { DeleteUserRequest } from '../models/DeleteUserRequest';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { CreateUserResponseDataToUser } from '../models/CreateUserResponse';
import { UpdateUserResponseDataToUser } from '../models/UpdateUserResponse';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { GetUsersParamListModel } from '../models/GetUsersParamListModel';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { StatusService } from 'src/app/services/status.service';
import { lastValueFrom } from 'rxjs';
import { Actions } from 'src/assets/util/KeyBindings';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.scss'],
})
export class UserManagerComponent extends BaseManagerComponent<User> implements OnInit
{
  @ViewChild('table') table?: NbTable<any>;

  get IsPasswordRequired(): boolean {
    return this.dbDataTable?.flatDesignForm?.formMode !== undefined && this.dbDataTable?.flatDesignForm?.formMode === Constants.FormState.new;
  }

  override allColumns = ['id', 'name', 'loginName', 'email', 'comment', 'active'];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'ID',
      objectKey: 'id',
      colKey: 'id',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '130px',
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
      fLast: true,
      fRequired: this.IsPasswordRequired
    },
  ];
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') },
  };

  idParam?: number;
  override get getInputParams(): GetUsersParamListModel {
    const params = { ID: this.idParam, PageNumber: this.dbDataTable.currentPage + '', PageSize: this.dbDataTable.pageSize, SearchString: this.searchString ?? '' };
    this.idParam = undefined;
    return params;
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<User>>,
    private seInv: UserService,
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
    this.dbDataTableId = 'usermanager-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
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
        { context: { msg: Constants.MSG_CONFIRMATION_SAVE } }
      );
      dialogRef.onClose.subscribe(res => {
        if (res) {
          if (this.searchString !== undefined && this.searchString.length > 0) {
            const dialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_FILTER_DELETE } });
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
        { context: { msg: Constants.MSG_CONFIRMATION_SAVE } }
      );
      dialogRef.onClose.subscribe(res => {
        if (res) {
          if (this.searchString !== undefined && this.searchString.length > 0) {
            const dialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_FILTER_DELETE } });
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
        }
      });
    } else {
      this.ProcessActionPut(data);
    }
  }

  override ProcessActionNew(data?: IUpdateRequest<User>): void {
    if (!!data && !!data.data) {
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
          active: data.data.active
        } as CreateUserRequest)
        .subscribe({
          next: async (d) => {
            if (d.succeeded && !!d.data) {
              await lastValueFrom(this.seInv.Get({ ID: d.data.id }))
                .then(async res => {
                  if (res) {
                    this.idParam = res.id;
                    await this.RefreshAsync(this.getInputParams);
                    setTimeout(() => {
                      this.dbDataTable.SelectRowById(res.id);
                      this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                      this.simpleToastrService.show(
                        Constants.MSG_SAVE_SUCCESFUL,
                        Constants.TITLE_INFO,
                        Constants.TOASTR_SUCCESS_5_SEC
                      );
                    }, 200);
                  } else {
                    this.simpleToastrService.show(
                      Constants.MSG_USER_GET_FAILED + d.data?.name,
                      Constants.TITLE_ERROR,
                      Constants.TOASTR_ERROR_5_SEC
                    );
                    this.dbDataTable.SetFormReadonly(false)
                    this.sts.pushProcessStatus(Constants.BlankProcessStatus)
                    this.kbS.ClickCurrentElement()
                  }
                })
                .catch(err => {
                  this.HandleError(err);
                  this.dbDataTable.SetFormReadonly(false)
                })
                .finally(() => {});
            } else {
              console.log(
                d.errors!,
                d.errors!.join('\n'),
                d.errors!.join(', ')
              );
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

  override ProcessActionPut(data?: IUpdateRequest<User>): void {
    if (!!data && !!data.data) {
      this.sts.pushProcessStatus(Constants.CRUDPutStatuses[Constants.CRUDPutPhases.UPDATING]);
      data.data.id = parseInt(data.data.id + ''); // TODO
      console.log('ActionPut: ', data.data);
      this.seInv
        .Update({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          loginName: data.data.loginName,
          password: data.data.password,
          comment: data.data.comment,
          active: data.data.active
        } as UpdateUserRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              const newRow = {
                data: UpdateUserResponseDataToUser(d.data),
              } as TreeGridNode<User>;
              const newRowIndex = this.dbData.findIndex(x => x.data.id === newRow.data.id);
              this.dbData[newRowIndex !== -1 ? newRowIndex : data.rowIndex] = newRow;
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

  override ProcessActionDelete(data?: IUpdateRequest<User>): void {
    if (!!data && data.data?.id !== undefined) {
      this.sts.pushProcessStatus(Constants.DeleteStatuses[Constants.DeletePhases.DELETING]);
      console.log('ActionDelete: ', data.rowIndex);
      this.seInv
        .Delete({
          id: data.data?.id,
        } as DeleteUserRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              const di = this.dbData.findIndex(
                (x) => x.data.id === data.data.id
              );
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

  override search(): void {
    this.Refresh(this.getInputParams);
  }

  validateRequiredPassword(control: AbstractControl): any {
    const wrong = this.IsPasswordRequired && (control.value === undefined || control.value === null || (control.value + "").trim() === "");
    return wrong ? { required: { value: control.value } } : null;
  }

  private Setup(): void {
    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);
    // TODO: FormGroup generator
    this.dbDataTableForm = new FormGroup({
      id: new FormControl(undefined, []),
      name: new FormControl(undefined, [Validators.required]),
      loginName: new FormControl(undefined, [Validators.required]),
      email: new FormControl(undefined, [Validators.required]),
      comment: new FormControl(undefined, []),
      active: new FormControl(true, [Validators.required]),
      password: new FormControl(undefined, [this.validateRequiredPassword.bind(this)]),
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
      () => {
        return new User();
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams);
      },
    });

    this.bbxSidebarService.collapse();

    this.Refresh(this.getInputParams);
  }

  override Refresh(params?: GetUsersParamListModel): void {
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
              return {
                data: new User(
                  x.id,
                  x.name,
                  x.loginName,
                  x.email,
                  x.comment,
                  x.active
                ),
                uid: this.nextUid(),
              };
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

  async RefreshAsync(params?: GetUsersParamListModel): Promise<void> {
    console.log('Refreshing');
    this.isLoading = true;
    await lastValueFrom(this.seInv.GetAll(params))
      .then(d => {
        if (d.succeeded && !!d.data) {
          if (!!d) {
            this.dbData = d.data.map((x) => {
              return {
                data: new User(
                  x.id,
                  x.name,
                  x.loginName,
                  x.email,
                  x.comment,
                  x.active
                ),
                uid: this.nextUid(),
              };
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
      default: { }
    }
  }
}
