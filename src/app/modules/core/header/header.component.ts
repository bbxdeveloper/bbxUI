import { AfterViewInit, Component, HostListener, Input, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService, NbIconConfig, NbPopoverDirective, NbToastrService } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { Constants } from 'src/assets/util/Constants';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { LoginDialogComponent } from '../../auth/login-dialog/login-dialog.component';
import { LoginDialogResponse } from '../../auth/models/LoginDialogResponse';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { AuthService } from '../../auth/services/auth.service';
import { AttachDirection, SubMappingNavigatable } from 'src/assets/model/navigation/Nav';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { UtilityService } from 'src/app/services/utility.service';
import { DateIntervalDialogComponent } from '../../shared/date-interval-dialog/date-interval-dialog.component';
import { DateIntervalDialogResponse } from 'src/assets/model/DateIntervalDialogResponse';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends BaseNavigatableComponentComponent implements OnInit, AfterViewInit {
  @ViewChildren(NbPopoverDirective) popover?: QueryList<NbPopoverDirective>;

  @Input() title: string = "";

  settingsIconConfig: NbIconConfig = { icon: 'settings-2-outline', pack: 'eva' };

  isElectron: boolean = false;
  isLoading: boolean = false;

  get isLoggedIn(): boolean { return this.tokenService.isLoggedIn; };

  get InProgress(): boolean { return this.sts.InProgress || this.isLoading; }

  get keyboardMode(): string {
    var mode = this.kbS.currentKeyboardMode;
    switch (mode) {
      case KeyboardModes.NAVIGATION:
        return "Mód: Navigáció";
        break;
      case KeyboardModes.EDIT:
        return "Mód: Szerkesztés";
        break;
      default:
        return "Mód: Ismeretlen";
        break;
    }
  }

  get keyboardModeStatus(): string {
    var mode = this.kbS.currentKeyboardMode;
    switch (mode) {
      case KeyboardModes.NAVIGATION:
        return "primary";
        break;
      case KeyboardModes.EDIT:
        return "warning";
        break;
      default:
        return "danger";
        break;
    }
  }

  constructor(
    private dialogService: NbDialogService,
    private kbS: KeyboardNavigationService,
    private router: Router,
    private sts: StatusService,
    private authService: AuthService,
    private tokenService: TokenStorageService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    private utS: UtilityService,
    private status: StatusService,
    private khs: KeyboardHelperService) {
    super();
    this.OuterJump = true;
  }

  override ngOnInit(): void {
    this.isElectron = environment.electron;
  }

  ngAfterViewInit(): void {
    this.GenerateAndSetNavMatrices();
    this.kbS.SelectFirstTile();
    if (!this.isLoggedIn) {
      this.login(undefined);
    }
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
          if (!!!this.SubMapping[nextId]) {
            this.SubMapping[nextId] = new SubMappingNavigatable();
          }

          // Adding submenu id to the mapping of the current menu
          this.SubMapping[nextId].Matrix.push([nextSubId]);
        }
      }
    }

    //if (environment.debug)
    console.log("[HeaderComponent] Generated header matrix: ", this.Matrix, "\nSubmapping: ", this.SubMapping);

    this.kbS.SetRoot(this);
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
    if (this.bbxToastrService.IsToastrOpened) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      this.bbxToastrService.close();

      return;
    }
    
    if (this.kbS.IsLocked() || this.status.InProgress || this.khs.IsKeyboardBlocked) {
      console.log("[onKeyDown] Movement is locked!");

      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      return;
    }

    switch (event.key) {
      case KeyBindings.up: {
        if (!this.kbS.isEditModeActivated) {
          event.preventDefault();
          this.kbS.MoveUp(true, event.altKey);
        }
        break;
      }
      case KeyBindings.down: {
        if (!this.kbS.isEditModeActivated) {
          event.preventDefault();
          this.kbS.MoveDown(true, event.altKey);
        }
        break;
      }
      case KeyBindings.left: {
        if (!this.kbS.isEditModeActivated) {
          event.preventDefault();
          this.kbS.MoveLeft(true, event.altKey);
        }
        break;
      }
      case KeyBindings.right: {
        if (!this.kbS.isEditModeActivated) {
          event.preventDefault();
          this.kbS.MoveRight(true, event.altKey);
        }
        break;
      }
      case KeyBindings.edit: {
        if (!this.kbS.isEditModeActivated) {
          event.preventDefault();
        }
        this.kbS.ClickCurrentElement();
        break;
      }
      case KeyBindings.exitIE:
      case KeyBindings.exit: {
        if (!this.khs.IsDialogOpened) {
          this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        }
        break;
      }
      default: { }
    }
  }

  handleEscape(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  }

  goTo(link: string): void {
    this.kbS.MoveRight();
    this.popover?.forEach(x => x?.hide());
    if (link === "home") {
      this.router.navigate([link]);
    } else {
      this.router.navigate(["home"]);
      setTimeout(() => {
        this.router.navigate([link]);
      }, 50);
    }
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
    this.isLoading = true;
    dialogRef.onClose.subscribe({
      next: (res: LoginDialogResponse) => {
        if (!!res && res.answer) {
          this.authService.login(
            res.name, res.pswd
          ).subscribe({
            next: res => {
              if (res.succeeded && res?.data?.token !== undefined && res?.data?.user !== undefined) {
                this.tokenService.token = res?.data?.token;
                this.tokenService.user = res?.data?.user;
                this.simpleToastrService.show(
                  Constants.MSG_LOGIN_SUCCESFUL,
                  Constants.TITLE_INFO,
                  Constants.TOASTR_SUCCESS_5_SEC
                );
                setTimeout(() => {
                  this.GenerateAndSetNavMatrices();
                  this.kbS.SelectFirstTile();
                  this.isLoading = false;
                  this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                }, 200);
              } else {
                this.bbxToastrService.show(Constants.MSG_LOGIN_FAILED, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
                this.isLoading = false;
                this.kbS.setEditMode(KeyboardModes.NAVIGATION);  
              }
            },
            error: err => {
              this.bbxToastrService.show(Constants.MSG_LOGIN_FAILED, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
              this.isLoading = false;
              this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            },
            complete: () => {
              setTimeout(() => {
                this.isLoading = false;
                this.kbS.setEditMode(KeyboardModes.NAVIGATION);
              }, 200);
            }
          });
        } else {
          setTimeout(() => {
            this.kbS.SelectFirstTile();
            this.isLoading = false;
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
          }, 200);
        }
      }
    });
  }

  logout(event: any): void {
    event?.preventDefault();
    HelperFunctions.confirm(this.dialogService, Constants.MSG_LOGOUT_CONFIGM, () => {
      this.sts.pushProcessStatus(Constants.LogoutSavingStatuses[Constants.LogoutSavingPhases.LOGGING_OUT]);
      this.authService.logout().subscribe({
        next: res => {
          this.simpleToastrService.show(
            Constants.MSG_LOGOUT_SUCCESFUL,
            Constants.TITLE_INFO,
            Constants.TOASTR_SUCCESS_5_SEC
          );
          this.tokenService.signOut();
          this.router.navigate(['/home']);
          setTimeout(() => {
            this.GenerateAndSetNavMatrices();
            this.kbS.SelectFirstTile();
          }, 200);
        },
        error: err => {
          this.bbxToastrService.show(Constants.MSG_LOGOUT_FAILED, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
        },
        complete: () => {
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      });
    });
  }
}
