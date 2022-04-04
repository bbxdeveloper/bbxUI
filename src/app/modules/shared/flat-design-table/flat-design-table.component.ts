import { Component, Input, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/Nav';
import { KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-flat-design-table',
  templateUrl: './flat-design-table.component.html',
  styleUrls: ['./flat-design-table.component.scss']
})
export class FlatDesignTableComponent implements OnInit {
  @Input() dbDataTable?: FlatDesignNavigatableTable<any>;
  @Input() allColumns: string[] = [];
  @Input() colDefs: ModelFieldDescriptor[] = [];
  @Input() dbDataTableId: any;
  @Input() dbDataDataSrc: any;
  @Input() trackRows: any;
  @Input() isLoading: boolean = true;
  
  @Output() focusInTable: EventEmitter<any> = new EventEmitter();
  @Output() focusOutTable: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  focusOnTable(focusIn: boolean): void {
    if (focusIn) {
      this.focusInTable.emit('focusInTable');
    } else {
      this.focusOutTable.emit('focusOutTable');
    }
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case KeyBindings.F12: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`F12 Pressed: ${event}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case KeyBindings.F8: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`F12 Pressed: ${event}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case KeyBindings.F5: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`F5 Pressed: ${event}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      default: { }
    }
  }

}
