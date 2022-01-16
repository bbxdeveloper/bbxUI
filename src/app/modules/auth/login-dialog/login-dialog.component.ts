import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Nav } from 'src/assets/model/Navigatable';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  title: string = "Bejelentkezés";
  closedManually = false;

  loginFormNav!: Nav.NavigatableForm;

  TileCssClass = Nav.TileCssClass;

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

    this.loginFormNav = new Nav.NavigatableForm(loginForm, this.kBs, this.cdrf, [], 'loginForm', Nav.AttachDirection.UP);

    // We can move onto the confirmation buttons from the form.
    this.loginFormNav.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;
  }

  ngAfterViewInit(): void {
    this.kBs.SetActiveDialog(this);
    this.loginFormNav.GenerateAndSetNavMatrices(true);
    this.kBs.SelectFirstTile();
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kBs.RemoveActiveDialog();
    }
  }

  close(answer: boolean) {
    this.closedManually = true;
    this.kBs.RemoveActiveDialog();
    this.dialogRef.close(answer);
  }
}
