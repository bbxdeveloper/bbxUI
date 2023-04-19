import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { AttachDirection, INavigatable, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';

@Component({
  selector: 'app-correction-invoice-selection-dialog',
  templateUrl: './correction-invoice-selection-dialog.component.html',
  styleUrls: ['./correction-invoice-selection-dialog.component.scss']
})
export class CorrectionInvoiceSelectionDialogComponent extends BaseNavigatableComponentComponent implements OnInit, AfterViewInit, INavigatable {
  public get isEditModeOff(): boolean {
    return !this.keyboardService.isEditModeActivated
  }

  public TileCssClass = TileCssClass

  public invoiceForm: FormGroup
  public navigateable: FlatDesignNoTableNavigatableForm
  public formId = 'CorrectionInvoiceSelectionDialogComponentForm'

  constructor(
    private readonly keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
    private readonly footerService: FooterService,
    private readonly sidebarService: BbxSidebarService
  ) {
    super()

    this.IsDialog = true
    this.invoiceForm = new FormGroup({
      invoiceNumber: new FormControl('', [])
    })

    this.navigateable = new FlatDesignNoTableNavigatableForm(
      this.invoiceForm,
      this.keyboardService,
      this.cdref,
      [],
      this.formId,
      AttachDirection.UP,
      [],
      this.sidebarService,
      this.footerService
    )

    this.navigateable.IsFootersEnabled = true

    this.Matrix = [['confirm-dialog-button-yes', 'confirm-dialog-button-no']]
  }

  public ngAfterViewInit(): void {
    this.keyboardService.SetWidgetNavigatable(this)

    this.cdref.detectChanges()

    this.navigateable.OuterJump = true
    this.OuterJump = true

    this.navigateable.AfterViewInitSetup()

    this.keyboardService.SelectFirstTile()
    this.keyboardService.Jump(AttachDirection.UP, true)
  }

  public override ngOnInit(): void {
  }

  public moveToButtons(event: Event): void {
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

  public select(): void {

  }

  public close(): void {

  }

}
