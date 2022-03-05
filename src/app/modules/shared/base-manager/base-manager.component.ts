import { Component, HostListener, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbDialogService, NbTreeGridDataSource } from '@nebular/theme';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { Actions, CrudManagerKeySettings } from 'src/assets/util/KeyBindings';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-base-manager',
  templateUrl: './base-manager.component.html',
  styleUrls: ['./base-manager.component.scss']
})
export class BaseManagerComponent<T> {
  searchInputId?: string;

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
    protected sidebarService: BbxSidebarService) {

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
          this.ProcessActionNew(data);
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
          this.ProcessActionPut(data);
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

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case CrudManagerKeySettings[Actions.TableSearch].KeyCode: {
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

  trackRows(index: number, row: any) {
    return row.uid;
  }

  focusOnTable(focusIn: boolean): void {
    this.tableIsFocused = focusIn;
    if (this.isSideBarOpened) {
      return;
    }
    if (focusIn) {
      this.dbDataTable.PushFooterCommandList();
    } else {
      this.fS.pushCommands(this.commands);
    }
  }

}
