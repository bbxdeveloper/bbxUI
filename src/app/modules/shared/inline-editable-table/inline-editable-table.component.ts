import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NbSortDirection, NbTreeGridDataSource } from '@nebular/theme';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { NgNeatInputMasks } from 'src/assets/model/NgNeatInputMasks';
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

  constructor() { }

  focusOnTable(focusIn: boolean): void {
    if (focusIn) {
      this.focusInTable.emit('focusInTable');
    } else {
      this.focusOutTable.emit('focusOutTable');
    }
  }

  ngOnInit(): void {
  }

}
