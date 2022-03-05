import { Component, OnInit, ViewChild, Optional, ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { NbTable, NbTreeGridDataSource, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService } from "@nebular/theme";
import { BbxSidebarService } from "src/app/services/bbx-sidebar.service";
import { CommonService } from "src/app/services/common.service";
import { FooterService } from "src/app/services/footer.service";
import { KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { SideBarFormService } from "src/app/services/side-bar-form.service";
import { FooterCommandInfo } from "src/assets/model/FooterCommandInfo";
import { ModelFieldDescriptor } from "src/assets/model/ModelFieldDescriptor";
import { FlatDesignNavigatableTable } from "src/assets/model/navigation/FlatDesignNavigatableTable";
import { TileCssClass, AttachDirection } from "src/assets/model/navigation/Navigatable";
import { TreeGridNode } from "src/assets/model/TreeGridNode";
import { IUpdater, IUpdateRequest } from "src/assets/model/UpdaterInterfaces";
import { Constants } from "src/assets/util/Constants";
import { BaseManagerComponent } from "../../shared/base-manager/base-manager.component";
import { ConfirmationDialogComponent } from "../../shared/confirmation-dialog/confirmation-dialog.component";
import { DeletePocRequest } from "../models/DeletePocRequest";
import { GetPocsParamListModel } from "../models/GetPocsParamListModel";
import { Poc, BlankPoc } from "../models/Poc";
import { PocService } from "../services/poc.service";

@Component({
  selector: 'app-poc-manager',
  templateUrl: './poc-manager.component.html',
  styleUrls: ['./poc-manager.component.scss']
})
export class PocManagerComponent extends BaseManagerComponent<Poc> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  dbDataTableId = 'poc-table';
  dbDataTableEditId = "user-cell-edit-input";

  colsToIgnore: string[] = [];
  allColumns = [
    'id', 'pocName', 'pocType', 'active', 'comment'
  ];
  colDefs: ModelFieldDescriptor[] = [
    { label: 'Azonosító', objectKey: 'id', colKey: 'id', defaultValue: '', type: 'string', fInputType: 'readonly', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: TileCssClass },
    { label: 'Név', objectKey: 'pocName', colKey: 'pocName', defaultValue: '', type: 'string', fInputType: 'text', fRequired: true, mask: "", colWidth: "30%", textAlign: "left", navMatrixCssClass: TileCssClass },
    { label: 'Típus', objectKey: 'pocType', colKey: 'pocType', defaultValue: '', type: 'string', fInputType: 'text', mask: "Set in sidebar form.", colWidth: "15%", textAlign: "left", navMatrixCssClass: TileCssClass },
    { label: 'Aktív', objectKey: 'active', colKey: 'active', defaultValue: '', type: 'bool', fInputType: 'bool', fRequired: false, mask: "", colWidth: "25%", textAlign: "left", navMatrixCssClass: TileCssClass },
    { label: 'Megjegyzés', objectKey: 'comment', colKey: 'comment', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "25%", textAlign: "left", navMatrixCssClass: TileCssClass },
  ]

  searchString: string = '';

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Poc>>,
    private seInv: PocService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private cs: CommonService
  ) {
    super(dialogService, kbS, fS, sidebarService);
    this.searchInputId = "active-prod-search";
    this.kbS.ResetToRoot();
    this.Setup();
  }

  override ProcessActionNew(data?: IUpdateRequest<Poc>): void {
    console.log("ActionNew: ", data?.data);
    if (!!data && !!data.data) {
      this.seInv.CreatePoc(data.data).subscribe({
        next: d => {
          if (d.succeeded && !!d.data) {
            this.dbData.push({ data: d.data } as TreeGridNode<Poc>);
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
  
  override ProcessActionPut(data?: IUpdateRequest<Poc>): void {
    console.log("ActionPut: ", data?.data, JSON.stringify(data?.data));
    if (!!data && !!data.data) {
      this.seInv.UpdatePoc(data.data).subscribe({
        next: d => {
          if (d.succeeded && !!d.data) {
            this.dbData[data.rowIndex] = { data: d.data } as TreeGridNode<Poc>;
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

  override ProcessActionDelete(data?: IUpdateRequest<Poc>): void {
    const id = data?.data?.id;
    console.log("ActionDelete: ", id);
    if (id !== undefined) {
      this.seInv.DeletePoc({
        id: id
      } as DeletePocRequest).subscribe({
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
      pocName: new FormControl(undefined, [Validators.required]),
      pocType: new FormControl(undefined, []),
      active: new FormControl(undefined, []),
      comment: new FormControl(undefined, []),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm, 'Poc', this.dataSourceBuilder, this.kbS, this.fS, this.cdref, this.dbData, this.dbDataTableId, AttachDirection.DOWN,
      'sideBarForm', AttachDirection.RIGHT, this.sidebarService, this.sidebarFormService, this,
      () => { return BlankPoc(); }
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

  private Refresh(params?: GetPocsParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.seInv.GetPocs(params).subscribe({
      next: d => {
        if (d.succeeded && !!d.data) {
          console.log('GetPocs response: ', d); // TODO: only for debug
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
}
