import { AfterViewInit, Component, HostListener, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../base-navigatable-component/base-navigatable-component.component';
import { createMask } from '@ngneat/input-mask';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { NavigatableType } from 'src/assets/model/navigation/Navigatable';

@Component({
  selector: 'app-calculator-popover',
  templateUrl: './calculator-popover.component.html',
  styleUrls: ['./calculator-popover.component.scss']
})
export class CalculatorPopoverComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
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

  @Input() result: number = 0.0
  @Output('resultChange') resultChanged: EventEmitter<number> = new EventEmitter<number>()

  @Output() popoverClose: EventEmitter<any> = new EventEmitter<any>()

  /**
   * True -> using Enter for multiple operations one after the other
   * False -> the first Enter key will close the calculator after the operation
   */
  @Input() multipleOperations: boolean = false
  @Input() canCloseWithEscape: boolean = true

  override NavigatableType = NavigatableType.dialog

  calcSymbol: string = '?'
  
  manipulator: number = 0.0
  base: number = 0.0

  closedManually = false

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated
  }

  constructor(
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
    this.base = this.result
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
    this.popoverClose.emit()
  }

  private calc(): void {
    // console.log(`[Calculator calc BEGIN] operator: ${this.calcSymbol}, base: ${this.base}, manipulator: ${this.manipulator}, result: ${this.result}`)
    
    this.result = HelperFunctions.ToFloat(this.result)
    this.base = HelperFunctions.ToFloat(this.base)
    this.manipulator = Math.abs(HelperFunctions.ToFloat(this.manipulator))

    // console.log(`[Calculator calc NUMBER CONVERT] operator: ${this.calcSymbol}, base: ${this.base}, manipulator: ${this.manipulator}, result: ${this.result}`)
    
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

    this.resultChanged.emit(this.result)

    // console.log(`[Calculator calc END] operator: ${this.calcSymbol}, base: ${this.base}, manipulator: ${this.manipulator}, result: ${this.result}`)

    if (!this.multipleOperations) {
      this.close()
    }
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
      if (this.canCloseWithEscape) {
        this.close()
      } else {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
      }
    }
  }
}