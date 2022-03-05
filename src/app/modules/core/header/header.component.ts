import { AfterViewInit, Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService, NbIconConfig } from '@nebular/theme';
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
import { SubMappingNavigatable } from 'src/assets/model/navigation/Nav';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends BaseNavigatableComponentComponent implements OnInit, AfterViewInit {
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
    private toastrService: BbxToastrService) {
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

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (this.toastrService.IsToastrOpened) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      this.toastrService.close();

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
      default: { }
    }
  }

  handleEscape(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  }

  goTo(link: string): void {
    this.router.navigate([link]);
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
    const dialogRef = this.dialogService.open(LoginDialogComponent, { context: {} });
    this.isLoading = true;
    dialogRef.onClose.subscribe({
      next: (res: LoginDialogResponse) => {
      if(!!res && res.answer) {
        this.authService.login(
          res.name, res.pswd
        ).subscribe({
          next: res => {
            this.tokenService.token = res.token;
            this.toastrService.show(Constants.MSG_LOGIN_SUCCESFUL, Constants.TITLE_INFO, Constants.TOASTR_SUCCESS);
            // this.toastrService.show(Constants.MSG_LOGIN_SUCCESFUL, Constants.TITLE_INFO, { duration: 0 });
            setTimeout(() => {
              this.GenerateAndSetNavMatrices();
              this.kbS.SelectFirstTile();
              this.isLoading = false;
            }, 200);
          },
          error: err => {
            this.toastrService.show(Constants.MSG_LOGIN_FAILED, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
            this.isLoading = false;
          },
          complete: () => {
            setTimeout(() => {
              if (this.isLoading) {
                this.isLoading = false;
              }
            }, 200);
          }
        });
      }
    }
    });
  }

  logout(event: any): void {
    event?.preventDefault();
    this.isLoading = true;
    this.authService.logout().subscribe({
      next: res => {
        this.toastrService.show(Constants.MSG_LOGOUT_SUCCESFUL, Constants.TITLE_INFO, Constants.TOASTR_SUCCESS);
        this.tokenService.signOut();
        setTimeout(() => {
          this.GenerateAndSetNavMatrices();
          this.kbS.SelectFirstTile();
          this.isLoading = false;
        }, 200);
      },
      error: err => {
        this.toastrService.show(Constants.MSG_LOGOUT_FAILED, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
        this.isLoading = false;
      },
      complete: () => {
        setTimeout(() => {
          if (this.isLoading) {
            this.isLoading = false;
          }
        }, 200);
      }
    });
  }
}
