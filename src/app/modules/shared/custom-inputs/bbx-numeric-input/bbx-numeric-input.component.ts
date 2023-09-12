import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, ViewEncapsulation, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { noop } from 'rxjs';
import { LoggerService } from 'src/app/services/logger.service';
import { Constants } from 'src/assets/util/Constants';
import { ProductCodeManagerServiceService } from 'src/app/services/product-code-manager-service.service';
import { NbPopoverDirective } from '@nebular/theme';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { NgNeatInputMasks } from 'src/assets/model/NgNeatInputMasks';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';

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
    }
  ]
})
export class BbxNumericInputComponent implements OnInit, ControlValueAccessor, Validator {
  @ViewChild(NbPopoverDirective) popover?: NbPopoverDirective;
  
  @Input() name: string = ''
  @Input() id: string = ''

  @Input() input_class: any
  @Input() style_text_align: any

  @Input() debug: boolean = true

  @Input() disabled: boolean = false
  @Input() required: boolean = false
  @Input() readonly: boolean = false

  @Input() input_type: BbxNumericInputType = BbxNumericInputType.DEFAULT

  touched: boolean = false
  
  numberInputMask = NgNeatInputMasks.numberInputMask;
  numberInputMaskSingle = NgNeatInputMasks.numberInputMaskSingle;
  offerDiscountInputMask = NgNeatInputMasks.offerDiscountInputMask;
  numberInputMaskInteger = NgNeatInputMasks.numberInputMaskInteger;

  // Output

  @Output()
  public blur = new EventEmitter<any>()

  @Output()
  public focus = new EventEmitter<any>()

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

  // ctor

  constructor(private logger: LoggerService,
              private keyboardService: KeyboardNavigationService) { }

  // Lifecycle-hooks

  ngOnInit(): void {
    this.log(`[BbxProductCodeInputComponent] ngOnInit`)
  }

  // Handling events

  // TODO for BbxProductCodeInputComponent: test
  proxyBlur(value: any) {
    this.log(`[BbxProductCodeInputComponent] proxyBlur, event: ${JSON.stringify(value)}`)
    this.blur.emit(value)
  }

  // TODO for BbxProductCodeInputComponent: test
  proxyFocus(value: any) {
    this.log(`[BbxProductCodeInputComponent] proxyFocus, event: ${JSON.stringify(value)}`)
    this.focus.emit(value)
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

}
