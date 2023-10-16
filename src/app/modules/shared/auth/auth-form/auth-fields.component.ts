import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NavigatableForm } from 'src/assets/model/navigation/Nav';
import { AttachDirection, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Navigatable';
import { BaseNavigatableComponentComponent } from '../../base-navigatable-component/base-navigatable-component.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { LoggerService } from 'src/app/services/logger.service';
import { StatusService } from 'src/app/services/status.service';
import { LoginNameAndPwdRequest } from 'src/app/modules/auth/models/LoginNameAndPwdRequest';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

export class AuthChangeEventArgs {
  userName: string = ''
  loginName: string = ''
  userID: number = -1
  loggedIn: boolean = false
  error: any
}

@Component({
  selector: 'app-auth-fields',
  templateUrl: './auth-fields.component.html',
  styleUrls: ['./auth-fields.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthFieldsComponent extends BaseNavigatableComponentComponent implements AfterViewInit, AfterContentInit {
  @ViewChild('template', { static: true }) template: any

  TileCssClass = TileCssClass
  TileCssColClass = TileCssColClass

  @Input() formNav!: NavigatableForm

  @Input() userName: string = ''
  @Input() loginName: string = ''
  userID: number = -1
  
  private _loggedIn: boolean = false
  get loggedIn(): boolean { return this._loggedIn }
  set loggedIn(value: boolean) {
    let prevValue = this.loggedIn
    this._loggedIn = value
    if (prevValue != this.loggedIn) {
      this.authChange.emit({
        userID: this.userID,
        loginName: this.formNav.form.controls['loginName'].value,
        userName: this.formNav.form.controls['input_n'].value,
        loggedIn: this.loggedIn
      } as AuthChangeEventArgs)
    }
  }
  
  @Output() authChange: EventEmitter<AuthChangeEventArgs> = new EventEmitter<AuthChangeEventArgs>()
  @Output() ready: EventEmitter<any> = new EventEmitter<any>()

  constructor(private viewContainerRef: ViewContainerRef,
    private kBs: KeyboardNavigationService,
    private userService: UserService,
    private statusService: StatusService,
    private commonService: CommonService) {
    super()
    this.Setup()
  }

  private Setup(): void {
    this.IsDialog = true
    this.Matrix = [["input_n"]]
  }

  ngAfterContentInit(): void {
    this.formNav.form.addControl('input_n', new FormControl(this.userName, [Validators.required]))
    this.formNav.form.addControl('input_p', new FormControl(undefined, [Validators.required]))
    this.formNav.form.addControl('loginName', new FormControl(this.loginName, [Validators.required]))

    this.formNav.form.controls['input_n'].valueChanges.subscribe({
      next: newValue => {
        if (this.loginName !== newValue) {
          this.loggedIn = false
        }
        this.loginName = newValue
      }
    })
    this.formNav.form.controls['loginName'].valueChanges.subscribe({
      next: newValue => {
        if (this.userName !== newValue) {
          this.loggedIn = false
        }
        this.userName = newValue
      }
    })
  }

  ngAfterViewInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template)

    setTimeout(() => {
      this.ready.emit({})
    }, 100);
  }

  JumpToNextMatrix(event: any): void {
    if (!this.kBs.isEditModeActivated) {
      this.formNav!.HandleFormEnter(event)
    } else {
      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()
      this.kBs.Jump(AttachDirection.DOWN, false)
      this.kBs.setEditMode(KeyboardModes.NAVIGATION)
    }
  }

  UserDataFocusOut(): void {
    const username = this.formNav.form.controls['input_p'].value
    const password = this.formNav.form.controls['input_n'].value
    if (!HelperFunctions.isEmptyOrSpaces(username) && !HelperFunctions.isEmptyOrSpaces(password)) {
      this.authenticate()
    }
  }

  public onInput_nBlur() {
    if (this.formNav.form.controls['input_n'].value !== this.userName) {
      this.formNav.form.controls['loginName'].setValue('')
    }
    this.UserDataFocusOut()
  }

  authenticate(): void {
    this.statusService.waitForLoad(true)

    this.userService.CheckLoginNameAndPwd({
      LoginName: this.formNav.form.controls['input_n'].value,
      Password: this.formNav.form.controls['input_p'].value
    } as LoginNameAndPwdRequest).subscribe({
      next: res => {
        if (res && Object.keys(res).includes('id') && res.id > 0) {
          this.userID = res.id

          this.statusService.waitForLoad(false)

          this.formNav.form.controls['loginName'].setValue(res.name)

          this.loggedIn = true
        } else {
          this.statusService.waitForLoad(false)
          this.commonService.ShowErrorMessage((res as any).Message)

          this.authChange.emit({
            userID: this.userID,
            loginName: this.formNav.form.controls['loginName'].value,
            userName: this.formNav.form.controls['input_n'].value,
            loggedIn: this.loggedIn,
            error: (res as any).Message
          } as AuthChangeEventArgs)
        }
      },
      error: err => {
        this.statusService.waitForLoad(false)
        this.commonService.HandleError(err)

        this.authChange.emit({
          userID: this.userID,
          loginName: this.formNav.form.controls['loginName'].value,
          userName: this.formNav.form.controls['input_n'].value,
          loggedIn: this.loggedIn,
          error: err
        } as AuthChangeEventArgs)
      }
    })
  }
}
