import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { noop } from 'rxjs';
import { LoggerService } from 'src/app/services/logger.service';
import { Constants } from 'src/assets/util/Constants';

@Component({
  selector: 'app-bbx-product-code-input',
  templateUrl: './bbx-product-code-input.component.html',
  styleUrls: ['./bbx-product-code-input.component.scss'],
  // Should be able to style it freely from the outside just like a regular input
  // encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => BbxProductCodeInputComponent)
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => BbxProductCodeInputComponent)
    }
  ]
})
export class BbxProductCodeInputComponent implements OnInit, ControlValueAccessor, Validator {
  @Input() name: string = ''
  @Input() id: string = ''

  @Input() input_class: any
  @Input() style_text_align: any

  @Input() debug: boolean = true

  @Input() disabled: boolean = false
  @Input() required: boolean = false
  @Input() readonly: boolean = false

  touched: boolean = false

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
    if (!v) {
      return
    }

    this.markAsTouched()
    if (v !== this.innerValue) {
      if (this.innerValue.length > 0 && v.length - this.innerValue.length === 2) {
        if (v.length !== 4) {
          v = v.slice(0, -1)
        }
      }

      this.innerValue = v
      this.onChangeCallback(v)
    }
  }

  // ctor

  constructor(private logger: LoggerService) { }

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

  // Product code handling, selecting products...

}
