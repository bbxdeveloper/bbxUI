import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginDialogResponse } from '../models/LoginDialogResponse';
import { AttachDirection, NavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { IInlineManager } from 'src/assets/model/IInlineManager';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  title: string = "Bejelentkezés";
  closedManually = false;

  loginFormNav!: NavigatableForm;

  TileCssClass = TileCssClass;

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<LoginDialogComponent>,
    private kBs: KeyboardNavigationService
  ) {
    super();
    this.Setup();
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["login-button-login", "login-button-cancel"]];

    const loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.loginFormNav = new NavigatableForm(
      loginForm, this.kBs, this.cdrf, [], 'loginForm', AttachDirection.UP, {} as IInlineManager
      );

    // We can move onto the confirmation buttons from the form.
    this.loginFormNav.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;
  }

  ngAfterViewInit(): void {
    this.kBs.SetWidgetNavigatable(this);
    this.loginFormNav.GenerateAndSetNavMatrices(true);
    this.kBs.SelectFirstTile();
    this.kBs.setEditMode(KeyboardModes.EDIT);
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kBs.RemoveWidgetNavigatable();
    }
    this.kBs.setEditMode(KeyboardModes.NAVIGATION);
  }

  close(answer: boolean) {
    this.closedManually = true;
    this.kBs.RemoveWidgetNavigatable();
    if (answer && this.loginFormNav.form.valid) {
      this.dialogRef.close({
        answer: true,
        name: this.loginFormNav.GetValue('username'),
        pswd: this.loginFormNav.GetValue('password')
      } as LoginDialogResponse);
    }
    this.dialogRef.close({
      answer: false
    } as LoginDialogResponse);
  }
}
