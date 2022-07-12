import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AttachDirection, NavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { DateIntervalDialogResponse } from 'src/assets/model/DateIntervalDialogResponse';

@Component({
  selector: 'app-one-text-input-dialog',
  templateUrl: './one-text-input-dialog.component.html',
  styleUrls: ['./one-text-input-dialog.component.scss']
})
export class OneTextInputDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = "";
  @Input() inputLabel: string = "";
  @Input() defaultValue: any = "";
  @Input() isReadonly: any = false;
  
  closedManually = false;

  inputForm!: FormGroup;
  formNav!: NavigatableForm;

  TileCssClass = TileCssClass;

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<OneTextInputDialogComponent>,
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
    this.Matrix = this.isReadonly ?
      [["date-interval-dialog-button-yes"]] :
      [["date-interval-dialog-button-yes", "date-interval-dialog-button-no"]];

    this.inputForm = new FormGroup({
      answer: new FormControl(this.defaultValue, [Validators.required]),
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
    if (!this.isReadonly) {
      this.formNav.GenerateAndSetNavMatrices(true);
    }
    this.inputForm.controls['answer'].setValue(this.defaultValue);
    this.kbS.SelectFirstTile();
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    setTimeout(() => {
      this.kbS.ClickCurrentElement();
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