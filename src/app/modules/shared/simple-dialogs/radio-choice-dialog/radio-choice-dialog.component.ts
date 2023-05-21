import { Component, AfterViewInit, OnDestroy, Input, ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { IInlineManager } from "src/assets/model/IInlineManager";
import { NavigatableForm } from "src/assets/model/navigation/Nav";
import { TileCssClass, AttachDirection } from "src/assets/model/navigation/Navigatable";
import { SimpleDialogResponse } from "src/assets/model/SimpleDialogResponse";
import { BaseNavigatableComponentComponent } from "../../base-navigatable-component/base-navigatable-component.component";

@Component({
  selector: 'app-radio-choice-dialog',
  templateUrl: './radio-choice-dialog.component.html',
  styleUrls: ['./radio-choice-dialog.component.scss']
})
export class RadioChoiceDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = "";
  @Input() isReadonly: any = false;

  @Input() defaultValue: any = 1;

  @Input() optionValue1: any = 1;
  @Input() optionValue2: any = 2;

  @Input() optionLabel1: any = 'Option 1';
  @Input() optionLabel2: any = 'Option 2';

  closedManually = false;

  inputForm!: FormGroup;
  formNav!: NavigatableForm;

  TileCssClass = TileCssClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<RadioChoiceDialogComponent>,
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

    this.inputForm = new FormGroup({
      chooser: new FormControl(this.defaultValue, [Validators.required]),
    });

    this.formNav = new NavigatableForm(
      this.inputForm, this.kbS, this.cdrf, [], 'oneInputForm', AttachDirection.UP, {} as IInlineManager
    );

    // We can move onto the confirmation buttons from the form.
    this.formNav.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;
  }

  ngAfterViewInit(): void {
    this.kbS.SetWidgetNavigatable(this);

    $('*[type=radio]').addClass(TileCssClass);
    $('*[type=radio]').on('click', (event) => {
      this.formNav.HandleFormFieldClick(event);
    });
    this.formNav.GenerateAndSetNavMatrices(true);

    this.inputForm.controls['chooser'].setValue(this.defaultValue);

    this.kbS.SelectFirstTile();
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    
    setTimeout(() => {
      this.kbS.ClickCurrentElement();
      this.kbS.setEditMode(KeyboardModes.EDIT);
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
        value: this.formNav.GetValue('chooser'),
      } as SimpleDialogResponse);
    } else {
      this.dialogRef.close({
        value: undefined
      } as SimpleDialogResponse);
    }
  }
}