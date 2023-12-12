import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Subscription, debounceTime, distinctUntilChanged, tap, map, switchMap, Observable, EMPTY, of } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { NavigatableForm } from 'src/assets/model/navigation/Nav';
import { INavigatable, NavigatableType, TileCssClass, AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { GetInvoicesParamListModel } from '../models/GetInvoicesParamListModel';
import { GetInvoicesResponse } from '../models/GetInvoicesResponse';
import { Invoice } from '../models/Invoice';
import { InvoiceTypes } from '../models/InvoiceTypes';
import { InvoiceService } from '../services/invoice.service';
import { InvoiceLine } from '../models/InvoiceLine';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { Constants } from 'src/assets/util/Constants';

@Component({
  selector: 'app-load-invoice-lines-dialog',
  templateUrl: './load-invoice-lines-dialog.component.html',
  styleUrls: ['./load-invoice-lines-dialog.component.scss']
})
export class LoadInvoiceLinesDialogComponent extends BaseNavigatableComponentComponent implements OnDestroy, AfterViewInit, INavigatable {
  public get isEditModeOff(): boolean {
    return !this.keyboardService.isEditModeActivated
  }

  override NavigatableType = NavigatableType.dialog

  public TileCssClass = TileCssClass

  public invoiceForm: FormGroup
  public navigateable: NavigatableForm
  public formId = 'CorrectionInvoiceSelectionDialogComponentForm'

  public get invoiceNumber() {
    return this.invoiceForm.get('invoiceNumber')
  }

  public isLoading = false

  public selectedInvoice?: Invoice

  get showSpinnerOnTable(): boolean {
    return this.isLoading && !this.statusService.InProgress;
  }

  public get isIncomingInvoice(): boolean {
    return this.invoiceType === InvoiceTypes.INV
  }

  @Input()
  public invoiceType: InvoiceTypes|undefined

  private invoiceQuery: Subscription

  constructor(
    private readonly keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
    private readonly invoiceService: InvoiceService,
    private readonly commonService: CommonService,
    private readonly dialogRef: NbDialogRef<InvoiceLine>,
    private readonly statusService: StatusService,
    private readonly toastrService: BbxToastrService,
  ) {
    super()

    this.IsDialog = true
    this.invoiceForm = new FormGroup({
      invoiceNumber: new FormControl('', []),
      negateQuantity: new FormControl(false, [])
    })

    this.navigateable = new NavigatableForm(
      this.invoiceForm,
      this.keyboardService,
      this.cdref,
      [],
      this.formId,
      AttachDirection.UP,
      {} as IInlineManager
    )

    this.invoiceQuery = this.invoiceForm.controls['invoiceNumber'].valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.selectedInvoice = undefined
          this.isLoading = true
        }),
        map(searchTerm => ({
          InvoiceNumber: searchTerm.toUpperCase(),
          InvoiceType: this.invoiceType
        } as GetInvoicesParamListModel)),
        switchMap(request => this.invoiceService.GetAll(request)),
        tap(() => this.isLoading = false),
        switchMap(this.setInputErrors.bind(this)),
      )
      .subscribe({
        next: response => this.selectedInvoice = response.data[0],
        error: (error) => {
          this.commonService.HandleError(error)
          this.isLoading = false
        },
      })

    this.Matrix = [['confirm-dialog-button-yes', 'confirm-dialog-button-no']]
  }

  private setInputErrors(response: GetInvoicesResponse): Observable<GetInvoicesResponse> {
    if (response.data.length === 0) {
      this.invoiceForm.get('invoiceNumber')?.setErrors({ missingInvoice: true })

      return EMPTY
    }

    return of(response)
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

  public ngOnDestroy(): void {
    this.keyboardService.RemoveWidgetNavigatable()

    if (!this.invoiceQuery.closed) {
      this.invoiceQuery.unsubscribe()
    }
  }

  public async select(): Promise<void> {
    if (!this.selectedInvoice) {
      this.toastrService.showError(Constants.MSG_ERROR_INVALID_FORM)

      return
    }

    const invoiceLines = this.selectedInvoice?.invoiceLines.map(x => InvoiceLine.fromData(x)) ?? []

    const negateQuantity = this.invoiceForm.controls['negateQuantity'].value
    if (negateQuantity) {
      for (const invoiceLine of invoiceLines) {
        invoiceLine.quantity *= -1
      }
    }

    this.dialogRef.close(invoiceLines)
  }

  public close(): void {
    this.dialogRef.close(undefined)
  }
}
