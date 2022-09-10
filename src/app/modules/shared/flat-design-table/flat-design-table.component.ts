import { Component, Input, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource } from '@nebular/theme';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FlatDesignNoFormNavigatableTable } from 'src/assets/model/navigation/FlatDesignNoFormNavigatableTable';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/Nav';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Actions, DefaultKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';

export const FORMATTED_NUMBER_COL_TYPES = [
  'formatted-number', 'formatted-number-integer', 'param-padded-formatted-integer'
];
@Component({
  selector: 'app-flat-design-table',
  templateUrl: './flat-design-table.component.html',
  styleUrls: ['./flat-design-table.component.scss']
})
export class FlatDesignTableComponent implements OnInit {
  @Input() dbDataTable?: FlatDesignNavigatableTable<any> | FlatDesignNoFormNavigatableTable<any>;
  @Input() allColumns: string[] = [];
  @Input() allColumnsAsync: ReplaySubject<string[]> = new ReplaySubject<string[]>();
  @Input() colDefs: ModelFieldDescriptor[] = [];
  @Input() dbDataTableId: any;
  @Input() dbDataDataSrc!: NbTreeGridDataSource<any>;
  @Input() trackRows: any;
  @Input() isLoading: boolean = true;
  @Input() showMsgOnNoData: boolean = true;
  @Input() wide: boolean = false;
  @Input() heightMargin: number = -1;
  @Input() checkIfDialogOpened: boolean = true;
  
  @Output() focusInTable: EventEmitter<any> = new EventEmitter();
  @Output() focusOutTable: EventEmitter<any> = new EventEmitter();

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  public KeySetting: Constants.KeySettingsDct = DefaultKeySettings;

  constructor(private sideBarService: BbxSidebarService, private kbs: KeyboardNavigationService, private khs: KeyboardHelperService) {}

  GetDateString(val: string): string {
    return HelperFunctions.GetDateStringFromDate(val)
  }

  changeSort(sortRequest: NbSortRequest): void {
    this.dbDataDataSrc.sort(sortRequest);
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;

    setTimeout(() => {
      this.dbDataTable?.GenerateAndSetNavMatrices(false, undefined, true);
    }, 50);
  }

  getDirection(column: string): NbSortDirection {
    if (column === this.sortColumn) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  ngOnInit(): void {}

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
    }
    classes += this.sideBarService.sideBarOpened ? ' card-table-wrapper-opened-form' : ' card-table-wrapper-closed-form';
    return classes;
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if ((this.checkIfDialogOpened && this.khs.IsDialogOpened) || this.khs.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      case this.KeySetting[Actions.JumpToForm].KeyCode: {
        // TODO: 'active-prod-search' into global variable
        if ((event as any).target.id !== 'active-prod-search') {
          return;
        }

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`Tab on searchfield Pressed: ${event}`);
        this.dbDataTable?.HandleSearchFieldTab();
        break;
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`F12 Pressed: ${event}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.CrudNew].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`F12 Pressed: ${event}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`F5 Pressed: ${event}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Lock].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`F5 Pressed: ${event}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.CrudEdit].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`F5 Pressed: ${event}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.CrudDelete].KeyCode: {
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
