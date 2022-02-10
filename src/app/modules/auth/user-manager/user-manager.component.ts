import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ColDef';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { User } from '../models/User';
import { UserService } from '../services/user.service';
import { Nav } from 'src/assets/model/Navigatable';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbSidebarService } from '@nebular/theme';
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

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.scss']
})
export class UserManagerComponent implements OnInit, IUpdater<User> {
  @ViewChild('table') table?: NbTable<any>;

  userTableForm!: FormGroup;
  users!: TreeGridNode<User>[];
  usersDataSrc!: NbTreeGridDataSource<TreeGridNode<User>>;
  userTable!: Nav.FlatDesignNavigatableTable<User>;
  usersTableId = 'usermanager-table';
  usersTableEditId = "user-cell-edit-input";

  colsToIgnore: string[] = [];
  allColumns = ['id', 'name', 'loginName', 'email', 'comment', 'active'];
  colDefs: ModelFieldDescriptor[] = [
    // { label: 'Termékkód', objectKey: 'ProductCode', colKey: 'ProductCode', defaultValue: '', type: 'string', mask: "AAA-ACCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", colWidth: "20%", textAlign: "left" },
    { label: 'ID', objectKey: 'id', colKey: 'id', defaultValue: '', type: 'string', fInputType: 'readonly', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Név', objectKey: 'name', colKey: 'name', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Felhasználónév', objectKey: 'loginName', colKey: 'loginName', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Email', objectKey: 'email', colKey: 'email', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "25%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Megjegyzés', objectKey: 'comment', colKey: 'comment', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "30%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Aktív', objectKey: 'active', colKey: 'active', defaultValue: '', type: 'bool', fInputType: 'bool', mask: "", colWidth: "10%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Jelszó', objectKey: 'password', colKey: 'password', defaultValue: '', type: 'password', fInputType: 'password', mask: "", colWidth: "", textAlign: "", navMatrixCssClass: Nav.TileCssClass }
  ]
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  tableIsFocused: boolean = false;
  private uid = 0;

  readonly commands: FooterCommandInfo[] = [
    { key: 'F1', value: '', disabled: false },
    { key: 'F2', value: '', disabled: false },
    { key: 'F3', value: '', disabled: false },
    { key: 'F4', value: '', disabled: false },
    { key: 'F5', value: '', disabled: false },
    { key: 'F6', value: '', disabled: false },
    { key: 'F7', value: '', disabled: false },
    { key: 'F8', value: '', disabled: false },
    { key: 'F9', value: '', disabled: false },
    { key: 'F10', value: '', disabled: false },
    { key: 'F11', value: '', disabled: false },
    { key: 'F12', value: 'Tétellap', disabled: false },
  ];

  constructor(
    @Optional() private dialogService: NbDialogService,
    private fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<User>>,
    private seInv: UserService,
    private cdref: ChangeDetectorRef,
    private kbS: KeyboardNavigationService,
    private toastrService: NbToastrService,
    private sidebarService: NbSidebarService,
    private sidebarFormService: SideBarFormService,
    private cs: CommonService
  ) {
    this.kbS.ResetToRoot();
    this.Setup();
  }

  ActionNew(data?: IUpdateRequest<User>): void {
    if (!!data && !!data.data) {
      console.log("ActionNew: ", data.data);
      this.seInv.CreateUser({
        name: data.data.name,
        email: data.data.email,
        loginName: data.data.loginName,
        password: data.data.password,
        comment: data.data.comment
      } as CreateUserRequest).subscribe({
        next: d => {
          if (d.succeeded && !!d.data) {
            this.users.push({ data: CreateUserResponseDataToUser(d.data) } as TreeGridNode<User>);
            this.RefreshTable();
            this.toastrService.show(Constants.MSG_SAVE_SUCCESFUL, Constants.TITLE_INFO, Constants.TOASTR_SUCCESS);
          } else {
            console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
            this.toastrService.show(d.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
          }
        },
        error: err => this.cs.HandleError(err)
      });
    }
  }
  ActionReset(data?: IUpdateRequest<User>): void {
    this.userTable.ResetForm();
  }
  ActionPut(data?: IUpdateRequest<User>): void {
    if (!!data && !!data.data) {
      console.log("ActionPut: ", data.data);
      this.seInv.UpdateUser({
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        loginName: data.data.loginName,
        password: data.data.password,
        comment: data.data.comment
      } as UpdateUserRequest).subscribe({
        next: d => {
          if (d.succeeded && !!d.data) {
            this.users[data.rowIndex] = { data: UpdateUserResponseDataToUser(d.data) } as TreeGridNode<User>;
            this.RefreshTable();
            this.toastrService.show(Constants.MSG_SAVE_SUCCESFUL, Constants.TITLE_INFO, Constants.TOASTR_SUCCESS);
          } else {
            this.toastrService.show(d.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
          }
        },
        error: err => this.cs.HandleError(err)
      });
    }
  }
  ActionDelete(data?: IUpdateRequest<User>): void {
    const dialogRef = this.dialogService.open(
      ConfirmationDialogComponent,
      { context: { msg: Constants.MSG_CONFIRMATION_DELETE } }
    );
    dialogRef.onClose.subscribe(res => {
      if (res) {
        if (!!data && data.data?.id !== undefined) {
          console.log("ActionDelete: ", data.rowIndex);
          this.seInv.DeleteUser({
            id: data.data?.id
          } as DeleteUserRequest).subscribe({
            next: d => {
              if (d.succeeded && !!d.data) {
                const di = this.users.findIndex(x => x.data.id === data.data.id);
                this.users.splice(di, 1);
                this.RefreshTable();
                this.toastrService.show(Constants.MSG_DELETE_SUCCESFUL, Constants.TITLE_INFO, Constants.TOASTR_SUCCESS);
              } else {
                this.toastrService.show(d.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
              }
            },
            error: err => this.cs.HandleError(err)
          });
        }
      }
    });
  }

  private Setup(): void {
    this.users = [];
    this.usersDataSrc = this.dataSourceBuilder.create(this.users);
    // TODO: FormGroup generator
    this.userTableForm = new FormGroup({
      id: new FormControl(undefined, [Validators.required]),
      name: new FormControl(undefined, [Validators.required]),
      loginName: new FormControl(undefined, [Validators.required]),
      email: new FormControl(undefined, [Validators.required]),
      comment: new FormControl(undefined, []),
      active: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, [])
    });
    this.userTable = new Nav.FlatDesignNavigatableTable(
      this.userTableForm, this.dataSourceBuilder, this.kbS, this.fS, this.cdref, this.users, this.usersTableId, Nav.AttachDirection.DOWN,
      'sideBarForm', Nav.AttachDirection.RIGHT, this.sidebarService, this.sidebarFormService, this
    );
    this.userTable.pushFooterCommandList();
    this.userTable.OuterJump = true;
    this.sidebarService.collapse();
    this.Refresh();
  }

  private Refresh(): void {
    console.log('Refreshing'); // TODO: only for debug
    this.seInv.GetUsers().subscribe({
      next: d => {
        if (d.succeeded && !!d.data) {
          console.log('GetUsers response: ', d); // TODO: only for debug
          if (!!d) {
            this.users = d.data.map(x => { return { data: new User(x.id, x.name, x.loginName, x.email, x.comment, x.active), uid: this.nextUid() }; });
            this.usersDataSrc.setData(this.users);
          }
          this.RefreshTable();
        } else {
          this.toastrService.show(d.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
        }
      },
      error: err => this.cs.HandleError(err)
    });
  }

  private RefreshTable(): void {
    this.userTable.Setup(
      this.users, this.usersDataSrc,
      this.allColumns, this.colDefs,
      this.colsToIgnore
    );
    setTimeout(() => {
      this.userTable.GenerateAndSetNavMatrices(false);
    }, 200);
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.userTable.GenerateAndSetNavMatrices(true);
    this.userTable.pushFooterCommandList();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();
  }

  private nextUid() {
    ++this.uid
    return this.uid;
  }

  trackRows(index: number, row: any) {
    return row.uid;
  }

  focusOnTable(focusIn: boolean): void {
    this.tableIsFocused = focusIn;
    if (focusIn) {
      this.userTable.pushFooterCommandList();
    } else {
      this.fS.pushCommands(this.commands);
    }
  }
}
