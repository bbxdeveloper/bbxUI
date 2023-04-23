import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { AttachDirection, INavigatable, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { InvoiceService } from '../services/invoice.service';
import { InvoiceTypes } from '../models/InvoiceTypes';
import { GetInvoicesParamListModel } from '../models/GetInvoicesParamListModel';
import { CommonService } from 'src/app/services/common.service';
import { Invoice } from '../models/Invoice';
import { NbDialogRef } from '@nebular/theme';
import { GetInvoicesResponse } from '../models/GetInvoicesResponse';
import { debounce } from 'src/assets/util/debounce';

@Component({
  selector: 'app-correction-invoice-selection-dialog',
  templateUrl: './correction-invoice-selection-dialog.component.html',
  styleUrls: ['./correction-invoice-selection-dialog.component.scss']
})
export class CorrectionInvoiceSelectionDialogComponent extends BaseNavigatableComponentComponent implements OnInit, OnDestroy, AfterViewInit, INavigatable {
  public get isEditModeOff(): boolean {
    return !this.keyboardService.isEditModeActivated
  }

  public TileCssClass = TileCssClass

  public invoiceForm: FormGroup
  public navigateable: FlatDesignNoTableNavigatableForm
  public formId = 'CorrectionInvoiceSelectionDialogComponentForm'

  public get invoiceNumber() {
    return this.invoiceForm.get('invoiceNumber')
  }

  public isLoading = false

  public selectedInvoice?: Invoice

  constructor(
    private readonly keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
    private readonly footerService: FooterService,
    private readonly sidebarService: BbxSidebarService,
    private readonly invoiceService: InvoiceService,
    private readonly commonService: CommonService,
    private readonly dialogRef: NbDialogRef<Invoice>
  ) {
    super()

    this.IsDialog = true
    this.invoiceForm = new FormGroup({
      invoiceNumber: new FormControl('', [])
    })
    this.invoiceForm.controls['invoiceNumber'].valueChanges
      .subscribe(this.onInvoiceNumberChanged.bind(this))

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

  @debounce(400)
  private async onInvoiceNumberChanged(value: string): Promise<void> {
    this.selectedInvoice = undefined

    try {
      this.isLoading = true

      const request = {
        InvoiceNumber: value,
        InvoiceType: InvoiceTypes.INV
      } as GetInvoicesParamListModel
      const response = await this.invoiceService.getAllAsync(request)

      if (this.setInputErrors(response)) {
        return
      }

      this.selectedInvoice = response.data[0]
    }
    catch (error) {
      this.commonService.HandleError(error)
    }
    finally {
      this.isLoading = false
    }
  }

  private setInputErrors(response: GetInvoicesResponse): boolean {
    if (response.data.length === 0) {
      this.invoiceForm.get('invoiceNumber')?.setErrors({ missingInvoice: true })

      return true
    }

    const hasIncoming = response.data.find(x => x.incoming)
    if (hasIncoming) {
      this.invoiceForm.get('invoiceNumber')?.setErrors({ noIncoming: true })

      return true
    }

    return false
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

  public ngOnDestroy(): void {
    this.keyboardService.RemoveWidgetNavigatable()
  }

  public select(): void {
    this.dialogRef.close(this.selectedInvoice)
  }

  public close(): void {
    this.dialogRef.close(undefined)
  }
}
