import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { AttachDirection, NavigatableType, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigatableForm } from 'src/assets/model/navigation/Nav';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { StatusService } from 'src/app/services/status.service';
import { NbDialogRef } from '@nebular/theme';
import { NavService } from '../services/nav.service';
import { SendInvoiceToNavResponse } from '../models/SendInvoiceToNavResponse';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-send-data-to-nav',
  templateUrl: './send-data-to-nav.component.html',
  styleUrls: ['./send-data-to-nav.component.scss']
})
export class SendDataToNavComponent extends BaseNavigatableComponentComponent implements OnInit, AfterViewInit, OnDestroy {
  public get isEditModeOff(): boolean {
    return !this.keyboardService.isEditModeActivated
  }

  public get showSpinnerOnTable(): boolean {
    return this.isLoading && !this.statusService.InProgress;
  }

  public get invoiceNumber() {
    return this.form.get('invoiceNumber')
  }

  override NavigatableType = NavigatableType.dialog

  public TileCssClass = TileCssClass

  public isLoading = false

  public form: FormGroup
  public navigateable: NavigatableForm
  public formId = 'SendDataToNavComponentFormId'

  constructor(
    private readonly keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
    private readonly dialogRef: NbDialogRef<void>,
    private readonly statusService: StatusService,
    private readonly navService: NavService,
    private readonly toastrService: BbxToastrService,
    private readonly commonService: CommonService,
  ) {
    super()

    this.IsDialog = true

    this.form = new FormGroup({
      invoiceNumber: new FormControl('', [Validators.required])
    })
    this.navigateable = new NavigatableForm(
      this.form,
      this.keyboardService,
      this.cdref,
      [],
      this.formId,
      AttachDirection.UP,
      {} as IInlineManager
    )

    this.Matrix = [['confirm-dialog-button-yes', 'confirm-dialog-button-no']]
   }

  public ngAfterViewInit(): void {
    this.keyboardService.SetWidgetNavigatable(this)

    this.cdref.detectChanges()

    this.navigateable.OuterJump = true
    this.OuterJump = true

    this.navigateable.GenerateAndSetNavMatrices(true)

    this.keyboardService.SelectFirstTile()
    this.keyboardService.Jump(AttachDirection.UP, true)
  }

  public ngOnDestroy(): void {
    this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)
    this.keyboardService.RemoveWidgetNavigatable()
  }

  public moveToButtons(event: Event): void {
    if (this.isLoading) {
      return
    }

    if (this.isEditModeOff) {
      this.navigateable.HandleFormEnter(event)
    }
    else {
      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()

      this.keyboardService.Jump(AttachDirection.DOWN, false)
      this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)
    }
  }

  public send(): void {
    if (this.form.invalid) {
      this.toastrService.showError(Constants.MSG_ERROR_INVALID_FORM)
      return
    }

    this.statusService.waitForSave(true)

    const value = this.form.controls['invoiceNumber'].value
    this.navService.sendInvoice(value).subscribe({
      next: (response: SendInvoiceToNavResponse) => {
        if (response.succeeded) {
          const message = Constants.NAV_INVOICE_SENT.replace('{{invoice-number}}', value)
          this.toastrService.showSuccess(message, true)

          this.dialogRef.close()
        }
        else {
          this.toastrService.showError(response.errors)
        }
      },
      error: error => {
        this.commonService.HandleError(error)
        this.statusService.waitForSave(false)
      },
      complete: () => this.statusService.waitForSave(false)
    })
  }

  public close(): void {
    this.dialogRef.close()
  }
}
