import { Component, Input, OnInit, Output, EventEmitter, HostListener, Optional, ViewChild } from '@angular/core';
import { NbDialogService, NbPopoverDirective, NbSortDirection, NbTreeGridDataSource } from '@nebular/theme';
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
import { Actions, DefaultKeySettings, GeneralFlatDesignKeySettings, IsKeyFunctionKey, KeyBindings } from 'src/assets/util/KeyBindings';
import { environment } from 'src/environments/environment';

export interface InputFocusChangedEvent {
    Event: any,
    Row: TreeGridNode<any>,
    RowPos: number,
    FieldDescriptor: ModelFieldDescriptor,
    ColPos: number,
    Focused: boolean,
    CtrlKey: boolean,
    Shift: boolean
}

export interface TableKeyDownEvent {
    Event: any,
    Row: TreeGridNode<any>,
    RowPos: number,
    ObjectKey: string,
    ColPos: number,
    InputID?: string,
    FInputType?: string,
    WasInNavigationMode: boolean
}

export function isTableKeyDownEvent(event: TableKeyDownEvent | Event): event is TableKeyDownEvent {
  return (event as TableKeyDownEvent).Row !== undefined;
}

/**
 * ID of active input HTML element in table cell.
 * This is used for all table cell inputs.
 */
export const EditedCellId = 'PRODUCT-EDIT';

export const SelectFirstCharClass = 'select-first-char';

/**
 * Use with @see InlineEditableTableComponent to set cursor to the very beginning of input.
 * @param timeout
 */
export function selectProcutCodeInTableInput(timeout: number = 200): void {
  setTimeout(function () {
    const input = document.getElementById(EditedCellId) as HTMLInputElement

    input?.focus()

    const value = input.value.replace(/_+/, '')
    input.setSelectionRange(0, value.length)
  }, timeout)
}

@Component({
  selector: 'app-inline-editable-table',
  templateUrl: './inline-editable-table.component.html',
  styleUrls: ['./inline-editable-table.component.scss']
})
export class InlineEditableTableComponent implements OnInit {
  @ViewChild(NbPopoverDirective) popover?: NbPopoverDirective;

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
  @Input() isRowInErrorState: (row: any) => boolean = (row: any) => false

  @Output() focusInTable: EventEmitter<any> = new EventEmitter();
  @Output() focusOutTable: EventEmitter<any> = new EventEmitter();
  @Output() inputFocusChanged: EventEmitter<InputFocusChangedEvent> = new EventEmitter();

  /**
   * Esemény billentyűleütés jelzéséhez.
   */
  @Output() tableKeyDown: EventEmitter<TableKeyDownEvent> = new EventEmitter();

  @Input() parent: any = undefined;

  get themeClass(): string {
    return `theme-${environment.theme}`
  }

  /**
   * Proxy for @see EditedCellId to use it in the HTML.
   */
  get InputId(): string { return EditedCellId }

  get currentNavigatable(): INavigatable | undefined {
    return this.kbs.GetCurrentNavigatable
  }
  get isEditModeOn(): boolean {
    return !this.kbs.isNavigationModeActivated;
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

  ngOnInit(): void { }

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

  SelectFirstChar(classStr: string, cursorAfterLastChar: boolean = false, value?: string): void {
    setTimeout(() => {
      HelperFunctions.SelectBeginningByClass(classStr, 0, cursorAfterLastChar, value);
    }, 100);
  }

  /**
   * Táblázaton történő billentyűleütés kezelése.
   * Többi kezelő függvény innen hívódik.
   * @param event
   * @param row
   * @param rowPos
   * @param objectKey
   * @param colPos
   * @param inputId
   * @param fInputType
   * @param fromEditMode
   * @param fromClickMethod
   * @param navigatable
   * @returns
   */
  HandleGridKeydown(event: any, row: TreeGridNode<any>, rowPos: number, objectKey: string, colPos: number,
                    inputId?: string, fInputType?: string, fromEditMode: boolean = true, fromClickMethod: boolean = false, navigatable?: INavigatable): void {
    /**
     * VISSZATÉRÉS FÜGGVÉNYBŐL
     */
    if (environment.inlineEditableTableKeyboardDebug) {
      console.log(this.HandleGridKeydown.name, event)
    }
    if (!this.khs.ShouldContinueWithEvent(event)) {
      return;
    }
    /**
     * SPACE KEZELÉSE
     */
    if (event.code === 'Space' && this.kbs.IsElementCheckbox(inputId)) {
      HelperFunctions.StopEvent(event)
      $('#' + inputId).prop("checked", !$('#' + inputId).prop("checked"));
      row.data[objectKey] = $('#' + inputId).prop("checked");
    }
    /**
     * CTRL+ENTER KOMBINÁCIÓ KEZELÉSE
     */
    if (event.ctrlKey && event.key == KeyBindings.Enter && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      this.EmitKeydownEvent(
        event, row, rowPos, objectKey, colPos, inputId, fInputType,
        !this.isEditModeOn, event.ctrlKey, event.shiftKey
      );

      return;
    }
    /**
     * EGYÉB BILLENTYŰK LEKEZELÉSE
     */
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
          this.HandleGridCodeFieldEnter(event, row, rowPos, objectKey, colPos, EditedCellId, fInputType);
        } else {
          this.HandleGridEnter(row, rowPos, objectKey, colPos, EditedCellId, fInputType, this.isEditModeOn, true, this.currentNavigatable);
        }
        return;

      default:
        break;
    }
    /**
     * EmitKeydownEvent
     */
    if (environment.inlineEditableTableKeyboardDebug) {
      console.log('IsKeyFunctionKey: ', event.key, GeneralFlatDesignKeySettings)
    }
    if (IsKeyFunctionKey(event.key)) {
      this.EmitKeydownEvent(
        event, row, rowPos, objectKey, colPos, inputId, fInputType,
        !this.isEditModeOn, event.ctrlKey, event.shiftKey
      );
    }
  }

  public EmitKeydownEvent(
      event: any, row: TreeGridNode<any>, rowPos: number, objectKey: string,
      colPos: number, inputId?: string, fInputType?: string,
      wasInNavigationMode: boolean = false, ctrl: boolean = false, shift: boolean = false): void {
    if (environment.inlineEditableTableKeyboardDebug) console.log(this.EmitKeydownEvent.name, event)
    this.tableKeyDown.emit({
      Event: event,
      Row: row,
      RowPos: rowPos,
      ObjectKey: objectKey,
      ColPos: colPos,
      InputID: inputId,
      FInputType: fInputType,
      WasInNavigationMode: wasInNavigationMode,
      CtrlKey: ctrl,
      ShiftKey: shift
    } as TableKeyDownEvent);
  }

  public inlineInputFocusChange(event: any, row: TreeGridNode<any>, rowPos: number,
    col: ModelFieldDescriptor, colPos: number,
    focused: boolean, selectFirst: boolean = false, cursorAfterLastChar: boolean = false): void {
    if (selectFirst) {
      this.SelectFirstChar('select-first-char', cursorAfterLastChar, row.data[col.colKey]);
    }
    this.inputFocusChanged.emit({ Event: event, Row: row, RowPos: rowPos, FieldDescriptor: col, ColPos: colPos, Focused: focused } as InputFocusChangedEvent);
  }

  private HandleGridEscape(event: Event, row: TreeGridNode<any>, rowPos: number, col: string, colPos: number): void {
    if (environment.inlineEditableTableKeyboardDebug) console.log(this.HandleGridEscape.name, event)
    if (!this.khs.ShouldContinueWithEvent(event)) {
      return;
    }
    this.dbDataTable?.HandleGridEscape(row, rowPos, col, colPos);
  }

  private HandleGridMovement(event: KeyboardEvent, row: TreeGridNode<any>, rowPos: number, col: string, colPos: number, upward: boolean): void {
    if (environment.inlineEditableTableKeyboardDebug) console.log(this.HandleGridMovement.name, event)
    if (!this.khs.ShouldContinueWithEvent(event)) {
      return;
    }
    this.dbDataTable?.HandleGridMovement(event, row, rowPos, col, colPos, upward);
  }

  private HandleGridCodeFieldEnter(event: any, row: TreeGridNode<any>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (environment.inlineEditableTableKeyboardDebug) console.log(this.HandleGridCodeFieldEnter.name, event)
    if (!this.khs.ShouldContinueWithEvent(event)) {
      return;
    }
    this.parent?.HandleGridCodeFieldEnter(event, row, rowPos, objectKey, colPos, inputId, fInputType);
  }

  private HandleGridEnter(row: TreeGridNode<any>, rowPos: number, col: string, colPos: number, inputId: string, fInputType?: string, fromEditMode: boolean = true, fromClickMethod: boolean = false, navigatable?: INavigatable): void {
    if (environment.inlineEditableTableKeyboardDebug) console.log(this.HandleGridEnter.name, event)
    if (!this.khs.ShouldContinueWithEvent(event)) {
      return;
    }
    this.dbDataTable?.HandleGridEnter(row, rowPos, col, colPos, inputId, fInputType, fromEditMode, fromClickMethod, navigatable);
  }

  //#region CALCULATOR

  public openCalculator(event: any): void {
    HelperFunctions.StopEvent(event)
    if (!this.popover?.isShown) {
      this.popover?.show()
    } else {
      this.popover?.hide()
    }
  }

  public closeCalculator(): void {
    this.popover?.hide()
    this.kbs.ClickCurrentElement()
  }

  //#endregion CALCULATOR

  //#region HostListener

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

  //#endregion HostListener
}