import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { validDate } from 'src/assets/model/Validators';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { IInlineManager, ManagerResponse } from 'src/assets/model/IInlineManager';
import { WareHouse } from 'src/app/modules/warehouse/models/WareHouse';
import { WareHouseService } from 'src/app/modules/warehouse/services/ware-house.service';
import { WarehouseDocumentFilterFormData } from './WarehouseDocumentFilterFormData';
import { OfflineWhsTransferStatus, WhsTransferStatus } from '../../models/whs/WhsTransferStatus';
import { WhsTransferService } from '../../services/whs-transfer.service';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-warehouse-document-filter-form',
  templateUrl: './warehouse-document-filter-form.component.html',
  styleUrls: ['./warehouse-document-filter-form.component.scss'],
  providers: [WhsTransferService]
})
export class WarehouseDocumentFilterFormComponent implements OnInit, IInlineManager {
  @Input()
  public editDisabled!: boolean

  @Output()
  public refreshClicked = new EventEmitter<WarehouseDocumentFilterFormData | undefined>(undefined)

  @Output()
  public pageReady = new EventEmitter<void>()

  private localStorageKey: string

  get isEditModeOff(): boolean {
    return !this.keyboardService.isEditModeActivated
  }

  @Input()
  public set warehouseDocumentFormData(formData: WarehouseDocumentFilterFormData | undefined) {
    if (!formData) {
      return
    }

    const fromWareHouse = this.warehouses.find(x => x.warehouseCode === formData.FromWarehouseCode)?.warehouseDescription
    const toWareHouse = this.warehouses.find(x => x.warehouseCode === formData.ToWarehouseCode)?.warehouseDescription
    const status = this.statuses.find(x => x.value === formData.Status)?.text

    const controls = this.filterForm.controls
    controls['FromWarehouseCode'].setValue(fromWareHouse)
    controls['ToWarehouseCode'].setValue(toWareHouse)
    controls['FromDate'].setValue(formData.FromDate)
    controls['ToDate'].setValue(formData.ToDate)
    controls['Status'].setValue(status)
  }
  public get warehouseDocumentFormData() {
    const controls = this.filterForm.controls

    const fromWareHouse = this.warehouses.find(x => x.warehouseDescription === controls['FromWarehouseCode'].value)
    const toWareHouse = this.warehouses.find(x => x.warehouseDescription === controls['ToWarehouseCode'].value)
    const status = this.statuses.find(x => x.text === controls['Status'].value)?.value

    const formData = {
      FromWarehouseCode: fromWareHouse?.warehouseCode,
      ToWarehouseCode: toWareHouse?.warehouseCode,
      FromWarehouseId: fromWareHouse?.id ?? -1,
      ToWarehouseId: toWareHouse?.id ?? -1,
      Status: status,
      FromDate: controls['FromDate'].value,
      ToDate: controls['ToDate'].value
    } as WarehouseDocumentFilterFormData
    return formData
  }

  public TileCssClass = TileCssClass

  public filterForm!: FormGroup
  public filterFormId = 'stock-document-filter-form'
  filterFormNav!: InlineTableNavigatableForm
  outInvFormNav$ = new BehaviorSubject<InlineTableNavigatableForm[]>([])

  // WareHouse
  warehouses: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  // WhsTransferStatus
  statuses: WhsTransferStatus[] = []
  statuses$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])

  get fromDateValue(): Date | undefined {
    if (!this.filterForm) {
      return undefined;
    }


    const tmp = this.filterForm.controls['FromDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get toDateValue(): Date | undefined {
    if (!this.filterForm) {
      return undefined;
    }


    const tmp = this.filterForm.controls['ToDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  constructor(
    private readonly keyboardService: KeyboardNavigationService,
    private readonly wareHouseApi: WareHouseService,
    private readonly whsService: WhsTransferService,
    private readonly cs: CommonService,
    private readonly cdref: ChangeDetectorRef,
    private readonly localStorage: LocalStorageService,
    tokenService: TokenStorageService,
  ) {
    this.localStorageKey = 'warehouse-document-filter.' + tokenService.user?.id ?? 'everyone'

    this.filterForm = new FormGroup({
      FromWarehouseCode: new FormControl(undefined, []),
      ToWarehouseCode: new FormControl(undefined, []),
      Status: new FormControl(undefined, [Validators.required]),
      FromDate: new FormControl('', [
        this.validateFromDate.bind(this),
        validDate
      ]),
      ToDate: new FormControl('', [
        this.validateToDate.bind(this),
        validDate
      ])
    });
  }

  private async getAndSetWarehouses(): Promise<void> {
    try {
      const response = await this.wareHouseApi.GetAllPromise();
      if (!!response && !!response.data) {
        this.warehouses = response.data;
        this.wareHouseData$.next(this.warehouses.map(x => x.warehouseDescription));
      }
    }
    catch (error) {
      this.cs.HandleError(error);
    }
  }

  private async getAndSetStatuses(): Promise<void> {
    try {
      const response = await this.whsService.GetAllWhsTransferStatusPromise();
      if (response !== undefined) {
        this.statuses = response;
        this.statuses$.next(this.statuses.map(x => x.text));
      }
    }
    catch (error) {
      this.cs.HandleError(error);
    }
  }

  public ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    throw new Error('Method not implemented.');
  }

  public ChooseDataForCustomerForm(): void {
    throw new Error('Method not implemented.');
  }

  public RefreshData(): void {
    throw new Error('Method not implemented.');
  }

  IsTableFocused: boolean = false

  public TableRowDataChanged(changedData?: any, index?: number | undefined, col?: string | undefined): ManagerResponse {
    throw new Error('Method not implemented.');
  }

  public RecalcNetAndVat(): void {
    throw new Error('Method not implemented.');
  }

  private validateFromDate(control: AbstractControl): any {
    if (this.toDateValue === undefined) {
      return null;
    }

    let fromDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let toDateValue = HelperFunctions.GetDateIfDateStringValid(this.toDateValue.toDateString());

    const wrong = fromDate?.isAfter(toDateValue, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  private validateToDate(control: AbstractControl): any {
    if (this.fromDateValue === undefined) {
      return null;
    }

    let toDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let fromDateValue = HelperFunctions.GetDateIfDateStringValid(this.fromDateValue.toDateString());

    const wrong = toDate?.isBefore(fromDateValue, "day")
    return wrong ? { wrongDate: { value: control.value } } : null;
  }

  public async ngOnInit(): Promise<void> {
    this.filterFormNav = new InlineTableNavigatableForm(
      this.filterForm,
      this.keyboardService,
      this.cdref,
      [],
      this.filterFormId,
      AttachDirection.DOWN,
      this
    )
    this.filterFormNav.OuterJump = true

    const tempWh = this.wareHouseApi.GetTemporaryWarehouses()
    this.warehouses = tempWh;
    this.wareHouseData$.next(this.warehouses.map(x => x.warehouseDescription));

    const tempStatuses = this.whsService.GetTemporaryWhsTransferStatus()
    this.statuses = tempStatuses;
    this.statuses$.next(this.statuses.map(x => x.text));

    await Promise.all([
      this.getAndSetWarehouses(),
      this.getAndSetStatuses()
    ])

    this.loadFilters()

    this.filterFormNav.GenerateAndSetNavMatrices(true, undefined, true)

    this.keyboardService.SetCurrentNavigatable(this.filterFormNav)

    this.pageReady.emit()

    this.keyboardService.SetCurrentNavigatable(this.filterFormNav)
    this.keyboardService.SelectFirstTile()
    this.keyboardService.ClickCurrentElement()

    const filter = this.localStorage.get<WarehouseDocumentFilterFormData>(this.localStorageKey)

    if (filter) {
      this.filterForm.patchValue(filter)

      this.Refresh()
    }
  }

  private loadFilters(): void {
    const filter = this.localStorage.get<WarehouseDocumentFilterFormData>(this.localStorageKey)

    if (!filter) {
      return
    }

    this.loadWarehousesFilters(filter)
    this.loadStatusFilter(filter)
    this.loadDatesFromFilter(filter)
  }

  private loadWarehousesFilters(filter: WarehouseDocumentFilterFormData): void {
    if (this.warehouses.length === 0) {
      return
    }

    const setControlValue = (filterValue: string, control: AbstractControl) => {
      const hasValue = !HelperFunctions.isEmptyOrSpaces(filterValue)
      if (hasValue) {
        const warehouse = this.warehouses.find(x => x.warehouseCode === filterValue)
        control.setValue(warehouse?.warehouseCode ?? this.warehouses[0].warehouseDescription)
      }
      else {
        control.setValue(this.warehouses[0].warehouseDescription)
      }
    }

    const controls = this.filterForm.controls
    setControlValue(filter.FromWarehouseCode, controls['FromWarehouseCode'])
    setControlValue(filter.ToWarehouseCode, controls['ToWarehouseCode'])
  }

  private loadStatusFilter(filter: WarehouseDocumentFilterFormData): void {
    if (this.statuses.length === 0) {
      return
    }

    const controls = this.filterForm.controls

    const savedStatus = HelperFunctions.isEmptyOrSpaces(filter.Status)
    if (!savedStatus) {
      const tmp = this.statuses.find(x => x.text === OfflineWhsTransferStatus.Ready.text)
      controls['Status'].setValue(tmp !== undefined ? tmp.text : this.statuses[0].text)
    }
    else {
      controls['Status'].setValue(this.statuses[0].text)
    }
  }

  private loadDatesFromFilter(filter: WarehouseDocumentFilterFormData): void {
    const setControlValue = (filterValue: string, control: AbstractControl) => {
      if (!filterValue) {
        return
      }

      control.setValue(filterValue)
    }

    const controls = this.filterForm.controls
    setControlValue(filter.FromDate, controls['FromDate'])
    setControlValue(filter.ToDate, controls['ToDate'])
  }

  public Refresh(): void {
    this.localStorage.put(this.localStorageKey, this.filterForm.value)
    this.refreshClicked.emit(this.warehouseDocumentFormData)
  }

  MoveToSearchButton(event: any): void {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)
  }
}
