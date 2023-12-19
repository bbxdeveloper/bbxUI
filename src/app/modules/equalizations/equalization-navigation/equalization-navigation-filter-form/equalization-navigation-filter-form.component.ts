import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { validDate } from 'src/assets/model/Validators';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { TileCssClass, AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { EqualizationsNavigationFilterFormData } from './EqualizationsNavigationFilterFormData';

@Component({
  selector: 'app-equalization-navigation-filter-form',
  templateUrl: './equalization-navigation-filter-form.component.html',
  styleUrls: ['./equalization-navigation-filter-form.component.scss']
})
export class EqualizationNavigationFilterFormComponent implements OnInit, IInlineManager {
  @Input()
  public editDisabled!: boolean

  @Output()
  public refreshClicked = new EventEmitter<EqualizationsNavigationFilterFormData | undefined>(undefined)

  @Output()
  public pageReady = new EventEmitter<void>()

  private localStorageKey: string

  get isEditModeOff(): boolean {
    return !this.keyboardService.isEditModeActivated
  }

  @Input()
  public set equalizationNavigationFormData(formData: EqualizationsNavigationFilterFormData | undefined) {
    if (!formData) {
      return
    }

    const controls = this.filterForm.controls
    controls['SearchString'].setValue(formData.SearchString)
    controls['FromDate'].setValue(formData.FromDate)
    controls['ToDate'].setValue(formData.ToDate)
  }
  public get equalizationNavigationFormData() {
    const controls = this.filterForm.controls

    const formData = {
      SearchString: controls['SearchString'].value,
      FromDate: controls['FromDate'].value,
      ToDate: controls['ToDate'].value
    } as EqualizationsNavigationFilterFormData
    return formData
  }

  public TileCssClass = TileCssClass

  public filterForm!: FormGroup
  public filterFormId = 'equalizations-navigation-filter-form'
  filterFormNav!: InlineTableNavigatableForm
  outInvFormNav$ = new BehaviorSubject<InlineTableNavigatableForm[]>([])

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
    private readonly cs: CommonService,
    private readonly cdref: ChangeDetectorRef,
    private readonly localStorage: LocalStorageService,
    tokenService: TokenStorageService,
  ) {
    this.localStorageKey = 'equalizations-navigation-filter.' + tokenService.user?.id ?? 'everyone'

    this.filterForm = new FormGroup({
      SearchString: new FormControl(undefined, []),
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

  public TableRowDataChanged(changedData?: any, index?: number | undefined, col?: string | undefined): void {
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

    this.loadFilters()

    this.filterFormNav.GenerateAndSetNavMatrices(true, undefined, true)

    this.keyboardService.SetCurrentNavigatable(this.filterFormNav)

    this.pageReady.emit()

    this.keyboardService.SetCurrentNavigatable(this.filterFormNav)
    this.keyboardService.SelectFirstTile()
    this.keyboardService.ClickCurrentElement()

    const filter = this.localStorage.get<EqualizationsNavigationFilterFormData>(this.localStorageKey)

    if (filter) {
      this.filterForm.patchValue(filter)
      this.Refresh()
    }
  }

  private loadFilters(): void {
    const filter = this.localStorage.get<EqualizationsNavigationFilterFormData>(this.localStorageKey)

    if (!filter) {
      return
    }

    this.loadSearchStringFilter(filter)
    this.loadDatesFromFilter(filter)
  }

  private loadSearchStringFilter(filter: EqualizationsNavigationFilterFormData): void {
    const controls = this.filterForm.controls

    const savedStatus = HelperFunctions.isEmptyOrSpaces(filter.SearchString)
    if (!savedStatus) {
      controls['SearchString'].setValue(filter.SearchString)
    }
    else {
      controls['SearchString'].setValue(undefined)
    }
  }

  private loadDatesFromFilter(filter: EqualizationsNavigationFilterFormData): void {
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
    this.refreshClicked.emit(this.equalizationNavigationFormData)
  }

  MoveToSearchButton(event: any): void {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)
  }
}
