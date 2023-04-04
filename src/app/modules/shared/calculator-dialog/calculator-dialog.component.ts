import { AfterViewInit, ChangeDetectorRef, Component, HostListener, Input, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AttachDirection, NavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { DateIntervalDialogResponse } from 'src/assets/model/DateIntervalDialogResponse';
import { createMask } from '@ngneat/input-mask';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-calculator-dialog',
  templateUrl: './calculator-dialog.component.html',
  styleUrls: ['./calculator-dialog.component.scss']
})
export class CalculatorDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  @Input() numberInputMask: any = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0.0',
    allowMinus: false
  })

  @Input() placeHolder: string = '0.00'

  @Input() default: number = 0.0

  calcSymbol: string = ''

  result: number = 0.0
  manipulator: number = 0.0
  base: number = 0.0

  closedManually = false

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated
  }

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<CalculatorDialogComponent>,
    private kbS: KeyboardNavigationService
  ) {
    super()
    this.Setup()
  }

  private Setup(): void {
    this.IsDialog = true
    this.Matrix = [['calc-input']]
  }

  ngAfterViewInit(): void {
    this.kbS.SetWidgetNavigatable(this)
    this.kbS.SelectFirstTile()
    this.kbS.setEditMode(KeyboardModes.EDIT)
    if (this.default !== undefined) {
      this.base = this.default
      this.result = this.default
    }
    setTimeout(() => {
      HelperFunctions.SelectBeginningByClass('one-number-input-dialog-input', 1)
    }, 100);
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)
  }

  close() {
    this.closedManually = true
    this.kbS.RemoveWidgetNavigatable()
    this.dialogRef.close(this.result)
  }

  private calc(): void {
    console.log(`[Calculator calc BEGIN] operator: ${this.calcSymbol}, base: ${this.base}, manipulator: ${this.manipulator}, result: ${this.result}`)
    
    this.result = HelperFunctions.ToFloat(this.result)
    this.base = HelperFunctions.ToFloat(this.base)
    this.manipulator = Math.abs(HelperFunctions.ToFloat(this.manipulator))

    console.log(`[Calculator calc NUMBER CONVERT] operator: ${this.calcSymbol}, base: ${this.base}, manipulator: ${this.manipulator}, result: ${this.result}`)
    
    switch (this.calcSymbol) {
      case '-':
        this.result = this.base - this.manipulator
        break
      case '+':
        this.result = this.base + this.manipulator
        break
      case '*':
        this.result = this.base * this.manipulator
        break
      case '/':
        this.result = this.base / this.manipulator
        break
      default:
        return
    }
    
    this.base = this.result
    this.manipulator = 0.0
    
    HelperFunctions.SelectBeginningByClass('one-number-input-dialog-input', 1)

    console.log(`[Calculator calc END] operator: ${this.calcSymbol}, base: ${this.base}, manipulator: ${this.manipulator}, result: ${this.result}`)
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    var asNumber = HelperFunctions.ToFloat(event.key)
    if (!Number.isNaN(asNumber) && typeof asNumber === 'number') {
      return
    }
    switch (event.key) {
      case '-':
      case '+':
      case '*':
      case '/':
        this.calcSymbol = event.key
        return
      default:
        HelperFunctions.StopEvent(event)
    }
    if (event.key == KeyBindings.Enter) {
      this.calc()
    } else if (event.key == KeyBindings.exit || event.key == KeyBindings.exitIE) {
      this.close()
    }
  }
}