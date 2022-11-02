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
import { Actions, DefaultKeySettings, IsKeyFunctionKey, KeyBindings } from 'src/assets/util/KeyBindings';

export interface InputFocusChangedEvent { Event: any, Row: TreeGridNode<any>, RowPos: number, FieldDescriptor: ModelFieldDescriptor, ColPos: number, Focused: boolean }

export interface TableKeyDownEvent { Event: any, Row: TreeGridNode<any>, RowPos: number, ObjectKey: string, ColPos: number, InputID?: string, FInputType?: string, WasInNavigationMode: boolean }
export function isTableKeyDownEvent(event: TableKeyDownEvent | Event): event is TableKeyDownEvent {
  return (event as TableKeyDownEvent).Row !== undefined;
}

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
  @Input() confirmRowDelete: boolean = false;

  @Output() focusInTable: EventEmitter<any> = new EventEmitter();
  @Output() focusOutTable: EventEmitter<any> = new EventEmitter();
  @Output() inputFocusChanged: EventEmitter<InputFocusChangedEvent> = new EventEmitter();
  @Output() tableKeyDown: EventEmitter<TableKeyDownEvent> = new EventEmitter();

  @Input() parent: any = undefined;

  get currentNavigatable(): INavigatable | undefined {
    return this.kbs.GetCurrentNavigatable
  }
  get isEditModeOn(): boolean {
    return this.kbs.isEditModeActivated;
  }

  numberInputMask = NgNeatInputMasks.numberInputMask;
  numberInputMaskSingle = NgNeatInputMasks.numberInputMaskSingle;
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
    if (!this.khs.ShouldContinueWithEvent(event)) {
      return;
    }
    this.dbDataTable?.HandleGridEscape(row, rowPos, col, colPos);
  }

  HandleGridMovement(event: KeyboardEvent, row: TreeGridNode<any>, rowPos: number, col: string, colPos: number, upward: boolean): void {
    if (!this.khs.ShouldContinueWithEvent(event)) {
      return;
    }
    this.dbDataTable?.HandleGridMovement(event, row, rowPos, col, colPos, upward);
  }

  HandleGridCodeFieldEnter(event: any, row: TreeGridNode<any>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!this.khs.ShouldContinueWithEvent(event)) {
      return;
    }
    this.parent?.HandleGridCodeFieldEnter(event, row, rowPos, objectKey, colPos, inputId, fInputType);
  }

  HandleGridEnter(row: TreeGridNode<any>, rowPos: number, col: string, colPos: number, inputId: string, fInputType?: string, fromEditMode: boolean = true, fromClickMethod: boolean = false, navigatable?: INavigatable): void {
    if (!this.khs.ShouldContinueWithEvent(event)) {
      return;
    }
    this.dbDataTable?.HandleGridEnter(row, rowPos, col, colPos, inputId, fInputType, fromEditMode, fromClickMethod, navigatable);
  }

  HandleGridKeydown(event: any, row: TreeGridNode<any>, rowPos: number, objectKey: string, colPos: number,
                    inputId?: string, fInputType?: string, fromEditMode: boolean = true, fromClickMethod: boolean = false, navigatable?: INavigatable): void {
    if (!this.khs.ShouldContinueWithEvent(event)) {
      return;
    }
    switch ((event as KeyboardEvent).key) {
      case KeyBindings.up:
      case KeyBindings.down:
      case KeyBindings.left:
      case KeyBindings.right:
        this.HandleGridMovement(event, row, rowPos, objectKey, colPos, true);
        return;

      case KeyBindings.exit:
      case KeyBindings.exitIE:
        this.HandleGridEscape(event, row, rowPos, objectKey, colPos);
        return;

      case KeyBindings.Enter:
        if (colPos === 0) {
          this.HandleGridCodeFieldEnter(event, row, rowPos, objectKey, colPos, 'PRODUCT-EDIT', fInputType);
        } else {
          this.HandleGridEnter(row, rowPos, objectKey, colPos, 'PRODUCT-EDIT', fInputType, this.isEditModeOn, true, this.currentNavigatable);
        }
        return;
      
      default:
        break;
    }
    if (IsKeyFunctionKey(event.key)) {
      this.EmitKeydownEvent(
        event, row, rowPos, objectKey, colPos, inputId, fInputType, !this.isEditModeOn
      );
    }
  }

  public EmitKeydownEvent(event: any, row: TreeGridNode<any>, rowPos: number, objectKey: string, colPos: number, inputId?: string, fInputType?: string, wasInNavigationMode: boolean = false): void {
    this.tableKeyDown.emit({
      Event: event,
      Row: row,
      RowPos: rowPos,
      ObjectKey: objectKey,
      ColPos: colPos,
      InputID: inputId,
      FInputType: fInputType,
      WasInNavigationMode: wasInNavigationMode
    } as TableKeyDownEvent);
  }

  public inlineInputFocusChange(event: any, row: TreeGridNode<any>, rowPos: number, col: ModelFieldDescriptor, colPos: number, focused: boolean): void {
    this.inputFocusChanged.emit({ Event: event, Row: row, RowPos: rowPos, FieldDescriptor: col, ColPos: colPos, Focused: focused } as InputFocusChangedEvent);
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (this.khs.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      case KeyBindings.F5: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        break;
      }
      default: { }
    }
  }

}