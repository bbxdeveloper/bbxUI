import { Component, HostListener, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbDialogService, NbTreeGridDataSource } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
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

  constructor(
    @Optional() protected dialogService: NbDialogService,
    protected kbS: KeyboardNavigationService) {}

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
  ProcessActionNew(data?: IUpdateRequest<T>): void {}

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
          this.ActionDelete(data);
        }
      });
    } else {
      this.ActionDelete(data);
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

}
