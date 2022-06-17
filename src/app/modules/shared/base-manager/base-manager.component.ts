import { Component, HostListener, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbDialogService, NbTreeGridDataSource } from '@nebular/theme';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { TileCssClass } from 'src/assets/model/navigation/Nav';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { Actions, DefaultKeySettings, OfferNavKeySettings } from 'src/assets/util/KeyBindings';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-base-manager',
  templateUrl: './base-manager.component.html',
  styleUrls: ['./base-manager.component.scss']
})
export class BaseManagerComponent<T> {
  searchInputId?: string;
  searchString: string = '';

  dbDataTableId: string = '';
  dbDataTableEditId: string = '';

  colsToIgnore: string[] = [];
  allColumns: string[] = [];
  colDefs: ModelFieldDescriptor[] = [];

  dbDataTableForm!: FormGroup;
  dbData!: TreeGridNode<T>[];
  dbDataDataSrc!: NbTreeGridDataSource<TreeGridNode<T>>;
  dbDataTable!: FlatDesignNavigatableTable<T>;

  tableIsFocused: boolean = false;
  
  isLoading: boolean = true;
  
  get isSideBarOpened(): boolean {
    return this.sidebarService.sideBarOpened;
  }
  
  private uid = 0;
  protected nextUid() {
    ++this.uid;
    return this.uid;
  }

  get getInputParams(): any {
    return {};
  }

  commands: FooterCommandInfo[] = [
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
    @Optional() protected dialogService: NbDialogService,
    protected kbS: KeyboardNavigationService,
    protected fS: FooterService,
    protected sidebarService: BbxSidebarService,
    protected cs: CommonService,
    protected sts: StatusService) {
  }

  GetPageCount(recordsFiltered: number, pageSize: number): number {
    const tmp = Math.round(recordsFiltered / pageSize);
    return tmp === 0 ? 1 : tmp;
  }
  
  HandleError(err: any): void {
    this.cs.HandleError(err);
    this.isLoading = false;
    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
  }

  HandleGridSelectionAfterDelete(indexOfDeleteItem: number): void {
    if (this.dbData.length > indexOfDeleteItem) {
      this.RefreshTable((this.dbData[indexOfDeleteItem].data as any).id);
    } else if (this.dbData.length > 0) {
      this.RefreshTable((this.dbData[this.dbData.length - 1].data as any).id);
    } else {
      this.RefreshTable();
      this.dbDataTable.SetBlankInstanceForForm(false, false);
      this.dbDataTable.flatDesignForm.SetFormStateToNew();
    }
    this.dbDataTable.flatDesignForm.SetFormStateToDefault();
  }

  ActionNew(data?: IUpdateRequest<T>): void {
    console.log("ActionNew: ", data);

    if (data?.needConfirmation) {
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
                this.ProcessActionNew(data);
              }
            });
          } else {
            this.ProcessActionNew(data);
          }
        }
      });
    } else {
      this.ProcessActionNew(data);
    }
  }
  ProcessActionNew(data?: IUpdateRequest<T>): void { }

  ActionReset(data?: IUpdateRequest<T>): void {
    this.ProcessActionReset(data);
  }
  ProcessActionReset(data?: IUpdateRequest<T>): void {
    this.dbDataTable.ResetForm();
  }

  ActionPut(data?: IUpdateRequest<T>): void {
    console.log("ActionPut: ", data);
    if (data?.needConfirmation) {
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
                this.ProcessActionPut(data);
              }
            });
          } else {
            this.ProcessActionPut(data);
          }
        }
      });
    } else {
      this.ProcessActionPut(data);
    }
  }
  ProcessActionPut(data?: IUpdateRequest<T>): void { }

  ActionDelete(data?: IUpdateRequest<T>): void {
    console.log("ActionDelete: ", data);
    if (data?.needConfirmation) {
      const dialogRef = this.dialogService.open(
        ConfirmationDialogComponent,
        { context: { msg: Constants.MSG_CONFIRMATION_DELETE } }
      );
      dialogRef.onClose.subscribe(res => {
        if (res) {
          this.ProcessActionDelete(data);
        }
      });
    } else {
      this.ProcessActionDelete(data);
    }
  }
  ProcessActionDelete(data?: IUpdateRequest<T>): void { }

  ActionRefresh(data?: IUpdateRequest<T>): void {
    this.Refresh(this.getInputParams);
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case DefaultKeySettings[Actions.Search].KeyCode: {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        if (this.searchInputId !== undefined) {
          console.log("F2 pressed, focusing search input");
          $(`#${this.searchInputId}`).trigger('focus');
        }
        break;
      }
      default: { }
    }
  }

  refreshFilter(event: any): void {
    if (this.searchString === event.target.value) {
      return;
    }
    this.searchString = event.target.value;

    console.log('Search: ', this.searchString);

    this.dbDataTable.resetPaginator();
    this.search();
  }

  clearSearch(input?: any): void {
    if (input !== undefined) {
      input.value = '';
    } else {
      $('#' + this.searchInputId!).val('');
    }

    this.searchString = '';

    this.dbDataTable.resetPaginator();
    this.search();
  }

  search(): void {
    this.Refresh(this.getInputParams);
  }

  Refresh(params?: any): void {}

  RefreshTable(selectAfterRefresh?: any): void {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore
    );
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(false, selectAfterRefresh);
    }, 200);
  }

  trackRows(index: number, row: any) {
    return row.uid;
  }

  focusOnTable(focusIn: boolean): void {
    this.tableIsFocused = focusIn;
    if (this.isSideBarOpened) {
      return;
    }
    if (focusIn) {
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
      this.dbDataTable.PushFooterCommandList();
    } else {
      this.fS.pushCommands(this.commands);
    }
  }

}
