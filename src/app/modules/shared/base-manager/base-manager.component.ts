import { Component, HostListener, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbDialogService, NbSidebarService, NbTreeGridDataSource } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { Actions, DefaultKeySettings, GeneralFlatDesignKeySettings, GetFooterCommandListFromKeySettings, InvoiceKeySettings, OfferNavKeySettings } from 'src/assets/util/KeyBindings';
import { ConfirmationDialogComponent } from '../simple-dialogs/confirmation-dialog/confirmation-dialog.component';
import { LoggerService } from 'src/app/services/logger.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

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
    return this.bbxSidebarService.sideBarOpened;
  }
  
  private uid = 0;
  protected nextUid() {
    ++this.uid;
    return this.uid;
  }

  get getInputParams(): any {
    return {};
  }

  public KeySetting: Constants.KeySettingsDct = GeneralFlatDesignKeySettings;
  public commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);
  
  protected Subscription_Refresh?: Subscription;

  constructor(
    @Optional() protected dialogService: NbDialogService,
    protected kbS: KeyboardNavigationService,
    protected fS: FooterService,
    protected bbxSidebarService: BbxSidebarService,
    protected cs: CommonService,
    protected sts: StatusService,
    protected loggerService: LoggerService) {
      this.bbxSidebarService.collapse();
  }

  UpdateKeySettingsAndCommand(): void {
    this.commands = GetFooterCommandListFromKeySettings(this.KeySetting)
    this.dbDataTable.KeySetting = this.KeySetting
    this.dbDataTable.flatDesignForm.KeySetting = this.KeySetting
    this.dbDataTable.flatDesignForm.commandsOnForm = this.commands
    this.dbDataTable.commandsOnTable = this.commands
    this.dbDataTable.PushFooterCommandList()
    this.fS.pushCommands(this.commands)
  }

  SelectedRowProperty(objectKey: string): any {
    // Nem a táblázaton állunk || jelenlegi pozíciónk kilóg a tábla tartományából
    if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.dbDataTable?.data?.length <= this.kbS.p.y) {
      return '-';
    }
    const data = this.dbDataTable?.data[this.kbS.p.y]?.data;
    return (data as any)[objectKey];
  }
  
  HandleError(err: any): void {
    this.cs.HandleError(err, '', false);
    this.isLoading = false;
    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
    this.kbS.ClickCurrentElement()
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

  ActionExit(data?: IUpdateRequest<T>): void {
    this.loggerService.info(`${this.ActionExit.name}: ${JSON.stringify(data)}`)

    if (!data?.needConfirmation) {
      this.ProcessActionExit(data);
    } else {
      const dialogRef = this.dialogService.open(
        ConfirmationDialogComponent,
        { context: { msg: Constants.MSG_CONFIRMATION_SAVE } }
      );
      dialogRef.onClose.subscribe(res => {
        if (!res) {
          this.dbDataTable.SetFormReadonly(false)
          this.kbS.SelectFirstTile()
          this.kbS.ClickCurrentElement()
        } else {
          if (HelperFunctions.isEmptyOrSpaces(this.searchString)) {
            this.ProcessActionExit(data);
          } else {
            const dialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_FILTER_DELETE } });
            dialogRef.onClose.subscribe(res => {
              if (res) {
                this.clearSearch();
              }
              this.ProcessActionExit(data);
            });
          }
        }
      });
    }
  }
  ProcessActionExit(data?: IUpdateRequest<T>): void {
    setTimeout(() => {
      if (data === undefined || data.data === undefined) {
        this.ExitWithNewOrEmptyData()
      }

      const dataToRecords = this.CompareDataToRecords(data?.data)

      if (dataToRecords > -1) {
        data!.needConfirmation = this.dbDataTable.flatDesignForm.defaultConfirmationSettings['ActionPut']
        if (!this.dbDataTable.flatDesignForm.form.invalid && data?.needSaveConfirmationOnExit) {
          this.ActionPutOnExit(data)
        } else {
          this.RefreshTable(HelperFunctions.GetFieldValueFromGeneric((data as any).data));
        }
      } else {
        if (!this.dbDataTable.flatDesignForm.form.invalid) {
          data!.needConfirmation = this.dbDataTable.flatDesignForm.defaultConfirmationSettings['ActionNew']
          this.ActionNewOnExit(data)
        } else {
          this.ExitWithNewOrEmptyData()
        }
        if (this.dbDataTable.lastKnownSelectedRow !== undefined && this.dbDataTable.lastKnownSelectedRow.data !== undefined) {
          if (this.dbData.length > 0 && this.CompareDataToRecords((this.dbDataTable.lastKnownSelectedRow as any).data)) {
            const prevId = HelperFunctions.GetFieldValueFromGeneric((this.dbDataTable.lastKnownSelectedRow as any).data)
            this.RefreshTable(prevId);
          }
        }
      }
    }, 300);
  }
  ExitWithNewOrEmptyData(): void {
    if (this.dbData.length === 0 && !this.dbDataTable.includeSearchInNavigationMatrix) {
      this.kbS.SetPosition(0, 0)
      this.kbS.ResetToRoot()
      this.kbS.SelectFirstTile()
    } else {
      this.kbS.SetCurrentNavigatable(this.dbDataTable)
      this.kbS.SelectFirstTile()
    }
  }

  /**
   * -1 = new record
   * 0 = existing record
   * 1 = updated existing record
   * @param data 
   * @returns 
   */
  CompareDataToRecords(data?: any): number {
    if (data === undefined) {
      return -1
    }

    const keys = Object.keys(data)
    const idKey = keys.find(x => x.toLowerCase() === 'id')!

    const item = this.dbData.find(x => (x.data as any)[idKey] === data[idKey])
    
    if (item !== undefined) {
      return 1
    } else {
      return -1
    }
  }

  ActionLock(data?: IUpdateRequest<T>): void {
    this.loggerService.info(`${this.ActionLock.name}: ${JSON.stringify(data)}`)
    
    if (!data?.needConfirmation) {
      this.ProcessActionLock(data);
    } else {
      const dialogRef = this.dialogService.open(
        ConfirmationDialogComponent,
        { context: { msg: Constants.MSG_CONFIRMATION_LOCK } }
      );
      dialogRef.onClose.subscribe(res => {
        if (res) {
          this.ProcessActionLock(data);
        }
      });
    }
  }
  ProcessActionLock(data?: IUpdateRequest<T>): void {}

  ActionNew(data?: IUpdateRequest<T>): void {
    this.loggerService.info(`${this.ActionNew.name}: ${JSON.stringify(data)}`)

    if (!data?.needConfirmation) {
      this.ProcessActionNew(data);
    } else {
      const dialogRef = this.dialogService.open(
        ConfirmationDialogComponent,
        { context: { msg: Constants.MSG_CONFIRMATION_SAVE } }
      );
      dialogRef.onClose.subscribe(res => {
        if (!res) {
          this.dbDataTable.SetFormReadonly(false)
          this.kbS.SelectFirstTile()
          this.kbS.ClickCurrentElement()
        } else {
          if (HelperFunctions.isEmptyOrSpaces(this.searchString)) {
            this.ProcessActionNew(data);
          } else {
            const dialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_FILTER_DELETE } });
            dialogRef.onClose.subscribe(res => {
              if (res) {
                this.clearSearch();
              }
              this.ProcessActionNew(data);
            });
          }
        }
      });
    }
  }
  ActionNewOnExit(data?: IUpdateRequest<T>): void {
    this.loggerService.info(`${this.ActionNewOnExit.name}: ${JSON.stringify(data)}`)

    if (!data?.needConfirmation) {
      this.ProcessActionNew(data);
    } else {
      const dialogRef = this.dialogService.open(
        ConfirmationDialogComponent,
        { context: { msg: Constants.MSG_CONFIRMATION_SAVE } }
      );
      dialogRef.onClose.subscribe(res => {
        if (!res) {
          this.ExitWithNewOrEmptyData()
          this.dbDataTableForm.reset()
        } else {
          if (HelperFunctions.isEmptyOrSpaces(this.searchString)) {
            this.ProcessActionNew(data);
          } else {
            const dialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_FILTER_DELETE } });
            dialogRef.onClose.subscribe(res => {
              if (res) {
                this.clearSearch();
              }
              this.ProcessActionNew(data);
            });
          }
        }
      });
    }
  }
  ProcessActionNew(data?: IUpdateRequest<T>): void { }

  ActionReset(data?: IUpdateRequest<T>): void {
    this.loggerService.info(`${this.ActionReset.name}: ${JSON.stringify(data)}`)

    this.ProcessActionReset(data);
  }
  ProcessActionReset(data?: IUpdateRequest<T>): void {
    this.dbDataTable.ResetForm();
  }

  ActionPut(data?: IUpdateRequest<T>): void {
    this.loggerService.info(`${this.ActionPut.name}: ${JSON.stringify(data)}`)
    
    if (!data?.needConfirmation) {
      this.ProcessActionPut(data);
    } else {
      const dialogRef = this.dialogService.open(
        ConfirmationDialogComponent,
        { context: { msg: Constants.MSG_CONFIRMATION_SAVE } }
      );
      dialogRef.onClose.subscribe(res => {
        if (!res) {
          this.dbDataTable.SetFormReadonly(false)
          this.kbS.SelectFirstTile()
          this.kbS.ClickCurrentElement()
        } else {
          if (HelperFunctions.isEmptyOrSpaces(this.searchString)) {
            this.ProcessActionPut(data);
          } else {
            const dialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_FILTER_DELETE } });
            dialogRef.onClose.subscribe(res => {
              if (res) {
                this.clearSearch();
              }
              this.ProcessActionPut(data);
            });
          }
        }
      });
    }
  }
  ActionPutOnExit(data?: IUpdateRequest<T>): void {
    this.loggerService.info(`${this.ActionPutOnExit.name}: ${JSON.stringify(data)}`)
    
    if (!data?.needConfirmation) {
      this.ProcessActionPut(data);
    } else {
      const dialogRef = this.dialogService.open(
        ConfirmationDialogComponent,
        { context: { msg: Constants.MSG_CONFIRMATION_SAVE } }
      );
      dialogRef.onClose.subscribe(res => {
        if (!res) {
          this.RefreshTable(HelperFunctions.GetFieldValueFromGeneric((data as any).data));
        } else {
          if (HelperFunctions.isEmptyOrSpaces(this.searchString)) {
            this.ProcessActionPut(data);
          } else {
            const dialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_FILTER_DELETE } });
            dialogRef.onClose.subscribe(res => {
              if (res) {
                this.clearSearch();
              }
              this.ProcessActionPut(data);
            });
          }
        }
      });
    }
  }
  ProcessActionPut(data?: IUpdateRequest<T>): void { }

  ActionDelete(data?: IUpdateRequest<T>): void {
    this.loggerService.info(`${this.ActionDelete.name}: ${JSON.stringify(data)}`)
    
    if (!data?.needConfirmation) {
      this.ProcessActionDelete(data);
    } else {
      const dialogRef = this.dialogService.open(
        ConfirmationDialogComponent,
        { context: { msg: Constants.MSG_CONFIRMATION_DELETE } }
      );
      dialogRef.onClose.subscribe(res => {
        if (res) {
          this.ProcessActionDelete(data);
        }
      });
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

  RefreshTable(selectAfterRefresh?: any, setAsCurrent: boolean = false): void {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore,
      undefined,
      !setAsCurrent
    );
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(false, selectAfterRefresh);
      if (setAsCurrent && this.dbDataTable.Matrix.length > 0 && this.dbDataTable.Matrix[0].length > 0) {
        this.kbS.SetCurrentNavigatable(this.dbDataTable)
        this.kbS.SelectFirstTile()
      }
      this.kbS.ClickCurrentElement(true)
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

  protected SetTableAndFormCommandListFromManager(): void {
    this.dbDataTable.flatDesignForm.KeySetting = this.KeySetting;
    this.dbDataTable.flatDesignForm.commandsOnForm = this.commands;

    this.dbDataTable.commandsOnTableEditMode = this.commands;
    this.dbDataTable.commandsOnTable = this.commands;
  }

}
