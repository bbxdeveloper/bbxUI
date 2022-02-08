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
import { GetUsersResponse } from '../models/GetUsersResponse';
import { NbSidebarService } from '@nebular/theme';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest, IUpdater } from 'src/assets/model/UpdaterInterfaces';
import { CreateUserRequest } from '../models/CreateUserRequest';
import { UpdateUserRequest } from '../models/UpdateUserRequest';
import { DeleteUserRequest } from '../models/DeleteUserRequest';

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
    { label: 'ID', objectKey: 'id', colKey: 'id', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Név', objectKey: 'name', colKey: 'name', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Felhasználónév', objectKey: 'loginName', colKey: 'loginName', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Email', objectKey: 'email', colKey: 'email', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "25%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Megjegyzés', objectKey: 'comment', colKey: 'comment', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "30%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Aktív', objectKey: 'active', colKey: 'active', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "10%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
  ]
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  tableIsFocused: boolean = false;
  private uid = 0;

  readonly commands: FooterCommandInfo[] = [
    { key: 'F1', value: 'Súgó', disabled: false },
    { key: 'F2', value: 'Keresés', disabled: false },
    { key: 'F3', value: 'Új Partner', disabled: false },
    { key: 'F4', value: 'Számolás', disabled: false },
    { key: 'F5', value: 'Adóalany', disabled: false },
    { key: 'F6', value: 'Módosítás', disabled: false },
    { key: 'F7', value: 'GdprNy', disabled: false },
    { key: 'F8', value: 'GdprAd', disabled: false },
    { key: 'F9', value: '', disabled: false },
    { key: 'F10', value: '', disabled: false },
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
    private sidebarFormService: SideBarFormService
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
        passwor: '',
        comment: data.data.comment
      } as CreateUserRequest).subscribe({
        next: d => { console.log(d); },
        error: err => { console.log(err); }
      });
    }
  }
  ActionReset(data?: IUpdateRequest<User>): void {
    console.log("ActionReset: ", data?.data);
  }
  ActionPut(data?: IUpdateRequest<User>): void {
    if (!!data && !!data.data) {
      console.log("ActionPut: ", data.data);
      this.seInv.UpdateUser({
        name: data.data.name,
        email: data.data.email,
        loginName: data.data.loginName,
        passwor: '',
        comment: data.data.comment
      } as UpdateUserRequest).subscribe({
        next: d => { console.log(d); },
        error: err => { console.log(err); }
      });
    }
  }
  ActionDelete(data?: IUpdateRequest<User>): void {
    if (!!data && data.rowIndex !== undefined) {
      console.log("ActionDelete: ", data.rowIndex);
      this.seInv.DeleteUser({
        id: this.users[data.rowIndex].data.id
      } as DeleteUserRequest).subscribe({
        next: d => { console.log(d); },
        error: err => { console.log(err); }
      });
    }
  }

  private Setup(): void {
    this.users = [];
    this.usersDataSrc = this.dataSourceBuilder.create(this.users);
    this.userTableForm = new FormGroup({
      id: new FormControl(undefined, [Validators.required]),
      name: new FormControl(undefined, [Validators.required]),
      loginName: new FormControl(undefined, [Validators.required]),
      email: new FormControl(undefined, [Validators.required]),
      comment: new FormControl(undefined, []),
      active: new FormControl(undefined, [Validators.required]),
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
      next: d => this.ProcessGetUsersResponse(d),
      error: e => this.ProcessErrorRespones(e)
    });
  }

  private ProcessGetUsersResponse(resp: GetUsersResponse): void {
    console.log('GetUsers response: ', resp); // TODO: only for debug
    if (!!resp) {
      this.users = resp.data.map(x => { return { data: new User(x.id, x.name, x.loginName, x.email, x.comment, x.active), uid: this.nextUid() }; });
      this.usersDataSrc.setData(this.users);
    }
    this.userTable.Setup(
      this.users, this.usersDataSrc,
      this.allColumns, this.colDefs,
      this.colsToIgnore
    );
    setTimeout(() => {
      this.userTable.GenerateAndSetNavMatrices(false);  
    }, 200);
  }

  private ProcessErrorRespones(err: any): void {
    console.log(err);
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
