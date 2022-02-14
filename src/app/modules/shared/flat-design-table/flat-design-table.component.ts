import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ColDef';
import { Nav } from 'src/assets/model/Navigatable';

@Component({
  selector: 'app-flat-design-table',
  templateUrl: './flat-design-table.component.html',
  styleUrls: ['./flat-design-table.component.scss']
})
export class FlatDesignTableComponent implements OnInit {
  @Input() dbDataTable?: Nav.FlatDesignNavigatableTable<any>;
  @Input() allColumns: string[] = [];
  @Input() colDefs: ModelFieldDescriptor[] = [];
  @Input() dbDataTableId: any;
  @Input() dbDataDataSrc: any;
  @Input() trackRows: any;
  
  @Output() focusInTable: EventEmitter<any> = new EventEmitter();
  @Output() focusOutTable: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  focusOnTable(focusIn: boolean): void {
    if (focusIn) {
      this.focusInTable.emit('focusInTable');
    } else {
      this.focusOutTable.emit('focusOutTable');
    }
  }

}
