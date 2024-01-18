import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource } from '@nebular/theme';
import { ReplaySubject } from 'rxjs';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FlatDesignNoFormNavigatableTable } from 'src/assets/model/navigation/FlatDesignNoFormNavigatableTable';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/Nav';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { DefaultKeySettings } from 'src/assets/util/KeyBindings';
import { environment } from 'src/environments/environment';
import { isIStatusProvider } from '../IStatusProvider';
import { Status } from "../Status";
import { StatusService } from 'src/app/services/status.service';
import { CommonService } from 'src/app/services/common.service';
import { HtmlStringSanitizerPipe } from '../pipes/html-string-sanitizer.pipe';

export const FORMATTED_NUMBER_COL_TYPES = [
  'formatted-number', 'formatted-number-integer', 'param-padded-formatted-integer'
];
@Component({
  selector: 'app-flat-design-table',
  templateUrl: './flat-design-table.component.html',
  styleUrls: ['./flat-design-table.component.scss'],
  providers: [
    HtmlStringSanitizerPipe
  ]
})
export class FlatDesignTableComponent implements OnInit {
  @Input() dbDataTable?: FlatDesignNavigatableTable<any> | FlatDesignNoFormNavigatableTable<any>;
  @Input() allColumns: string[] = [];
  @Input() allColumnsAsync: ReplaySubject<string[]> = new ReplaySubject<string[]>();
  @Input() colDefs: ModelFieldDescriptor[] = [];
  @Input() dbDataTableId: any;
  @Input() dbDataDataSrc!: NbTreeGridDataSource<any>;
  @Input() trackRows: any;
  @Input() showMsgOnNoData: boolean = true;
  @Input() wide: boolean = false;
  @Input() compact: boolean = false;
  @Input() heightMargin: number = -1;

  @Input() isLoading: boolean = false;

  @Input() hidePaginator: boolean = false

  @Output() focusInTable: EventEmitter<any> = new EventEmitter();
  @Output() focusOutTable: EventEmitter<any> = new EventEmitter();

  get themeClass(): string {
    return `theme-${environment.theme}`
  }

  get showSpinnerOnTable(): boolean {
    return this.isLoading && !this.statusService.InProgress;
  }

  latestSort?: NbSortRequest
  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  public KeySetting: Constants.KeySettingsDct = DefaultKeySettings;

  constructor(
    private sideBarService: BbxSidebarService,
    private statusService: StatusService,
    private commonService: CommonService) {}
  
  GetColWidth(col: ModelFieldDescriptor): any {
    return HelperFunctions.GetHeaderColWidth(col, this.allColumns, this.dbDataTableId)
  }

  GetColMinWidth(col: ModelFieldDescriptor): any {
    return HelperFunctions.GetHeaderColWidth(col, this.allColumns, this.dbDataTableId, 'min')
  }

  GetDateString(val: string): string {
    return HelperFunctions.GetDateStringFromDate(val)
  }

  changeSort(sortRequest: NbSortRequest): void {
    this.dbDataDataSrc.sort(sortRequest)

    this.sortColumn = sortRequest.column
    this.sortDirection = sortRequest.direction

    this.latestSort = sortRequest

    this.dbDataTable?.data.sort(this.sortComparator.bind(this))

    setTimeout(() => {
      this.dbDataTable?.GenerateAndSetNavMatrices(false, undefined, true);
    }, 50);
  }

  sortComparator(
    na: TreeGridNode<any>,
    nb: TreeGridNode<any>,
  ): number {
    const key = this.latestSort!.column;
    const a = na.data[key];
    const b = nb.data[key];

    let res = 0;

    if (a > b) {
      res = 1
    }
    if (a < b) {
      res = -1
    }

    return this.latestSort!.direction === NbSortDirection.ASCENDING ? res : res * -1;
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
    if (this.compact) {
      classes += ' card-table-compact'
    } else {
      if (this.heightMargin === -1) {
        classes += this.wide ? 'card-table-wrapper-wide' : 'card-table-wrapper-default'
      }
      classes += this.sideBarService.sideBarOpened ? ' card-table-wrapper-opened-form' : ' card-table-wrapper-closed-form';
    }
    return classes;
  }

  private getStatus(row: TreeGridNode<any>): Status {
    return isIStatusProvider(row.data) ? row.data.getStatus() : Status.None
  }

  public isRowSuccess(row: TreeGridNode<any>): boolean {
    return this.getStatus(row) === Status.Success
  }

  public isRowWarning(row: TreeGridNode<any>): boolean {
    return this.getStatus(row) === Status.Warning
  }
}
