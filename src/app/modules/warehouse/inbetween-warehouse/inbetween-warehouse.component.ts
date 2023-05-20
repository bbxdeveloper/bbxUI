import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { WareHouseService } from '../services/ware-house.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { validDate } from 'src/assets/model/Validators';
import moment from 'moment';
import { BehaviorSubject, map, tap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { StatusService } from 'src/app/services/status.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { Constants } from 'src/assets/util/Constants';
import { Actions, GetFooterCommandListFromKeySettings, GetUpdatedKeySettings, KeyBindings, SummaryInvoiceKeySettings } from 'src/assets/util/KeyBindings';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { InbetweenWarehouseProduct } from '../models/InbetweenWarehouseProduct';
import { InputFocusChangedEvent, TableKeyDownEvent } from '../../shared/inline-editable-table/inline-editable-table.component';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';

@Component({
  selector: 'app-inbetween-warehouse',
  templateUrl: './inbetween-warehouse.component.html',
  styleUrls: ['./inbetween-warehouse.component.scss']
})
export class InbetweenWarehouseComponent implements OnInit, AfterViewInit, OnDestroy {

  public TileCssClass = TileCssClass

  public isLoading = false

  public KeySetting: Constants.KeySettingsDct = SummaryInvoiceKeySettings;
  private commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  public headerForm: FormGroup
  public headerFormNav: InlineTableNavigatableForm
  public headerFormId = 'header-form-id'

  public warehouseSelectionError = false
  public warehouses$ = new BehaviorSubject<string[]>([])
  public toWarehouses$ = new BehaviorSubject<string[]>([])

  public editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['bold', 'italic'],
      ['fontSize']
    ]
  };

  tableIsFocused = false
  dbDataTableId = 'inbetween-warehouse-data-table'
  dbData: TreeGridNode<InbetweenWarehouseProduct>[] = []
  dbDataDataSrc!: NbTreeGridDataSource<TreeGridNode<InbetweenWarehouseProduct>>
  dbDataTable!: InlineEditableNavigatableTable<InbetweenWarehouseProduct>;
  cellClass = 'PRODUCT'

  public allColumns = [
    'productCode',
    'productDescription',
    'quantity',
    'unitOfMeasureX',
    'currAvgCost',
    'value',
  ]
  public colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Termékkód', objectKey: 'productCode', colKey: 'productCode',
      defaultValue: '', type: 'string', mask: Constants.ProductCodeMask,
      colWidth: "30%", textAlign: "left", fInputType: 'code-field',
      keyAction: Actions.Create, fReadonly: true,
      keySettingsRow: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Termék felvétele', KeyType: Constants.KeyTypes.Fn }
    },
    {
      label: 'Megnevezés', objectKey: 'productDescription', colKey: 'productDescription',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "70%", textAlign: "left",
    },
   {
      label: 'Mennyiség', objectKey: 'quantity', colKey: 'quantity',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "100px", textAlign: "right", fInputType: 'formatted-number',
      // checkIfReadonly: (row: TreeGridNode<InvoiceLine>) => HelperFunctions.isEmptyOrSpaces(row.data.productCode),
    },
    {
      label: 'Me.e.', objectKey: 'unitOfMeasureX', colKey: 'unitOfMeasureX',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "80px", textAlign: "right"
    },
    {
      label: 'Ált. nyilv. ár', objectKey: 'currAvgCost', colKey: 'currAvgCost',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
    {
      label: 'Nettó', objectKey: 'value', colKey: 'value',
      defaultValue: '', type: 'number', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", fInputType: 'formatted-number'
    },
  ]

  constructor(
    private readonly tokenService: TokenStorageService,
    private readonly warehouseService: WareHouseService,
    private readonly commonService: CommonService,
    private readonly keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
    private readonly footerService: FooterService,
    private readonly statusService: StatusService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InbetweenWarehouseProduct>>,
  ) {
    this.headerForm = new FormGroup({
      fromWarehouse: new FormControl({ disabled: true }),
      toWarehouse: new FormControl('', [
        this.notSame.bind(this)
      ]),
      transferDate: new FormControl('Valami', [
        Validators.required,
        validDate,
        this.maxDate.bind(this)
      ]),
      note: new FormControl('')
    })

    this.headerFormNav = new InlineTableNavigatableForm(
      this.headerForm,
      this.keyboardService,
      this.cdref,
      [],
      this.headerFormId,
      AttachDirection.DOWN,
      {} as IInlineManager
    )

    this.headerFormNav.OuterJump = true

    this.dbDataDataSrc = dataSourceBuilder.create(this.dbData)

    this.dbDataTable = new InlineEditableNavigatableTable(
      dataSourceBuilder,
      this.keyboardService,
      this.footerService,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      () => {
        return new InbetweenWarehouseProduct();
      },
      {} as IInlineManager
    )

    this.dbDataTable.OuterJump = true
  }

  public ngOnDestroy(): void {
    this.keyboardService.Detach()
  }

  public ngAfterViewInit(): void {
    this.headerForm.controls['transferDate'].setValue(moment().format('YYYY-MM-DD'))

    this.keyboardService.SetCurrentNavigatable(this.headerFormNav)
    this.keyboardService.SelectFirstTile()
  }

  private maxDate(control: AbstractControl): ValidationErrors|null {
    const date = moment(control.value)
    if (!date.isValid()) {
      return null
    }

    const today = moment()
    return date.isAfter(today) ? { maxDate: { value: control.value } } : null
  }

  private notSame(control: AbstractControl): any {
    const otherValue = this.headerForm?.controls['fromWarehouse']?.value ?? ''

    this.warehouseSelectionError = !(control.value === '' && otherValue === '') && control.value === otherValue
  }

  public ngOnInit(): void {
    this.headerFormNav.GenerateAndSetNavMatrices(true)

    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      [], // this.colsToIgnore,
      this.cellClass,
    )

    this.cdref.detectChanges()

    this.statusService.waitForLoad()

    this.warehouseService.GetAll()
      .pipe(
        map(response => response.data?.map(x => ({ description: x.warehouseDescription, code: x.warehouseCode})) ?? []),
        tap(data => {
          const warehouseFromLogin = this.tokenService.wareHouse?.warehouseCode
          const warehouses = data.filter(x => x.code === warehouseFromLogin)
            .map(x => x.description) ?? []

          this.warehouses$.next(warehouses)
          this.headerForm.controls['fromWarehouse'].setValue(warehouses[0])
        }),
        tap(data => {
          const warehouses = data?.map(x => x.description) ?? []
          this.toWarehouses$.next(warehouses);
        }),
      )
      .subscribe({
        error: () => {
          this.commonService.HandleError.bind(this.commonService)
          this.statusService.waitForLoad(false)
        },
        complete: () => this.statusService.waitForLoad(false)
      })
  }

  public JumpToFirstCellAndNav(): void {
    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);
    // this.keyboardService.SetCurrentNavigatable(this.dbDataTable);
    this.keyboardService.SelectElementByCoordinate(0, 0);
    setTimeout(() => {
      this.keyboardService.ClickCurrentElement();
      this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);
    }, 100);
  }

  public inlineInputFocusChanged(event: InputFocusChangedEvent): void {
    if (!event.Focused) {
      // this.dbData.forEach(x => x.data.ReCalc());
      // this.RecalcNetAndVat();
    }

    if (event?.FieldDescriptor?.keySettingsRow && event?.FieldDescriptor?.keyAction) {
      if (event.Focused) {
        let k = GetUpdatedKeySettings(this.KeySetting, event.FieldDescriptor.keySettingsRow, event.FieldDescriptor.keyAction);
        this.commands = GetFooterCommandListFromKeySettings(k);
        this.footerService.pushCommands(this.commands);
      } else {
        let k = this.KeySetting;
        this.commands = GetFooterCommandListFromKeySettings(k);
        this.footerService.pushCommands(this.commands);
      }
    }
  }

  public focusOnTable(focusIn: boolean): void {
    this.tableIsFocused = focusIn;
    if (focusIn) {
      this.dbDataTable.PushFooterCommandList();
    } else {
      this.footerService.pushCommands(this.commands);
    }
  }

  public trackRows(index: number, row: any) {
    return row.uid;
  }

  public onTableFunctionKeyDown(event: TableKeyDownEvent): void {
    // this.HandleKeyDown(event);
  }
}
