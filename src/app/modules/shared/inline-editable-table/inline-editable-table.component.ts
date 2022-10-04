import { Component, Input, OnInit, Output, EventEmitter, HostListener, Optional } from '@angular/core';
import { NbDialogService, NbSortDirection, NbTreeGridDataSource } from '@nebular/theme';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { INavigatable } from 'src/assets/model/navigation/Navigatable';
import { NgNeatInputMasks } from 'src/assets/model/NgNeatInputMasks';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { DefaultKeySettings } from 'src/assets/util/KeyBindings';

export interface InputBlurredEvent { Event: any, Row: TreeGridNode<any>, RowPos: number, ObjectKey: string, ColPos: number }

@Component({
  selector: 'app-inline-editable-table',
  templateUrl: './inline-editable-table.component.html',
  styleUrls: ['./inline-editable-table.component.scss']
})
export class InlineEditableTableComponent implements OnInit {
  @Input() dbDataTable?: InlineEditableNavigatableTable<any>;
  @Input() allColumns: string[] = [];
  @Input() colDefs: ModelFieldDescriptor[] = [];
  @Input() dbDataTableId: any;
  @Input() dbDataDataSrc!: NbTreeGridDataSource<any>;
  @Input() trackRows: any;
  @Input() isLoading: boolean = true;
  @Input() showMsgOnNoData: boolean = true;
  @Input() wide: boolean = false;
  @Input() heightMargin: number = -1;
  @Input() checkIfDialogOpened: boolean = true;
  @Input() confirmRowDelete: boolean = false;

  @Output() focusInTable: EventEmitter<any> = new EventEmitter();
  @Output() focusOutTable: EventEmitter<any> = new EventEmitter();
  @Output() inputBlurred: EventEmitter<InputBlurredEvent> = new EventEmitter();

  @Input() parent: any = undefined;

  get currentNavigatable(): INavigatable | undefined {
    return this.kbs.GetCurrentNavigatable
  }
  get isEditModeOn(): boolean {
    return this.kbs.isEditModeActivated;
  }

  numberInputMask = NgNeatInputMasks.numberInputMask;
  offerDiscountInputMask = NgNeatInputMasks.offerDiscountInputMask;
  numberInputMaskInteger = NgNeatInputMasks.numberInputMaskInteger;

  customMaskPatterns = Constants.ProductCodePatterns;

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  public KeySetting: Constants.KeySettingsDct = DefaultKeySettings;

  constructor(@Optional() protected dialogService: NbDialogService,
              private sideBarService: BbxSidebarService, private kbs: KeyboardNavigationService,
              private bbxToastrService: BbxToastrService, private khs: KeyboardHelperService) {}

  focusOnTable(focusIn: boolean): void {
    if (focusIn) {
      this.focusInTable.emit('focusInTable');
    } else {
      this.focusOutTable.emit('focusOutTable');
    }
  }

  getTableClasses(): string {
    var classes = '';
    classes += this.heightMargin > -1 ? ('table-wrapper-height-margin-' + this.heightMargin) : '';
    if (this.heightMargin === -1) {
      classes += this.wide ? 'card-table-wrapper-wide' : 'card-table-wrapper-default'
      classes += this.sideBarService.sideBarOpened ? ' card-table-wrapper-opened-form' : ' card-table-wrapper-closed-form';
    }
    return classes;
  }

  ngOnInit(): void {
  }

  HandleGridEscape(event: Event, row: TreeGridNode<any>, rowPos: number, col: string, colPos: number): void {
    if (!this.ShouldContinueWithEvent(event)) {
      return;
    }
    this.dbDataTable?.HandleGridEscape(row, rowPos, col, colPos);
  }

  HandleGridMovement(event: KeyboardEvent, row: TreeGridNode<any>, rowPos: number, col: string, colPos: number, upward: boolean): void {
    if (!this.ShouldContinueWithEvent(event)) {
      return;
    }
    this.dbDataTable?.HandleGridMovement(event, row, rowPos, col, colPos, upward);
  }

  HandleKey(event: any, rowIndex: number): void {
    if (!this.ShouldContinueWithEvent(event)) {
      return;
    }
    this.dbDataTable?.HandleKey(event, rowIndex);
  }

  HandleGridDelete(event: Event, row: TreeGridNode<any>, rowPos: number, col: string): void {
    if (!this.ShouldContinueWithEvent(event)) {
      return;
    }
    if (this.confirmRowDelete) {
      HelperFunctions.confirm(this.dialogService, Constants.MSG_CONFIRMATION_DELETE, () => {
        this.dbDataTable?.HandleGridDelete(event, row, rowPos, col)
      });
    } else {
      this.dbDataTable?.HandleGridDelete(event, row, rowPos, col)
    }
  }

  HandleGridCodeFieldEnter(event: any, row: TreeGridNode<any>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!this.ShouldContinueWithEvent(event)) {
      return;
    }
    this.parent?.HandleGridCodeFieldEnter(event, row, rowPos, objectKey, colPos, inputId, fInputType);
  }

  HandleGridEnter(row: TreeGridNode<any>, rowPos: number, col: string, colPos: number, inputId: string, fInputType?: string, fromEditMode: boolean = true, fromClickMethod: boolean = false, navigatable?: INavigatable): void {
    if (!this.ShouldContinueWithEvent(event)) {
      return;
    }
    this.dbDataTable?.HandleGridEnter(row, rowPos, col, colPos, inputId, fInputType, fromEditMode, fromClickMethod, navigatable);
  }

  private ShouldContinueWithEvent(event: any): boolean {
    if ((this.checkIfDialogOpened && this.khs.IsDialogOpened) || this.khs.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return false;
    }
    if (!!event && this.bbxToastrService.IsToastrOpened) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      this.bbxToastrService.close();

      return false;
    }
    return true;
  }

  public inlineInputBlurred(event: any, row: TreeGridNode<any>, rowPos: number, col: string, colPos: number): void {
    this.inputBlurred.emit({ Event: event, Row: row, RowPos: rowPos, ObjectKey: col, ColPos: colPos } as InputBlurredEvent);
  }

}