import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AttachDirection, NavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { BehaviorSubject } from 'rxjs';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { CommonService } from 'src/app/services/common.service';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { StatusService } from 'src/app/services/status.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Constants } from 'src/assets/util/Constants';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  title: string = "Bejelentkezés";
  closedManually = false;

  loginForm!: FormGroup
  loginFormNav!: NavigatableForm;

  TileCssClass = TileCssClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  // WareHouse
  warehouses: string[] = []
  warehouseData: WareHouse[] = []
  warehouseComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<LoginDialogComponent>,
    private kbS: KeyboardNavigationService,
    private warehouseService: WareHouseService,
    private commonService: CommonService,
    private statusService: StatusService,
    private readonly authService: AuthService,
    private readonly tokenService: TokenStorageService,
  ) {
    super();
    this.Setup();
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this.loginFormNav!.HandleFormEnter(event);
      return
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    setTimeout(() => {
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }, 200)
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["login-button-login", "login-button-cancel"]];

    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      warehouse: new FormControl('', [Validators.required]),
    });

    this.loginForm.get('warehouse')?.valueChanges
      .subscribe(value => {
        const warehouse = this.warehouseData.find(x => x.warehouseDescription === value) ?? null
        this.tokenService.wareHouse = warehouse
      })

    this.loginFormNav = new NavigatableForm(
      this.loginForm, this.kbS, this.cdrf, [], 'loginForm', AttachDirection.UP, {} as IInlineManager
    );

    // We can move onto the confirmation buttons from the form.
    this.loginFormNav.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;
  }

  async ngAfterViewInit(): Promise<void> {
    setTimeout(() => {
      this.kbS.SetWidgetNavigatable(this)
      this.loginFormNav.GenerateAndSetNavMatrices(true)
      this.kbS.SelectFirstTile()
      this.kbS.setEditMode(KeyboardModes.EDIT)
    }, 200)
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  }

  cancel(): void {
    this.authService.logout()
    this.tokenService.signOut()

    this.close()
  }

  close() {
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable();

    this.dialogRef.close();
  }

  async autoFillWareHouse(): Promise<void> {
    const username = this.loginFormNav.GetValue('username')
    const password = this.loginFormNav.GetValue('password')

    if (HelperFunctions.isEmptyOrSpaces(username) || HelperFunctions.isEmptyOrSpaces(password)) {
      return
    }

    this.statusService.waitForLoad(true)

    try {
      const loginData = await this.authService.login(username, password)

      if (!loginData.succeeded || !loginData.data) {
        this.commonService.HandleError(loginData.errors)
        return
      }

      this.tokenService.token = loginData.data.token;
      this.tokenService.user = loginData.data.user;

      if (this.warehouseData.length === 0) {
        const warehouseData = await this.warehouseService.GetAllPromise()

        this.warehouseData = warehouseData?.data ?? []
        this.warehouses = this.warehouseData.map(x => x.warehouseDescription)
        this.warehouseComboData$.next(this.warehouses)
      }

      if (!loginData.data.user.warehouse || HelperFunctions.isEmptyOrSpaces(loginData.data.user.warehouse)) {
        this.commonService.ShowErrorMessage(Constants.MSG_NO_DEFAULT_WAREHOUSE_FOR_USER)
        if (this.loginFormNav.GetValue('warehouse') === '' && this.warehouses.length > 0) {
          this.loginFormNav.SetValue('warehouse', this.warehouses[0])
        }

        return
      }

      this.loginFormNav.SetValue('warehouse', loginData.data.user.warehouse.split('-')[1])
    } catch (error) {
      this.commonService.HandleError(error)
    } finally {
      this.statusService.waitForLoad(false)
    }
  }
}
