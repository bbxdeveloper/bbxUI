import { Component, AfterViewInit, OnDestroy, Input, ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { createMask } from "@ngneat/input-mask";
import { KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { DateIntervalDialogResponse } from "src/assets/model/DateIntervalDialogResponse";
import { IInlineManager } from "src/assets/model/IInlineManager";
import { NavigatableForm } from "src/assets/model/navigation/Nav";
import { TileCssClass, AttachDirection, NavigatableType } from "src/assets/model/navigation/Navigatable";
import { HelperFunctions } from "src/assets/util/HelperFunctions";
import { BaseNavigatableComponentComponent } from "../../base-navigatable-component/base-navigatable-component.component";

@Component({
  selector: 'app-one-number-input-dialog',
  templateUrl: './one-number-input-dialog.component.html',
  styleUrls: ['./one-number-input-dialog.component.scss']
})
export class OneNumberInputDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = "";
  @Input() inputLabel: string = "";
  @Input() numberInputMask: any = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0.0'
  });
  @Input() placeHolder: string = '0.00';
  @Input() defaultValue?: number;
  @Input() limitValue: boolean = false;
  @Input() minValue: number = 1;
  @Input() maxValue: number = 99;

  /**
   * CSS classes for the outmost (not generated) element of the dialog
   * Useful for eg. set a margin for the whole component
   */
  @Input() wrapper_classes: string = ''

  override NavigatableType = NavigatableType.dialog

  closedManually = false;

  formNav!: NavigatableForm;

  TileCssClass = TileCssClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<OneNumberInputDialogComponent>,
    private kbS: KeyboardNavigationService
  ) {
    super();
    this.Setup();
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this.formNav!.HandleFormEnter(event);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.kbS.Jump(AttachDirection.DOWN, false);
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["date-interval-dialog-button-yes", "date-interval-dialog-button-no"]];

    const inputForm = new FormGroup({
      answer: new FormControl('', [Validators.required]),
    });

    this.formNav = new NavigatableForm(
      inputForm, this.kbS, this.cdrf, [], 'oneInputForm', AttachDirection.UP, {} as IInlineManager
    );

    // We can move onto the confirmation buttons from the form.
    this.formNav.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;
  }

  ngAfterViewInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.formNav.GenerateAndSetNavMatrices(true);
    this.kbS.SelectFirstTile();
    this.kbS.setEditMode(KeyboardModes.EDIT);

    if (this.defaultValue !== undefined) {
      this.formNav.form.controls['answer'].setValue(this.defaultValue)
    }

    setTimeout(() => {
      HelperFunctions.SelectBeginningByClass('one-number-input-dialog-input', undefined, undefined, this.defaultValue?.toString())
    }, 100);
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  }

  close(answer: boolean) {
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable();
    if (answer && this.formNav.form.valid) {
      this.dialogRef.close({
        answer: true,
        value: this.formNav.GetValue('answer'),
      } as DateIntervalDialogResponse);
    }
    this.dialogRef.close({
      answer: false
    } as DateIntervalDialogResponse);
  }
}