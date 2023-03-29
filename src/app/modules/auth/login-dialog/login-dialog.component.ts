import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginDialogResponse } from '../models/LoginDialogResponse';
import { AttachDirection, NavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { BehaviorSubject } from 'rxjs';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { CommonService } from 'src/app/services/common.service';
import { WareHouse } from '../../warehouse/models/WareHouse';

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

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  // WareHouse
  wareHouses: string[] = []
  wareHousesData: WareHouse[] = []
  wareHouseComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<LoginDialogComponent>,
    private kbS: KeyboardNavigationService,
    private wareHouseApi: WareHouseService,
    private commonService: CommonService
  ) {
    super();
    this.Setup();
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this.loginFormNav!.HandleFormEnter(event);
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
    this.Matrix = [["login-button-login", "login-button-cancel"]];

    const loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      wareHouse: new FormControl('', [Validators.required]),
    });

    this.loginFormNav = new NavigatableForm(
      loginForm, this.kbS, this.cdrf, [], 'loginForm', AttachDirection.UP, {} as IInlineManager
      );

    // We can move onto the confirmation buttons from the form.
    this.loginFormNav.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;
  }

  async ngAfterViewInit(): Promise<void> {
    await this.refreshComboboxData()
    this.kbS.SetWidgetNavigatable(this)
    this.loginFormNav.GenerateAndSetNavMatrices(true)
    this.kbS.SelectFirstTile()
    this.kbS.setEditMode(KeyboardModes.EDIT)
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
    if (answer && this.loginFormNav.form.valid) {
      let wareHouse = this.wareHousesData.find(x => x.warehouseDescription === this.loginFormNav.form.controls['wareHouse'].value);
      this.dialogRef.close({
        answer: true,
        name: this.loginFormNav.GetValue('username'),
        pswd: this.loginFormNav.GetValue('password'),
        wareHouse: wareHouse
      } as LoginDialogResponse);
    } else {
      this.dialogRef.close({
        answer: false
      } as LoginDialogResponse);
    }
  }

  private async refreshComboboxData(): Promise<void> {
    try {
      const warehouseData = await this.wareHouseApi.GetAllPromise()

      this.wareHousesData = warehouseData.data ?? []
      this.wareHouses = warehouseData?.data?.map(x => x.warehouseDescription) ?? []
      this.wareHouseComboData$.next(this.wareHouses)
    } catch (error) {
      this.commonService.HandleError(error)
    }
  }
}
