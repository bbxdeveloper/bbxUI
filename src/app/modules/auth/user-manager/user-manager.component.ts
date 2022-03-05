import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { User } from '../models/User';
import { UserService } from '../services/user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest, IUpdater } from 'src/assets/model/UpdaterInterfaces';
import { CreateUserRequest } from '../models/CreateUserRequest';
import { UpdateUserRequest } from '../models/UpdateUserRequest';
import { DeleteUserRequest } from '../models/DeleteUserRequest';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { CreateUserResponseDataToUser } from '../models/CreateUserResponse';
import { UpdateUserResponseDataToUser } from '../models/UpdateUserResponse';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { GetUsersParamListModel } from '../models/GetUsersParamListModel';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.scss'],
})
export class UserManagerComponent
  extends BaseManagerComponent<User>
  implements OnInit
{
  @ViewChild('table') table?: NbTable<any>;

  usersTableId = 'usermanager-table';
  usersTableEditId = 'user-cell-edit-input';

  colsToIgnore: string[] = [];
  allColumns = ['id', 'name', 'loginName', 'email', 'comment', 'active'];
  colDefs: ModelFieldDescriptor[] = [
    {
      label: 'ID',
      objectKey: 'id',
      colKey: 'id',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '15%',
      textAlign: 'center',
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
      colWidth: '15%',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
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
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
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
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
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
      textAlign: 'center',
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
      colWidth: '10%',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
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
      fLast: true
    },
  ];
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') },
  };

  searchString: string = '';

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<User>>,
    private seInv: UserService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private cs: CommonService
  ) {
    super(dialogService, kbS, fS, sidebarService);
    this.searchInputId = 'active-prod-search';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  override ProcessActionNew(data?: IUpdateRequest<User>): void {
    if (!!data && !!data.data) {
      console.log('ActionNew: ', data.data);
      this.seInv
        .Create({
          name: data.data.name,
          email: data.data.email,
          loginName: data.data.loginName,
          password: data.data.password,
          comment: data.data.comment,
        } as CreateUserRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              this.dbData.push({
                data: CreateUserResponseDataToUser(d.data),
              } as TreeGridNode<User>);
              this.RefreshTable();
              this.toastrService.show(
                Constants.MSG_SAVE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS
              );
            } else {
              console.log(
                d.errors!,
                d.errors!.join('\n'),
                d.errors!.join(', ')
              );
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

  override ProcessActionPut(data?: IUpdateRequest<User>): void {
    if (!!data && !!data.data) {
      console.log('ActionPut: ', data.data);
      this.seInv
        .Update({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          loginName: data.data.loginName,
          password: data.data.password,
          comment: data.data.comment,
        } as UpdateUserRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              this.dbData[data.rowIndex] = {
                data: UpdateUserResponseDataToUser(d.data),
              } as TreeGridNode<User>;
              this.RefreshTable();
              this.toastrService.show(
                Constants.MSG_SAVE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS
              );
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

  override ProcessActionDelete(data?: IUpdateRequest<User>): void {
    if (!!data && data.data?.id !== undefined) {
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
              this.RefreshTable();
              this.toastrService.show(
                Constants.MSG_DELETE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS
              );
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
    this.searchString = event.target.value;
    console.log('Search: ', this.searchString);
    this.search();
  }

  search(): void {
    if (this.searchString.length === 0) {
      this.Refresh();
    } else {
      this.Refresh({ Name: this.searchString });
    }
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
      active: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, []),
    });
    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'User',
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.usersTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.RIGHT,
      this.sidebarService,
      this.sidebarFormService,
      this,
      () => {
        return new User();
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.sidebarService.collapse();
    this.Refresh();
  }

  private Refresh(params?: GetUsersParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.seInv.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetUsers response: ', d); // TODO: only for debug
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
      this.kbS.SelectFirstTile();
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
}
