import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { DateIntervalDialogResponse } from "src/assets/model/DateIntervalDialogResponse";
import { IInlineManager } from "src/assets/model/IInlineManager";
import { NavigatableForm } from "src/assets/model/navigation/Nav";
import { TileCssClass, AttachDirection } from "src/assets/model/navigation/Navigatable";
import { BaseNavigatableComponentComponent } from "../../base-navigatable-component/base-navigatable-component.component";

@Component({
  selector: 'app-date-interval-dialog',
  templateUrl: './date-interval-dialog.component.html',
  styleUrls: ['./date-interval-dialog.component.scss']
})
export class DateIntervalDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  title: string = "Bejelentkezés";
  closedManually = false;

  formNav!: NavigatableForm;

  TileCssClass = TileCssClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<DateIntervalDialogComponent>,
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

    const loginForm = new FormGroup({
      starDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
    });

    this.formNav = new NavigatableForm(
      loginForm, this.kbS, this.cdrf, [], 'loginForm', AttachDirection.UP, {} as IInlineManager
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
        starDate: this.formNav.GetValue('starDate'),
        endDate: this.formNav.GetValue('endDate')
      } as DateIntervalDialogResponse);
    }
    this.dialogRef.close({
      answer: false
    } as DateIntervalDialogResponse);
  }
}