import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest, IUpdater } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { DeleteOriginRequest } from '../models/DeleteOriginRequest';
import { GetOriginsParamListModel } from '../models/GetOriginsParamListModel';
import { BlankOrigin, Origin } from '../models/Origin';
import { OriginService } from '../services/origin.service';

@Component({
  selector: 'app-origin-manager',
  templateUrl: './origin-manager.component.html',
  styleUrls: ['./origin-manager.component.scss']
})
export class OriginManagerComponent implements OnInit, IUpdater<Origin> {
  @ViewChild('table') table?: NbTable<any>;

  dbDataTableForm!: FormGroup;
  dbData!: TreeGridNode<Origin>[];
  dbDataDataSrc!: NbTreeGridDataSource<TreeGridNode<Origin>>;
  dbDataTable!: FlatDesignNavigatableTable<Origin>;
  dbDataTableId = 'origin-table';
  dbDataTableEditId = "user-cell-edit-input";

  colsToIgnore: string[] = [];
  allColumns = [
    'id', 'originCode', 'originDescription'
  ];
  colDefs: ModelFieldDescriptor[] = [
    { label: 'Azonosító', objectKey: 'id', colKey: 'id', defaultValue: '', type: 'string', fInputType: 'readonly', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: TileCssClass },
    { label: 'Kód', objectKey: 'originCode', colKey: 'originCode', defaultValue: '', type: 'string', fInputType: 'text', fRequired: true, mask: "", colWidth: "30%", textAlign: "left", navMatrixCssClass: TileCssClass },
    { label: 'Leírás', objectKey: 'originDescription', colKey: 'originDescription', defaultValue: '', type: 'string', fRequired: true, fInputType: 'text', mask: "Set in sidebar form.", colWidth: "55%", textAlign: "left", navMatrixCssClass: TileCssClass },
  ]

  tableIsFocused: boolean = false;
  private uid = 0;

  isLoading: boolean = true;

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

  get isSideBarOpened(): boolean { return this.sidebarService.sideBarOpened; };

  searchString: string = '';

  constructor(
    @Optional() private dialogService: NbDialogService,
    private fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Origin>>,
    private seInv: OriginService,
    private cdref: ChangeDetectorRef,
    private kbS: KeyboardNavigationService,
    private toastrService: NbToastrService,
    private sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private cs: CommonService
  ) {
    this.kbS.ResetToRoot();
    this.Setup();
  }

  ActionNew(data?: IUpdateRequest<Origin>): void {
    console.log("ActionNew: ", data?.data);
    if (!!data && !!data.data) {
      this.seInv.Create(data.data).subscribe({
        next: d => {
          if (d.succeeded && !!d.data) {
            this.dbData.push({ data: d.data } as TreeGridNode<Origin>);
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
  ActionReset(data?: IUpdateRequest<Origin>): void {
    this.dbDataTable.ResetForm();
  }
  ActionPut(data?: IUpdateRequest<Origin>): void {
    console.log("ActionPut: ", data?.data, JSON.stringify(data?.data));
    if (!!data && !!data.data) {
      this.seInv.Update(data.data).subscribe({
        next: d => {
          if (d.succeeded && !!d.data) {
            this.dbData[data.rowIndex] = { data: d.data } as TreeGridNode<Origin>;
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
  ActionDelete(data?: IUpdateRequest<Origin>): void {
    const dialogRef = this.dialogService.open(
      ConfirmationDialogComponent,
      { context: { msg: Constants.MSG_CONFIRMATION_DELETE } }
    );
    dialogRef.onClose.subscribe(res => {
      if (res) {
        const id = data?.data?.id;
        console.log("ActionDelete: ", id);
        if (id !== undefined) {
          this.seInv.Delete({
            id: id
          } as DeleteOriginRequest).subscribe({
            next: d => {
              if (d.succeeded && !!d.data) {
                const di = this.dbData.findIndex(x => x.data.id === id);
                this.dbData.splice(di, 1);
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

  refreshFilter(event: any): void {
    this.searchString = event.target.value;
    console.log("Search: ", this.searchString);
    this.search();
  }

  search(): void {
    if (this.searchString.length === 0) {
      this.Refresh();
    } else {
      this.Refresh({ 'SearchString': this.searchString });
    }
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(undefined, []),
      originCode: new FormControl(undefined, [Validators.required]),
      originDescription: new FormControl(undefined, [Validators.required])
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm, 'Origin', this.dataSourceBuilder, this.kbS, this.fS, this.cdref, this.dbData, this.dbDataTableId, AttachDirection.DOWN,
      'sideBarForm', AttachDirection.RIGHT, this.sidebarService, this.sidebarFormService, this,
      () => { return BlankOrigin(); }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh({ 'PageNumber': (newPageNumber + '') });
      }
    });

    this.sidebarService.collapse();

    this.Refresh();
  }

  private Refresh(params?: GetOriginsParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.seInv.GetAll(params).subscribe({
      next: d => {
        if (d.succeeded && !!d.data) {
          console.log('GetOrigins response: ', d); // TODO: only for debug
          if (!!d) {
            this.dbData = d.data.map(x => { return { data: x, uid: this.nextUid() }; });
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.currentPage = d.pageNumber;
          }
          this.RefreshTable();
        } else {
          this.toastrService.show(d.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
        }
      },
      error: err => this.cs.HandleError(err),
      complete: () => { this.isLoading = false; }
    });
  }

  private RefreshTable(): void {
    this.dbDataTable.Setup(
      this.dbData, this.dbDataDataSrc,
      this.allColumns, this.colDefs,
      this.colsToIgnore
    );
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(false);
      // this.kbS.InsertNavigatable(this.dbDataTable, AttachDirection.UP, this.searchInputNavigatable);
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
      this.dbDataTable.PushFooterCommandList();
    } else {
      this.fS.pushCommands(this.commands);
    }
  }
}
