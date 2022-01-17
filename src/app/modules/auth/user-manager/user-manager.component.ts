import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ColDef } from 'src/assets/model/ColDef';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { NbDialogService, NbGlobalPhysicalPosition, NbSortDirection, NbSortRequest, NbTable, NbToastrService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { User } from '../models/User';
import { UserService } from '../services/user.service';
import { Nav } from 'src/assets/model/Navigatable';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.scss']
})
export class UserManagerComponent implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  userTableForm!: FormGroup;
  users!: TreeGridNode<User>[];
  usersDataSrc!: NbTreeGridDataSource<TreeGridNode<User>>;
  userTable!: Nav.NavigatableTable<User>;
  usersTableId = 'usermanager-table';
  usersTableEditId = "user-cell-edit-input";

  colsToIgnore: string[] = [];
  // allColumns = ['ProductCode', 'Name', 'Measure', 'Amount', 'Price', 'Value'];
  allColumns = ['Id', 'UserName'];
  colDefs: ColDef[] = [
    // { label: 'Termékkód', objectKey: 'ProductCode', colKey: 'ProductCode', defaultValue: '', type: 'string', mask: "AAA-ACCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", colWidth: "20%", textAlign: "left" },
    // { label: 'Megnevezés', objectKey: 'Name', colKey: 'Name', defaultValue: '', type: 'string', mask: "", colWidth: "30%", textAlign: "left" },
    // { label: 'Mértékegység', objectKey: 'Measure', colKey: 'Measure', defaultValue: '', type: 'string', mask: "", colWidth: "5%", textAlign: "left" },
    // { label: 'Mennyiség', objectKey: 'Amount', colKey: 'Amount', defaultValue: '', type: 'number', mask: "", colWidth: "15%", textAlign: "right" },
    // { label: 'Ár', objectKey: 'Price', colKey: 'Price', defaultValue: '', type: 'number', mask: "", colWidth: "15%", textAlign: "right" },
    // { label: 'Érték', objectKey: 'Value', colKey: 'Value', defaultValue: '', type: 'number', mask: "", colWidth: "15%", textAlign: "right" },
    { label: 'ID', objectKey: 'Id', colKey: 'Id', defaultValue: '', type: 'string', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Név', objectKey: 'UserName', colKey: 'UserName', defaultValue: '', type: 'string', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
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
    // public gridNavHandler: ProductsGridNavigationService,
    private toastrService: NbToastrService
  ) {
    this.Setup();
  }

  private Setup(): void {
    this.users = [];
    this.usersDataSrc = this.dataSourceBuilder.create(this.users);
    this.userTable = new Nav.NavigatableTable(
      this.userTableForm, this.dataSourceBuilder, this.kbS, this.fS, this.cdref, this.users, this.usersTableId, Nav.AttachDirection.DOWN,
      () => new User()
    );
    this.Refresh();
  }

  private Refresh(): void {
    this.seInv.GetUsers().subscribe((data: User[]) => {
      if (!!data) {
        this.users = data.map(x => { return { data: new User(x.Id, x.UserName), uid: this.nextUid() }; });
        this.usersDataSrc.setData(this.users);
      }
      this.userTable.Setup(
        this.users, this.usersDataSrc,
        this.allColumns, this.colDefs,
        this.cdref,
        this.colsToIgnore
      );
      this.userTable.GenerateAndSetNavMatrices(false);
    });
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.userTable.GenerateAndSetNavMatrices(true);

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
