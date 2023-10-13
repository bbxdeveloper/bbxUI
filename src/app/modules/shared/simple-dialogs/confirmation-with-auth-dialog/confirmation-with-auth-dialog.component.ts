import { Component, AfterViewInit, OnDestroy, Input, ChangeDetectorRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { IInlineManager } from "src/assets/model/IInlineManager";
import { NavigatableForm } from "src/assets/model/navigation/Nav";
import { TileCssClass, AttachDirection, NavigatableType } from "src/assets/model/navigation/Navigatable";
import { BaseNavigatableComponentComponent } from "../../base-navigatable-component/base-navigatable-component.component";
import { AuthChangeEventArgs } from "../../auth/auth-form/auth-fields.component";
import { CommonService } from "src/app/services/common.service";
import { Constants } from "src/assets/util/Constants";

export interface ConfirmationWithAuthDialogesponse {
  answer: boolean,
  value?: number
}

@Component({
  selector: 'app-confirmation-with-auth-dialog',
  templateUrl: './confirmation-with-auth-dialog.component.html',
  styleUrls: ['./confirmation-with-auth-dialog.component.scss']
})
export class ConfirmationWithAuthDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = "";

  override NavigatableType = NavigatableType.dialog

  closedManually = false;

  inputForm!: FormGroup;
  formNav!: NavigatableForm;
  formId: string = 'invContCtrlSaveForm'

  loggedIn: boolean = false
  userID: number = -1

  TileCssClass = TileCssClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<ConfirmationWithAuthDialogComponent>,
    private kbS: KeyboardNavigationService,
    private commonService: CommonService
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
    this.Matrix = [["confirm-dialog-button-yes", "confirm-dialog-button-no"]];

    this.inputForm = new FormGroup({});

    this.formNav = new NavigatableForm(
      this.inputForm, this.kbS, this.cdrf, [], this.formId, AttachDirection.UP, {} as IInlineManager
    );

    // We can move onto the confirmation buttons from the form.
    this.formNav.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;
  }

  ngAfterViewInit(): void {
    this.kbS.SetWidgetNavigatable(this);
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  }

  close(answer: boolean) {
    if (answer && !this.loggedIn) {
      this.commonService.ShowErrorMessage(Constants.MSG_ERROR_USERDATA_NEEDED)
      return
    }
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable();
    if (answer && this.formNav.form.valid) {
      this.dialogRef.close({
        answer: true,
        value: this.userID,
      } as ConfirmationWithAuthDialogesponse);
    } else {
      this.dialogRef.close({
        answer: false
      } as ConfirmationWithAuthDialogesponse);
    }
  }

  public handleAuthChange(event: AuthChangeEventArgs): void {
    this.loggedIn = event.loggedIn
    if (this.loggedIn) {
      this.userID = event.userID
    }
  }

  public handleAuthComponentReady(event?: any): void {
    this.formNav.GenerateAndSetNavMatrices(true)

    this.kbS.SetCurrentNavigatable(this.formNav)
    
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    setTimeout(() => {
      this.kbS.ClickCurrentElement();
    }, 100);
  }
}