import { Component, Input, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { NbSortDirection, NbTreeGridDataSource } from '@nebular/theme';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { INavigatable } from 'src/assets/model/navigation/Navigatable';
import { NgNeatInputMasks } from 'src/assets/model/NgNeatInputMasks';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { DefaultKeySettings } from 'src/assets/util/KeyBindings';

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

  @Output() focusInTable: EventEmitter<any> = new EventEmitter();
  @Output() focusOutTable: EventEmitter<any> = new EventEmitter();

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

  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  public KeySetting: Constants.KeySettingsDct = DefaultKeySettings;

  constructor(private sideBarService: BbxSidebarService, private kbs: KeyboardNavigationService, private bbxToastrService: BbxToastrService) {}

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

  HandleGridEscape(row: TreeGridNode<any>, rowPos: number, col: string, colPos: number): void {
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
    this.dbDataTable?.HandleGridDelete(event, row, rowPos, col)
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
    if (!!event && this.bbxToastrService.IsToastrOpened) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      this.bbxToastrService.close();

      return false;
    }
    return true;
  }

}
