import { AfterViewInit, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection, INavigatable, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { InvoiceService } from '../services/invoice.service';
import { InvoiceTypes } from '../models/InvoiceTypes';
import { GetInvoicesParamListModel } from '../models/GetInvoicesParamListModel';
import { CommonService } from 'src/app/services/common.service';
import { Invoice } from '../models/Invoice';
import { NbDialogRef } from '@nebular/theme';
import { GetInvoicesResponse } from '../models/GetInvoicesResponse';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { NavigatableForm } from 'src/assets/model/navigation/Nav';
import { Router } from '@angular/router';
import { EMPTY, Observable, Subscription, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

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
  public navigateable: NavigatableForm
  public formId = 'CorrectionInvoiceSelectionDialogComponentForm'

  public get invoiceNumber() {
    return this.invoiceForm.get('invoiceNumber')
  }

  public isLoading = false

  public selectedInvoice?: Invoice

  @Input()
  public isIncomingCorrectionInvoice: boolean = false

  private invoiceQuery: Subscription

  constructor(
    private readonly keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
    private readonly invoiceService: InvoiceService,
    private readonly commonService: CommonService,
    private readonly dialogRef: NbDialogRef<Invoice>,
    private readonly router: Router,
  ) {
    super()

    this.IsDialog = true
    this.invoiceForm = new FormGroup({
      invoiceNumber: new FormControl('', [])
    })
    this.invoiceQuery = this.invoiceForm.controls['invoiceNumber'].valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.selectedInvoice = undefined
          this.isLoading = true
        }),
        map(searchTerm => ({
          InvoiceNumber: searchTerm,
          InvoiceType: this.isIncomingCorrectionInvoice ? InvoiceTypes.INC : InvoiceTypes.INV
        } as GetInvoicesParamListModel)),
        switchMap(request => this.invoiceService.GetAll(request)),
        tap(() => {
          this.isLoading = false
        }),
        switchMap(this.setInputErrors.bind(this)),
      )
      .subscribe({
        next: response => this.selectedInvoice = response.data[0],
        error: this.commonService.HandleError.bind(this)
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

    this.Matrix = [['confirm-dialog-button-yes', 'confirm-dialog-button-no']]
  }

  private setInputErrors(response: GetInvoicesResponse): Observable<GetInvoicesResponse> {
    if (response.data.length === 0) {
      this.invoiceForm.get('invoiceNumber')?.setErrors({ missingInvoice: true })

      return EMPTY
    }

    const hasIncoming = response.data.find(x => x.incoming)

    if (!this.isIncomingCorrectionInvoice) {
      if (hasIncoming) {
        this.invoiceForm.get('invoiceNumber')?.setErrors({ itsNotOutcoming: true })

        return EMPTY
      }
    }
    else {
      if (!hasIncoming) {
        this.invoiceForm.get('invoiceNumber')?.setErrors({ itsNotIncoming: true })

        return EMPTY
      }
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

    if (!this.invoiceQuery.closed) {
      this.invoiceQuery.unsubscribe()
    }
  }

  public select(): void {
    this.dialogRef.close(this.selectedInvoice)
  }

  public close(): void {
    this.dialogRef.close(undefined)

    this.backToHeader()
  }

  private backToHeader(): void {
    this.keyboardService.RemoveWidgetNavigatable();
    this.router.navigate(["home"])
    setTimeout(() => {
      this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)
      this.keyboardService.ResetToRoot()
      this.keyboardService.SetPositionById("header-income")
      this.keyboardService.SelectCurrentElement()
    }, 700);
  }

  @HostListener('keydown.esc', ['$event'])
  public escKeydown(event: KeyboardEvent) {
    this.backToHeader()
  }
}
