import { AfterContentInit, AfterViewChecked, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { IEditable } from 'src/assets/model/IEditable';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseNavigatableComponentComponent } from '../base-navigatable-component/base-navigatable-component.component';

@Component({
  selector: 'app-select-table-dialog',
  templateUrl: './select-table-dialog.component.html',
  styleUrls: ['./select-table-dialog.component.scss']
})
export class SelectTableDialogComponent<T extends IEditable> extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked {
  @Input() msg: string = "";
  @Input() allData: TreeGridNode<T>[] = []; 
  @Input() allColumns = [];
  @Input() colDefs: ModelFieldDescriptor[] = [];

  searchString: string = '';
  responseMessage: string = '';

  closedManually: boolean = false;

  dbData: TreeGridNode<T>[];
  dbDataSource: NbTreeGridDataSource<TreeGridNode<T>>;
  dbDataTable!: InlineEditableNavigatableTable<T>;
  selectedRow: T;

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  private uid = 0;
  private tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  constructor(
    protected dialogRef: NbDialogRef<SelectTableDialogComponent<T>>,
    private kbS: KeyboardNavigationService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<T>>,
  ) {
    super();

    this.dbData = this.allData;
    this.dbDataSource = this.dataSourceBuilder.create(this.dbData);
    this.selectedRow = {} as T;

    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button-yes", "confirm-dialog-button-no"]];
  }

  Refresh(): void {

  }

  Search(searchString: string): void {

  }

  override ngOnInit(): void {
    this.Refresh();
  }
  ngAfterContentInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.kbS.SelectFirstTile();
  }
  ngAfterViewChecked(): void {
    this.kbS.SelectCurrentElement();
  }
  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }

  close(answer?: T) {
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable();
    this.dialogRef.close(answer);
  }

  private nextUid(): number {
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
        event.preventDefault();
        // Closing dialog
        this.close(undefined);
        break;
      }
      default: { }
    }
  }
}
