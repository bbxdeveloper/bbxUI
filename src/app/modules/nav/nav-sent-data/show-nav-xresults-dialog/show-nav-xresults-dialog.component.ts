import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SelectTableDialogComponent } from '../../../shared/dialogs/select-table-dialog/select-table-dialog.component';
import { INavXResult } from '../../Models/NavXResult';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { StatusService } from 'src/app/services/status.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { Actions, KeyBindings } from 'src/assets/util/KeyBindings';
import { Constants } from 'src/assets/util/Constants';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';

@Component({
  selector: 'app-show-nav-xresults-dialog',
  templateUrl: './show-nav-xresults-dialog.component.html',
  styleUrls: ['./show-nav-xresults-dialog.component.scss']
})
export class ShowNavXResultsDialogComponent extends SelectTableDialogComponent<INavXResult> implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  public results: INavXResult[] = []

  TileCssClass = TileCssClass

  override allColumns = [
    'resultCode',
    'errorCode',
    'message',
    'line',
    'tag',
    'value',
  ]
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Kód', objectKey: 'resultCode', colKey: 'resultCode',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "80px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Hibakód', objectKey: 'errorCode', colKey: 'errorCode',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "290px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Üzenet', objectKey: 'message', colKey: 'message',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "100%", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Sor', objectKey: 'line', colKey: 'line',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "70px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Tag', objectKey: 'tag', colKey: 'tag',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "200px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Érték', objectKey: 'value', colKey: 'value',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "80px", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
  ];

  constructor(
    dialogRef: NbDialogRef<ShowNavXResultsDialogComponent>,
    keyboardService: KeyboardNavigationService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<INavXResult>>,
    statusService: StatusService,
    cdref: ChangeDetectorRef,
  ) {
    super(dialogRef, keyboardService, dataSourceBuilder, statusService)

    this.IsDialog = true

    this.dbDataTable = new SimpleNavigatableTable<INavXResult>(dataSourceBuilder, keyboardService, cdref, this.dbData, '', AttachDirection.DOWN, this)
  }

  override ngOnInit(): void {
    this.dbData = this.results.map(x => ({ data: this.limitResult(x), uid: this.nextUid() }))
    this.dbDataSource.setData(this.dbData)

    this.refreshTable()
  }

  ngAfterViewInit(): void {
    this.kbS.SetWidgetNavigatable(this)

    this.kbS.SelectFirstTile()
  }

  ngOnDestroy(): void {
    this.kbS.RemoveWidgetNavigatable()
  }

  private limitResult(original: INavXResult): INavXResult {
    const modified = { ...original }

    modified.resultCode = modified.resultCode.slice(0, 7)
    modified.errorCode = modified.errorCode.slice(0, 25)
    modified.line = modified.line?.slice(0, 4)
    modified.tag = modified.tag.slice(-15)
    modified.value = modified.value?.slice(0, 5)

    return modified
  }

  private refreshTable() {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataSource,
      this.allColumns,
      this.colDefs,
      [],
      'TABLE-CELL'
    )
  }

  override close() {
    this.dialogRef.close()
  }
}
