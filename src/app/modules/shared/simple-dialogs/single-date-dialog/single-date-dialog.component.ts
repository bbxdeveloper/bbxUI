import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators, AbstractControl } from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { DateIntervalDialogResponse } from "src/assets/model/DateIntervalDialogResponse";
import { IInlineManager } from "src/assets/model/IInlineManager";
import { NavigatableForm } from "src/assets/model/navigation/Nav";
import { TileCssClass, AttachDirection, NavigatableType } from "src/assets/model/navigation/Navigatable";
import { HelperFunctions } from "src/assets/util/HelperFunctions";
import { BaseNavigatableComponentComponent } from "../../base-navigatable-component/base-navigatable-component.component";
import { validDate } from "src/assets/model/Validators";

@Component({
  selector: 'app-single-date-dialog',
  templateUrl: './single-date-dialog.component.html',
  styleUrls: ['./single-date-dialog.component.scss']
})
export class SingleDateDialogComponent extends BaseNavigatableComponentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() title: string = "Dátum megadása"
  closedManually = false

  formNav!: NavigatableForm

  @Input() minDate?: string
  @Input() defaultDate?: string
  @Input() maxDate?: string
  @Input() fieldName?: string
  
  showError: boolean = false

  override NavigatableType = NavigatableType.dialog

  get _minDate(): Date | undefined {
    return !HelperFunctions.IsDateStringValid(this.minDate) ? undefined : new Date(this.minDate!);
  }

  get _maxDate(): Date | undefined {
    return !HelperFunctions.IsDateStringValid(this.maxDate) ? undefined : new Date(this.maxDate!);
  }

  TileCssClass = TileCssClass

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated
  }

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<SingleDateDialogComponent>,
    private kbS: KeyboardNavigationService
  ) {
    super()
    this.Setup()
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this.formNav!.HandleFormEnter(event)
    } else {
      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()
      this.kbS.Jump(AttachDirection.DOWN, false)
      this.kbS.setEditMode(KeyboardModes.NAVIGATION)
    }
  }

  validateMin(control: AbstractControl): any {
    if (this._minDate === undefined) {
      return null;
    }

    let currentDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let minDate = HelperFunctions.GetDateIfDateStringValid(this._minDate.toDateString());

    const wrong = currentDate?.isBefore(minDate, "day");
    return wrong ? { minDate: { value: control.value } } : null;
  }

  validateMax(control: AbstractControl): any {
    if (this._maxDate === undefined) {
      return null;
    }

    let currentDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let maxDate = HelperFunctions.GetDateIfDateStringValid(this._maxDate.toDateString());

    const wrong = currentDate?.isAfter(maxDate, "day");
    return wrong ? { maxDate: { value: control.value } } : null;
  }

  validateMinMax(control: AbstractControl): any {
    if (this._minDate === undefined || this._maxDate === undefined) {
      return null;
    }

    let currentDate = HelperFunctions.GetDateIfDateStringValid(control.value);
    let minDate = HelperFunctions.GetDateIfDateStringValid(this._minDate.toDateString());
    let maxDate = HelperFunctions.GetDateIfDateStringValid(this._maxDate.toDateString());

    const wrong = currentDate?.isBefore(minDate, "day") || currentDate?.isAfter(maxDate, "day");
    return wrong ? { minMaxDate: { value: control.value } } : null;
  }

  private getDateControl(): FormControl {
    if (this._minDate !== undefined && this._maxDate !== undefined) {
      return new FormControl('', [
        Validators.required,
        this.validateMinMax.bind(this),
        validDate
      ])
    }
    return new FormControl('', [
      Validators.required,
      this.validateMin.bind(this),
      this.validateMax.bind(this),
      validDate
    ])
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["date-interval-dialog-button-yes", "date-interval-dialog-button-no"]]
  }

  override ngOnInit(): void {
    const form = new FormGroup({
      date: this.getDateControl()
    })

    this.formNav = new NavigatableForm(
      form, this.kbS, this.cdrf, [], 'loginForm', AttachDirection.UP, {} as IInlineManager
    )

    // We can move onto the confirmation buttons from the form.
    this.formNav.OuterJump = true
    // And back to the form.
    this.OuterJump = true

    this.showError = true
  }

  ngAfterViewInit(): void {
    this.kbS.SetWidgetNavigatable(this)
    this.formNav.GenerateAndSetNavMatrices(true)
    this.kbS.SelectFirstTile()
    this.kbS.setEditMode(KeyboardModes.EDIT)
    this.formNav.form.controls['date'].setValue(HelperFunctions.isEmptyOrSpaces(this.defaultDate) ? '' : this.defaultDate)
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable()
    }
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)
  }

  close(answer: boolean) {
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable()
    if (answer && this.formNav.form.valid) {
      this.dialogRef.close({
        answer: true,
        date: this.formNav.GetValue('date')
      } as DateIntervalDialogResponse)
    }
    this.dialogRef.close({
      answer: false
    } as DateIntervalDialogResponse)
  }
}