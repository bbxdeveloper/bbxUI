import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { NbDialogRef } from '@nebular/theme';
import { InvoiceLine } from '../models/InvoiceLine';
import { NavigatableForm } from 'src/assets/model/navigation/Nav';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { ProductService } from '../../product/services/product.service';
import { GetProductByCodeRequest } from '../../product/models/GetProductByCodeRequest';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { ProductPriceChange } from '../models/ProductPriceChange';
import { Product } from '../../product/models/Product';
import { createMask } from '@ngneat/input-mask';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

type PriceChangeFormValues = {
  productCode: string
  productDescription: string
  oldUnitPrice1: number
  newUnitPrice1: number
  oldUnitPrice2: number
  newUnitPrice2: number
}

@Component({
  selector: 'app-invoice-price-change-dialog',
  templateUrl: './invoice-price-change-dialog.component.html',
  styleUrls: ['./invoice-price-change-dialog.component.scss']
})
export class InvoicePriceChangeDialogComponent extends BaseNavigatableComponentComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input()
  public productCode: string = ''

  @Input()
  public newPrice: number = 0

  @Input()
  public priceChange!: ProductPriceChange

  @Input()
  public wasOpen: boolean = false

  @ViewChild('newUnitPrice1')
  private newUnitPrice1!: ElementRef

  private requestSubscription: Subscription|undefined

  public get isEditModeOff(): boolean {
    return !this.keyboardService.isEditModeActivated
  }

  public isLoading = false

  public TileCssClass = TileCssClass

  numberInputMask: any = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0.0',
  });

  public formId = 'product-price-change-form-dialog'
  public productPriceChangeForm!: FormGroup
  public navigateable: NavigatableForm

  constructor(
    private readonly dialogRef: NbDialogRef<InvoiceLine>,
    private readonly keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
    private readonly commonService: CommonService,
    private readonly productService: ProductService,
  ) {
    super()

    this.IsDialog = true

    this.productPriceChangeForm = new FormGroup({
      productCode: new FormControl(''),
      productDescription: new FormControl(''),
      oldUnitPrice1: new FormControl(0),
      newUnitPrice1: new FormControl(0),
      oldUnitPrice2: new FormControl(0),
      newUnitPrice2: new FormControl(0),
    })

    this.navigateable = new NavigatableForm(
      this.productPriceChangeForm,
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
    this.keyboardService.RemoveWidgetNavigatable()

    if (this.requestSubscription?.closed === false) {
      this.requestSubscription.unsubscribe()
    }
  }

  public override ngOnInit(): void {
    const request = {
      ProductCode: this.productCode
    } as GetProductByCodeRequest

    this.isLoading = true

    this.requestSubscription = this.productService.GetProductByCode(request)
      .pipe(
        switchMap(this.createFormValues.bind(this))
      )
      .subscribe({
        next: prices => {
          this.productPriceChangeForm.patchValue(prices);

          const input = this.newUnitPrice1.nativeElement
          const position = input.value.indexOf('.')
          input.selectionStart = position
          input.selectionEnd = position
        },
        error: error => {
          this.commonService.HandleError(error)
          this.isLoading = false
        },
        complete: () => this.isLoading = false
      })
  }

  private createFormValues(product: Product): Observable<PriceChangeFormValues> {
    let newUnitPrice1
    let newUnitPrice2

    if (this.wasOpen && this.priceChange !== undefined) {
      newUnitPrice1 = this.priceChange.newUnitPrice1
      newUnitPrice2 = this.priceChange.newUnitPrice2
    }
    else {
      const [unitPrice1, unitPrice2] = this.calculateNewPrices(product)

      newUnitPrice1 = unitPrice1
      newUnitPrice2 = unitPrice2
    }

    return of({
      productCode: product.productCode,
      productDescription: product.description,
      oldUnitPrice1: product.unitPrice1,
      newUnitPrice1: newUnitPrice1,
      oldUnitPrice2: product.unitPrice2,
      newUnitPrice2: newUnitPrice2,
    } as PriceChangeFormValues)
  }

  private calculateNewPrices(product: Product): [number, number] {
    let changeRatePercent
    const latestSupplyPrice = HelperFunctions.ToFloat(product.latestSupplyPrice)

    if (latestSupplyPrice === 0) {
      changeRatePercent = this.newPrice
    }
    else if (this.newPrice > latestSupplyPrice) {
      const priceDelta = this.newPrice - latestSupplyPrice
      changeRatePercent = priceDelta / latestSupplyPrice + 1
    }
    else {
      changeRatePercent = 1
    }

    const newPrice1 = this.setNewPrice(product.unitPrice1!, changeRatePercent)
    const newPrice2 = this.setNewPrice(product.unitPrice2!, changeRatePercent)

    return [newPrice1, newPrice2]
  }

  private setNewPrice(oldPrice: number, changeRatePercent: number): number {
    const newPrice = oldPrice === 0 ? this.newPrice : oldPrice * changeRatePercent
    return HelperFunctions.Round(newPrice)
  }

  public fixCursorPosition(event: FocusEvent) {
    const input = event.target as HTMLInputElement
    const position = input.value.indexOf('.')
    input.selectionStart = position
    input.selectionEnd = position
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

  public changePrice(): void {
    const controls = this.productPriceChangeForm.controls

    const priceChange = {
      newUnitPrice1: HelperFunctions.ToFloat(controls['newUnitPrice1'].value),
      newUnitPrice2: HelperFunctions.ToFloat(controls['newUnitPrice2'].value)
    } as ProductPriceChange

    this.dialogRef.close(priceChange)
  }

  public close(): void {
    const controls = this.productPriceChangeForm.controls

    const priceChange = {
      newUnitPrice1: this.wasOpen ? HelperFunctions.ToFloat(controls['newUnitPrice1'].value) : HelperFunctions.ToFloat(controls['oldUnitPrice1'].value),
      newUnitPrice2: this.wasOpen ? HelperFunctions.ToFloat(controls['newUnitPrice2'].value) : HelperFunctions.ToFloat(controls['oldUnitPrice2'].value)
    } as ProductPriceChange

    this.dialogRef.close(priceChange)
  }
}
