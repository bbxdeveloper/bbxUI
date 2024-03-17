import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { EMPTY, Subject, map, of, switchMap, tap } from 'rxjs';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { FilterData } from '../Models/FilterData';
import moment from 'moment';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { INavigation } from './INavigation';

@Component({
  selector: 'app-nav-sent-data-filter',
  templateUrl: './nav-sent-data-filter.component.html',
  styleUrls: ['./nav-sent-data-filter.component.scss']
})
export class NavSentDataFilterComponent implements OnInit, OnDestroy, INavigation {
  public readonly TileCssClass = TileCssClass
  private readonly localStorageKey: string

  @Output()
  public readonly searchChanged = new EventEmitter<FilterData>()

  public get editDisabled(): boolean {
    return !this.keyboardService.isEditModeActivated
  }

  public get createTimeFrom(): AbstractControl|null {
    return this.filterForm.get('createTimeFrom')
  }

  public get createTimeTo(): AbstractControl|null {
    return this.filterForm.get('createTimeTo')
  }

  public readonly filterFormId = 'nav-sent-data-filter-form-id'

  public readonly filterForm = new FormGroup({
    createTimeFrom: new FormControl('', [Validators.required, this.isValidDate]),
    createTimeTo: new FormControl('', [this.isValidDate]),
    invoiceNumber: new FormControl(''),
    warningView: new FormControl(''),
    errorView: new FormControl('')
  }, { validators: this.isCreateTimeToBiggerThanCreateTimeFrom.bind(this) })

  public readonly filterFormNav = new InlineTableNavigatableForm(
    this.filterForm,
    this.keyboardService,
    this.cdref,
    [],
    this.filterFormId,
    AttachDirection.DOWN,
    {} as IInlineManager,
  );

  public readonly searchClicked$ = new Subject()

  private readonly fireSearchChangedSubscription = this.searchClicked$
    .pipe(
      switchMap(() => of(this.filterForm.value)),
      tap(filterData => this.localStorage.put(this.localStorageKey, filterData)),
      switchMap(() => this.filterForm.valid ? of(this.filterForm.value) : EMPTY),
      map((formValues: FilterData) => {
        return {
          createTimeFrom: moment(formValues.createTimeFrom).format('YYYY-MM-DD'),
          createTimeTo: formValues.createTimeTo !== '' ? moment(formValues.createTimeTo).format('YYYY-MM-DD') : '',
          invoiceNumber: formValues.invoiceNumber,
          warningView: formValues.warningView,
          errorView: formValues.errorView,
        } as FilterData
      }),
    )
    .subscribe((values: FilterData) => this.searchChanged.emit(values))

  constructor(
    private readonly keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
    private readonly localStorage: LocalStorageService,
    tokenService: TokenStorageService,
  ) {
    this.localStorageKey = 'NavSentDataFilter.' + tokenService.user?.id ?? 'everyone'

    this.filterFormNav.OuterJump = true
  }

  ngOnInit(): void {
    const controls = this.filterForm.controls

    const data = this.localStorage.get<FilterData>(this.localStorageKey)
    if (data) {
      this.filterForm.patchValue(data)
      this.searchClicked$.next(null)
    }
    else {
      controls['createTimeFrom'].setValue(moment().format('YYYY-MM-DD'), { emitEvent: false })
    }

    const warningView = controls['warningView']
    const errorView = controls['errorView']

    warningView.valueChanges
      .subscribe((value: boolean) => {
        if (value) {
          errorView.setValue(false, { emitEvent: false })
        }
      })

    errorView.valueChanges
      .subscribe((value: boolean) => {
        if (value) {
          warningView.setValue(false, { emitEvent: false })
        }
      })
  }

  ngOnDestroy(): void {
    this.fireSearchChangedSubscription.unsubscribe()
  }

  private isCreateTimeToBiggerThanCreateTimeFrom(control: AbstractControl): ValidationErrors|null {
    const createTimeToControl = control.get('createTimeTo')

    if (!createTimeToControl || createTimeToControl.value === '') {
      return null
    }

    const createTimeFromControl = control.get('createTimeFrom')

    if (!createTimeFromControl) {
      return null
    }

    const createTimeFrom = moment(createTimeFromControl.value)
    const createTimeTo = moment(createTimeToControl.value)

    return createTimeTo.isAfter(createTimeFrom) ? null : { invalid: true }
  }

  private isValidDate(control: AbstractControl): ValidationErrors|null {
    if (control.value === '') {
      return null
    }

    return moment(control.value).isValid() ? null : { invalid: true }
  }

  public GenerateAndSetMatrixes(): void {
    this.filterFormNav.GenerateAndSetNavMatrices(true)
  }
}
