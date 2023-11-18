import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { noop } from 'rxjs';
import { LoggerService } from 'src/app/services/logger.service';
import { Constants } from 'src/assets/util/Constants';
import { NbFormFieldControl, NbPopoverDirective } from '@nebular/theme';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { NgNeatInputMasks } from 'src/assets/model/NgNeatInputMasks';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { fixCursorPosition, fixIntegerCursorPosition } from 'src/assets/util/input/fixCursorPosition';
import { KeyBindings } from 'src/assets/util/KeyBindings';

export enum BbxNumericInputType {
  DEFAULT = 'FLOAT',
  FLOAT = 'FLOAT',
  INTEGER = 'INTEGER'
}

@Component({
  selector: 'app-bbx-numeric-input',
  templateUrl: './bbx-numeric-input.component.html',
  styleUrls: ['./bbx-numeric-input.component.scss'],
  // Should be able to style it freely from the outside just like a regular input
  // encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => BbxNumericInputComponent)
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => BbxNumericInputComponent)
    },
    {
      // To avoid error "NbFormFieldComponent" must contain [nbInput]
      // Based on how it's done in material: https://material.angular.io/guide/creating-a-custom-form-field-control
      // Couldn't find any tutorial for Nebular in this case
      provide: NbFormFieldControl, useExisting: BbxNumericInputComponent
    }
  ]
})
export class BbxNumericInputComponent implements OnInit, ControlValueAccessor, Validator {
  @ViewChild(NbPopoverDirective) popover?: NbPopoverDirective;

  @Input() name: string = ''
  @Input() id: string = ''

  @Input() input_class: any
  @Input() style_text_align: any

  @Input() debug: boolean = false

  @Input() disabled: boolean = false
  @Input() required: boolean = false
  @Input() readonly: boolean = false

  @Input() input_type: BbxNumericInputType | string = BbxNumericInputType.DEFAULT

  @Input() formCtrlName: string | number | null = null
  @Input() isFormCtrl: boolean = false
  @Input() usedForm?: FormGroup
  @Input() formCtrlLabel: string = ''

  @Input() min: number = Number.MIN_SAFE_INTEGER
  @Input() max: number = Number.MAX_SAFE_INTEGER

  @Input() inputmask?: any
  @Input() placeholder?: string

  @Input() useFixCursorPosition: boolean = true

  @Input() canCloseCalculatorWithEscape: boolean = true

  touched: boolean = false

  @ViewChild('input')
  public input: ElementRef|undefined

  useInputMask: boolean = true

  numberInputMask = NgNeatInputMasks.numberInputMask;
  numberInputMaskSingle = NgNeatInputMasks.numberInputMaskSingle;
  offerDiscountInputMask = NgNeatInputMasks.offerDiscountInputMask;
  numberInputMaskInteger = NgNeatInputMasks.numberInputMaskInteger;

  get input_mask(): any {
    if (this.inputmask === undefined) {
      if (this.input_type == "FLOAT") {
        return this.numberInputMask
      } else {
        return this.numberInputMaskInteger
      }
    }
    return this.inputmask
  }
  get input_placeholder(): string {
    if (HelperFunctions.isEmptyOrSpaces(this.placeholder)) {
      return this.input_type == "FLOAT" ? '0.00' : '0'
    }
    return this.placeholder!
  }

  // Output

  @Output()
  public blur = new EventEmitter<any>()

  @Output()
  public focus = new EventEmitter<any>()

  @Output()
  public focusOut = new EventEmitter<any>()

  @Output()
  public click = new EventEmitter<any>()

  // Mask

  maskPatterns = Constants.ProductCodePatterns;
  mask = Constants.ProductCodeMask;

  // Value, callbacks...

  private onTouchedCallback: () => void = noop
  private onChangeCallback: (newValue: any) => void = noop

  private innerValue: any = ''

  get value(): any {
    return this.innerValue
  }
  set value(v: any) {
    this.log(`[BbxProductCodeInputComponent] set value, current value: '${this.value}', new value: '${v}'`)
    this.markAsTouched()
    if (v !== this.innerValue) {
      this.innerValue = v
      this.onChangeCallback(v)
    }
  }

  private focusOnSavedValue?: any

  // ctor

  constructor(private logger: LoggerService,
              private keyboardService: KeyboardNavigationService,
              private changeRef: ChangeDetectorRef) { }

  // Lifecycle-hooks

  ngOnInit(): void {
    this.log(`[BbxProductCodeInputComponent] ngOnInit`)
  }

  // Handling events

  // TODO for BbxProductCodeInputComponent: test
  proxyBlur(value: any) {
    this.log(`[BbxProductCodeInputComponent] proxyBlur, event: ${JSON.stringify(value)}`)

    this.focusOnSavedValue = this.value
    
    this.blur.emit(value)
  }

  // TODO for BbxProductCodeInputComponent: test
  proxyFocus(value: any) {
    this.log(`[BbxProductCodeInputComponent] proxyFocus, event: ${JSON.stringify(value)}`)

    this.focusOnSavedValue = this.value

    if (this.useFixCursorPosition) {
      if (this.input_type == 'INTEGER') {
        fixIntegerCursorPosition(value)
      } else {
        fixCursorPosition(value)
      }
    }

    this.focus.emit(value)
  }

  // TODO for BbxProductCodeInputComponent: test
  proxyFocusOut(value: any) {
    this.log(`[BbxProductCodeInputComponent] proxyFocusOut, event: ${JSON.stringify(value)}`)
    this.focusOut.emit(value)
  }

  // TODO for BbxProductCodeInputComponent: test
  proxyClick(value: any) {
    this.log(`[BbxProductCodeInputComponent] proxyClick, event: ${JSON.stringify(value)}`)
    this.click.emit(value)
  }

  // Misc functions

  private log(m: any): void {
    if (!this.debug) {
      return
    }
    this.logger.info(m)
  }

  // TODO for BbxProductCodeInputComponent: Fix control staying "ng-untouched" - inner controls changes to "ng-touched" as it should
  markAsTouched() {
    this.log(`[BbxProductCodeInputComponent] markAsTouched, current value: ${this.touched}`)
    if (!this.touched) {
      this.onTouchedCallback()
      this.touched = true
    }
  }

  // ControlValueAccessor

  writeValue(obj: any): void {
    this.log(`[BbxProductCodeInputComponent] writeValue: ${obj}`)
    this.value = obj
  }
  registerOnChange(fn: any): void {
    this.log(`[BbxProductCodeInputComponent] registerOnChange`)
    this.onChangeCallback = fn
  }
  registerOnTouched(fn: any): void {
    this.log(`[BbxProductCodeInputComponent] registerOnTouched`)
    this.onTouchedCallback = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    this.log(`[BbxProductCodeInputComponent] setDisabledState: ${isDisabled}`)
    this.disabled = isDisabled
  }

  // Validator

  validate(control: AbstractControl): ValidationErrors | null {
    return null
  }
  registerOnValidatorChange?(fn: () => void): void {

  }

  // Misc...

  public openCalculator(event: any): void {
    HelperFunctions.StopEvent(event)
    if (!this.popover?.isShown) {
      this.popover?.show()
    } else {
      this.popover?.hide()
    }
  }

  public closeCalculator(): void {
    this.popover?.hide()
    this.keyboardService.ClickCurrentElement()
  }

  //#region Key events

  public onDeleteDown(event: any): void {
    // console.log("onDeleteDown: ", event.target.value, event)
  }

  public onDeleteUp(event: any): void {
    // console.log("onDeleteUp: ", event.target.selectionStart, event.target.value, event, event.target)
    this.writeValue(event.target.value)
    let selectionStart = event.target.selectionStart
    setTimeout(() => {
      event.target.selectionStart = selectionStart
      event.target.selectionEnd = selectionStart
    }, 100);
  }

  public onBackspaceDown(event: any): void {
    // console.log("onBackspaceDown: ", event.target.value, event)
  }

  public onBackspaceUp(event: any): void {
    // console.log("onBackspaceUp: ", event.target.value, event)
    this.writeValue(event.target.value)
    let selectionStart = event.target.selectionStart
    setTimeout(() => {
      event.target.selectionStart = selectionStart
      event.target.selectionEnd = selectionStart
    }, 100);
  }

  public onEscapeDown(event: any): void {
    // console.log("onEscapeDown: ", event.target.value, event)
    this.id = event.target.id

    // Switching to non-masked input so view value won't be affected by inputmask bug
    this.useInputMask = false

    this.changeRef.markForCheck()
    this.changeRef.detectChanges()

    // Switching back to masked input
    setTimeout(() => {
      this.useInputMask = true

      this.changeRef.markForCheck()
      this.changeRef.detectChanges()

      this.keyboardService.SelectCurrentElement()
    }, 100);
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case KeyBindings.exit:
      case KeyBindings.exitIE:
        if (this.focusOnSavedValue || this.focusOnSavedValue == '') {
          this.writeValue(this.focusOnSavedValue)
          $('#' + (event.target as any).id).text(this.focusOnSavedValue)
        }
        break
      case KeyBindings.Enter:
        this.focusOnSavedValue = this.value
        break
    }
  }

  //#endregion Key events
}
