import { Component, HostListener, Input } from '@angular/core';
import { NbDialogRef, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseNavigatableComponentComponent } from '../../base-navigatable-component/base-navigatable-component.component';
import { NavigatableType } from 'src/assets/model/navigation/Navigatable';
import { environment } from 'src/environments/environment';
import { StatusService } from 'src/app/services/status.service';

@Component({
  selector: 'app-select-table-dialog',
  templateUrl: './select-table-dialog.component.html',
  styleUrls: ['./select-table-dialog.component.scss']
})
export class SelectTableDialogComponent<T> extends BaseNavigatableComponentComponent {
  // @Input() allData: TreeGridNode<T>[] = [];
  @Input() searchString: string = '';
  @Input() allColumns: string[] = [];
  @Input() colDefs: ModelFieldDescriptor[] = [];

  override NavigatableType = NavigatableType.dialog

  shouldCloseOnEscape = true;

  protected Subscription_Search?: Subscription;

  responseMessage: string = '';

  closedManually: boolean = false;

  dbData!: TreeGridNode<T>[];
  dbDataSource!: NbTreeGridDataSource<TreeGridNode<T>>;
  dbDataTable!: SimpleNavigatableTable<T>;
  selectedRow!: T;

  isLoading: boolean = true;

  get showSpinnerOnTable(): boolean {
    return this.isLoading && !this.statusService.InProgress;
  }

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  private uid = 0;
  private tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  get themeClass(): string {
    return `theme-${environment.theme}`
  }

  constructor(
    protected dialogRef: NbDialogRef<SelectTableDialogComponent<T>>,
    protected kbS: KeyboardNavigationService,
    protected dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<T>>,
    protected statusService: StatusService
  ) {
    super();
    this.Setup();
  }

  Setup(): void {
    this.dbData = []; // this.allData;
    this.dbDataSource = this.dataSourceBuilder.create(this.dbData);
    this.selectedRow = {} as T;

    this.IsDialog = true;
    this.Matrix = [["active-prod-search", "btn-table-show-all", "btn-table-show-less"]];
    this.InnerJumpOnEnter = true;
    this.OuterJump = true;
  }

  Refresh(): void {

  }

  Search(searchString: string): void {

  }

  close(answer?: T) {
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable();
    this.dialogRef.close(answer);
  }

  nextUid(): number {
    ++this.uid
    return this.uid;
  }

  trackRows(index: number, row: any) {
    return row.uid;
  }

  handleEnter(event: any): void {
    this.kbS.toggleEdit();
  }

  selectRow(event: any, row: TreeGridNode<T>): void {
    if (!!event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.close(row.data);
  }

  refreshFilter(event: any): void {
    this.searchString = event.target.value;

    console.log("Search: ", this.searchString);

    if (this.searchString.length === 0) {
      this.Refresh();
    } else {
      this.Search(this.searchString);
    }
  }

  showAll(): void {
    if (this.searchString.length === 0) {
      this.Refresh();
    } else {
      this.Search(this.searchString);
    }
  }

  showLess(): void {
    if (this.searchString.length === 0) {
      this.Refresh();
    } else {
      this.Search(this.searchString);
    }
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Tab') {
      event.preventDefault();
    }
    switch (event.key) {
      case KeyBindings.exit: {
        if (this.shouldCloseOnEscape) {
          event.preventDefault();
          // Closing dialog
          this.close(undefined);
        }
        break;
      }
      default: { }
    }
  }
}
