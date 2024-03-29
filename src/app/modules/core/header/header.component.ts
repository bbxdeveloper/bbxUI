import { AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { NbIconConfig, NbPopoverDirective } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { Constants } from 'src/assets/util/Constants';
import { Actions, DefaultKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { ConfirmationDialogComponent } from '../../shared/simple-dialogs/confirmation-dialog/confirmation-dialog.component';
import { LoginDialogComponent } from '../../auth/login-dialog/login-dialog.component';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { AuthService } from '../../auth/services/auth.service';
import { SubMappingNavigatable } from 'src/assets/model/navigation/Nav';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { CommonService } from 'src/app/services/common.service';
import { LoggerService } from 'src/app/services/logger.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { SystemService } from '../../system/services/system.service';
import { SendDataToNavComponent } from '../nav/send-data-to-nav/send-data-to-nav.component';
import { NavTechnicalCancelDialogComponent } from '../nav/nav-technical-cancel-dialog/nav-technical-cancel-dialog.component';
import {UserLevels} from "../../system/models/UserLevels";
import { EMPTY, catchError } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends BaseNavigatableComponentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(NbPopoverDirective) popover?: QueryList<NbPopoverDirective>;

  @Input() title: string = "";

  settingsIconConfig: NbIconConfig = { icon: 'settings-2-outline', pack: 'eva' };

  isElectron: boolean = false;
  isLoading: boolean = false;

  get isLoggedIn(): boolean { return this.tokenService.isLoggedIn; };

  get InProgress(): boolean { return this.statusService.InProgress || this.isLoading; }

  get keyboardMode(): string {
    const mode = this.keyboardService.currentKeyboardMode;
    switch (mode) {
      case KeyboardModes.NAVIGATION:
        return "Mód: Navigáció";
      case KeyboardModes.EDIT:
        return "Mód: Szerkesztés";
      case KeyboardModes.NAVIGATION_EDIT:
        return "Mód: Javítás";
      default:
        return "Mód: Ismeretlen";
    }
  }

  get keyboardModeStatus(): string {
    const mode = this.keyboardService.currentKeyboardMode;
    switch (mode) {
      case KeyboardModes.NAVIGATION:
        return "primary";
      case KeyboardModes.EDIT:
        return "warning";
      case KeyboardModes.NAVIGATION_EDIT:
      default:
        return "danger";
    }
  }

  get wareHouseInfo(): string {
    const wareHouse = this.tokenService.wareHouse;
    if (wareHouse) {
      return `${wareHouse.warehouseCode} ${wareHouse.warehouseDescription}`
    } else {
      return 'nincs kiválasztva'
    }
  }

  get isDebug(): boolean {
    return environment.debug
  }

  constructor(
    private readonly dialogService: BbxDialogServiceService,
    private readonly keyboardService: KeyboardNavigationService,
    private readonly router: Router,
    private readonly statusService: StatusService,
    private readonly authService: AuthService,
    private readonly tokenService: TokenStorageService,
    private readonly bbxToastrService: BbxToastrService,
    private readonly keyboardHelperService: KeyboardHelperService,
    private readonly commonService: CommonService,
    private readonly loggerService: LoggerService,
    private readonly systemService: SystemService,) {
    super();
    this.OuterJump = true;
  }

  GetNavigationInfo(log: boolean = false): any {
    if (log) {
      console.warn('---------------------------')
      console.warn(this.keyboardService.p)
      console.warn(this.keyboardService.Here)
      console.warn(this.keyboardService.AroundHere)
      console.warn(this.keyboardService.GetCurrentNavigatable)
      console.warn('---------------------------')
    }
    return `[${this.keyboardService.p.x},${this.keyboardService.p.y}] : ${this.keyboardService.GetCurrentNavigatable?.constructor.name} : ${this.keyboardService.Here}`
  }

  override ngOnInit(): void {
    this.isElectron = environment.electron;
  }

  ngAfterViewInit(): void {
    this.GenerateAndSetNavMatrices();
    this.keyboardService.SelectFirstTile();
    if (!this.isLoggedIn) {
      this.login(undefined);
    }
    this.commonService.CloseAllHeaderMenuTrigger.subscribe({
      next: data => {
        if (data) {
          this.popover?.forEach(x => x?.hide());
        }
      }
    })
  }
  ngOnDestroy(): void {
    this.commonService.CloseAllHeaderMenuTrigger.unsubscribe()
  }

  public override GenerateAndSetNavMatrices(attach: boolean = true): void {
    // Get menus
    const headerMenusRaw = $(".cl-header-menu");

    // Prepare matrix and submenu mappings
    this.Matrix = [[]];
    this.SubMapping = {};

    // Getting ids for menus
    for (let i = 0; i < headerMenusRaw.length; i++) {
      // Id of menu for navigation
      const nextId = headerMenusRaw[i].id;
      this.Matrix[0].push(nextId);

      // Get list of submenu ids from the data-sub attribute
      const subItems = headerMenusRaw[i].getAttribute('data-sub')?.split(',');
      if (!!subItems) {
        for (let o = 0; o < subItems.length; o++) {
          // Next submenu id to add
          const nextSubId = subItems[o];

          // If no available mapping for the menu, initialize it
          if (!this.SubMapping[nextId]) {
            this.SubMapping[nextId] = new SubMappingNavigatable();
          }

          // Adding submenu id to the mapping of the current menu
          this.SubMapping[nextId].Matrix.push([nextSubId]);
        }
      }
    }

    this.loggerService.info(`[HeaderComponent] Generated header matrix: '${JSON.stringify(this.Matrix)}' \nSubmapping: '${JSON.stringify(this.SubMapping)}'`);

    this.keyboardService.SetRoot(this);
  }

  public unlockLockedCustomers(): void {
    HelperFunctions.confirm(this.dialogService, Constants.MSG_CONFIRMATION_CUSTOMER_LOCK_RELEASE, () => {
      this.statusService.waitForLoad()

      this.systemService.releaseLockedCustomers()
        .subscribe({
          next: () => {},
          error: error => {
            this.commonService.HandleError(error)
            this.statusService.waitForLoad(false)
          },
          complete: () => this.statusService.waitForLoad(false)
        })
    })
  }

  public openSendToNav(): void {
    this.dialogService.open(SendDataToNavComponent)
  }

  public openNavTechnicalCancel(): void {
    this.dialogService.open(NavTechnicalCancelDialogComponent)
  }

  /**
   * Checkboxok esetében readonly mellett is át tudom őket kattintani, így ilyen esetekre itt blokkolok minden readonly elemre szóló kattintást.
   * @param event
   */
  @HostListener('window:click', ['$event']) onClick(event: MouseEvent) {
    if (event.target && (event as any).target.readOnly) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  /**
   * Billentyűsnavigálás tekintetében az event érzékelés felsőbb rétege. Iniciálisan itt történik meg a
   * 4 irányba történő navigálásra vonatkozó parancs meghívása, eventek továbbfolyásának tiltása.
   * @param event
   * @returns
   */
  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === KeyBindings.F5) {
      this.loggerService.info("[onKeyDown] Ctrl+F5 pressed, navigating to home...")

      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()

      this.dialogService.closeAll()

      this.goTo('/')

      this.keyboardService.ClickCurrentElement()
      this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)

      return
    }

    if (this.bbxToastrService.IsToastrOpened) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      this.bbxToastrService.close();

      return
    }

    if (this.keyboardService.IsLocked() || this.statusService.InProgress || this.keyboardHelperService.IsKeyboardBlocked) {
      this.loggerService.info("[onKeyDown] Movement is locked!");

      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      return
    }

    switch (event.key) {
      case DefaultKeySettings[Actions.Help].KeyCode: {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        this.goToUserManuals()
        break;
      }
      case KeyBindings.up: {
        if (this.keyboardService.isNavigationModeActivated) {
          event.preventDefault();
          this.keyboardService.MoveUp(true, event.altKey);
        }
        break;
      }
      case KeyBindings.down: {
        if (this.keyboardService.isNavigationModeActivated) {
          event.preventDefault();
          this.keyboardService.MoveDown(true, event.altKey);
        }
        break;
      }
      case KeyBindings.left: {
        if (this.keyboardService.isNavigationModeActivated) {
          event.preventDefault();
          this.keyboardService.MoveLeft(true, event.altKey);
        }
        break;
      }
      case KeyBindings.right: {
        if (this.keyboardService.isNavigationModeActivated) {
          event.preventDefault();
          this.keyboardService.MoveRight(true, event.altKey);
        }
        break;
      }
      case KeyBindings.exitIE:
      case KeyBindings.exit: {
        if (!this.keyboardHelperService.IsDialogOpened) {
          this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);
        }
        break;
      }
      default: { }
    }
  }

  handleEscape(): void {
    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);
  }

  goTo(link: string): void {
    this.popover?.forEach(x => x?.hide())
    this.keyboardService.RemoveWidgetNavigatable()
    if (link === "home") {
      this.router.navigate([link])
    } else {
      this.router.navigate(["home"])
      setTimeout(() => {
        this.router.navigate([link])
      }, 50)
    }
  }

  goToUserManuals(event?: any): void {
    if (event)
      event.preventDefault()
    window.open(environment.userManualsLink, "_blank")
  }

  quit(event: any): void {
    event.preventDefault();
    if (!this.isElectron) {
      return;
    }
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_QUIT } });
    dialogRef.onClose.subscribe(res => {
      if (res) {
        window.close();
      }
    });
  }

  login(event: any): void {
    event?.preventDefault();
    const dialogRef = this.dialogService.open(LoginDialogComponent, { context: {}, closeOnEsc: false });

    dialogRef.onClose.subscribe(this.onLoginDialogClose.bind(this));
  }

  private onLoginDialogClose(answer: boolean): void {
    if (!answer) {
      return
    }

    if (this.tokenService.user === null || this.tokenService.user === undefined) {
      return
    }

    setTimeout(() => {
      this.GenerateAndSetNavMatrices()
      this.keyboardService.SelectFirstTile();
      this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);
    }, 200);

    this.bbxToastrService.showSuccess(Constants.MSG_LOGIN_SUCCESFUL, true);
  }

  logout(event: any): void {
    event?.preventDefault();
    HelperFunctions.confirm(this.dialogService, Constants.MSG_LOGOUT_CONFIGM, () => {
      this.statusService.pushProcessStatus(Constants.LogoutSavingStatuses[Constants.LogoutSavingPhases.LOGGING_OUT]);
      this.authService.logout()
        .pipe(
          catchError(error => {
            if (error.status === 401 || error.status === 404) {
              return EMPTY
            }

            throw error
          })
        )
        .subscribe({
          next: res => {
            this.bbxToastrService.showSuccess(Constants.MSG_LOGOUT_SUCCESFUL, true);

            this.tokenService.signOut();
            this.router.navigate(['/home']);
            setTimeout(() => {
              this.GenerateAndSetNavMatrices();
              this.keyboardService.SelectFirstTile();
            }, 200);
          },
          error: err => {
            this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
            this.bbxToastrService.show(Constants.MSG_LOGOUT_FAILED, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
          },
          complete: () => {
            this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
          }
        });
    });
  }

  public isUserHasLevel1(): boolean {
    return this.tokenService.user?.userLevel === UserLevels.Level1
  }
}
