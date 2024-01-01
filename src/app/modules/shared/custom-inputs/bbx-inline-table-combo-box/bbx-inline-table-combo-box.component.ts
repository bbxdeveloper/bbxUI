import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { NbFormFieldControl } from '@nebular/theme';
import { BehaviorSubject, Observable, noop, of } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/FlatDesignNavigatableForm';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { BlankComboBoxValue } from 'src/assets/model/navigation/Nav';
import { TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Navigatable';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bbx-inline-table-combo-box',
  templateUrl: './bbx-inline-table-combo-box.component.html',
  styleUrls: ['./bbx-inline-table-combo-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => BbxInlineTableComboBoxComponent)
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => BbxInlineTableComboBoxComponent)
    },
    {
      // To avoid error "NbFormFieldComponent" must contain [nbInput]
      // Based on how it's done in material: https://material.angular.io/guide/creating-a-custom-form-field-control
      // Couldn't find any tutorial for Nebular in this case
      provide: NbFormFieldControl, useExisting: BbxInlineTableComboBoxComponent
    }
  ]
})
export class BbxInlineTableComboBoxComponent implements AfterViewInit, ControlValueAccessor, Validator {
  @Input() data$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  @Input() isWide: boolean = true;
  @Input() wrapperClass: string = 'mode-default';
  @Input() simpleMode: boolean = false;
  @Input() needErrorMsg: boolean = true;
  @Input() labelAboveField: boolean = false;
  @Input() needBlankOption: boolean = true;
  @Input() autoFillFirstAvailableValue: boolean = false;
  @Input() lastFormField: boolean = false;
  @Input() id: string = ''
  @Input() name: string = ''
  @Input() disabled: boolean = false

  @Input() blankOptionText: string = BlankComboBoxValue;

  @Input() isReadonly: boolean = false;

  comboBoxData: string[] = [];
  currentDataCount: number = 0;
  get defaultDataCount(): number { return this.comboBoxData.length; }
  filteredData$: Observable<string[]> = of([]);
  currentFilteredData: string[] = [];
  currentTypedData: string = ''

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  get cssClasses(): string {
    return this.labelAboveField ? "display-as-block" : "";
  }

  @ViewChild('input')
  public input: ElementRef | undefined

  touched: boolean = false

  // Value, callbacks...

  private onTouchedCallback: () => void = noop
  private onChangeCallback: (newValue: any) => void = noop

  private innerValue: any = ''

  get value(): any {
    return this.innerValue
  }
  set value(v: any) {
    //this.markAsTouched()
    if (v !== this.innerValue) {
      this.innerValue = v
      this.onChangeCallback(v)

      const tmp = this.filterData(v);
      this.currentTypedData = v ?? '';
      this.currentDataCount = tmp.length;
      this.filteredData$ = of(tmp);
    }
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

  constructor(private kbS: KeyboardNavigationService) {
    this.data$.subscribe({
      next: data => {
        this.comboBoxData = data;
      }
    })
  }

  ngAfterViewInit(): void {
    this.data$.subscribe({
      next: data => {
        this.comboBoxData = [this.blankOptionText].concat(data ?? []);
        this.filteredData$ = of(this.comboBoxData);
        this.currentFilteredData = this.comboBoxData;
        this.currentDataCount = this.comboBoxData.length;
        if (this.autoFillFirstAvailableValue && this.comboBoxData.length > 0) {
          this.writeValue(this.comboBoxData[0]);
          this.autoFillFirstAvailableValue = false;
        }
      }
    });
    // this.currentForm?.form.controls[this.formFieldName].valueChanges.subscribe({
    //   next: filterString => {
    //     const tmp = this.filterData(filterString);
    //     this.currentTypedData = filterString ?? '';
    //     this.currentDataCount = tmp.length;
    //     this.filteredData$ = of(tmp);
    //   }
    // });

    this.currentTypedData = this.value;
  }

  private filterData(value: string): string[] {
    if (value === undefined) {
      return this.comboBoxData;
    }
    const filterValue = value?.toLowerCase();
    return this.comboBoxData.filter(optionValue => optionValue === this.blankOptionText || optionValue.toLowerCase().includes(filterValue));
  }

  public select(event: FocusEvent): void {
    const input = event.currentTarget as HTMLInputElement

    input.selectionStart = 0
    input.selectionEnd = input.value.length
  }

  // Handling events

  proxyBlur(event: any) {
    this.id = event.target.id
    this.blur.emit(event)
  }

  proxyFocus(event: any) {
    this.id = event.target.id
    this.focus.emit(event)
  }

  proxyFocusOut(event: any) {
    this.id = event.target.id
    this.focusOut.emit(event)
  }

  proxyClick(event: any) {
    this.id = event.target.id
    this.click.emit(event)
  }

  // Misc functions

  markAsTouched() {
    if (!this.touched) {
      this.onTouchedCallback()
      this.touched = true
    }
  }

  writeValue(obj: any): void {
    this.value = obj
  }
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return null
  }
  registerOnValidatorChange?(fn: () => void): void {}

  // Combobox

  AutoCorrectSelectCaseInsensitive(event: Event, itemCount: number, possibleItems?: string[], typedValue?: string, preventEvent = false, lastFormField: boolean = false, formFieldName?: string): boolean {
    const ad = (event.target as any).getAttribute("aria-activedescendant");
    if (this.kbS.isEditModeActivated &&
      ad === null &&
      possibleItems !== undefined && typedValue !== undefined &&
      (!possibleItems.includes(typedValue) && typedValue !== BlankComboBoxValue)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      if (HelperFunctions.isEmptyOrSpaces(formFieldName)) {
        return false
      }

      const caseInsensitiveMatch = possibleItems.find(x => x.toLowerCase() === (event as any).target.value.trim().toLowerCase())
      if (!HelperFunctions.isEmptyOrSpaces(caseInsensitiveMatch)) {
        this.writeValue(caseInsensitiveMatch)
        return true
      } else {
        return false
      }
    }
    return true
  }

  HandleAutoCompleteSelect(event: any): void {
    if (event === "") {
      // Object.keys(this.form.controls).forEach((x: string) => {
      //   if (x !== key) {
      //     this.form.controls[x].setValue("");
      //   }
      // });
    } else {
      //this.FillFormAfterValueSelect(event, key);
      this.writeValue(event)
    }
    if (!this.kbS.isEditModeActivated) {
      //this.JumpToNextInput(event);
    }
  }

  HandleFormDropdownEnter(event: Event, itemCount: number, possibleItems?: string[], typedValue?: string, preventEvent = false, lastFormField: boolean = false, formFieldName?: string): void {
    setTimeout(() => {
      if (environment.inlineEditableTableNavigatableFormLog) {
        console.log("itemCount: " + itemCount, typedValue, event.target, (event.target as any).getAttribute("aria-activedescendant"));
      }

      const ad = (event.target as any).getAttribute("aria-activedescendant");
      if (this.kbS.isEditModeActivated &&
        ad === null &&
        possibleItems !== undefined && typedValue !== undefined &&
        (!possibleItems.includes(typedValue) && typedValue !== BlankComboBoxValue)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        if (HelperFunctions.isEmptyOrSpaces(formFieldName)) {
          return
        }

        const caseInsensitiveMatch = possibleItems.find(x => x.toLowerCase() === (event as any).target.value.trim().toLowerCase())
        if (!HelperFunctions.isEmptyOrSpaces(caseInsensitiveMatch)) {
          this.writeValue(caseInsensitiveMatch)
        } else {
          return;
        }
      }

      if (ad !== null && itemCount > 1) {
        this.kbS.toggleEdit();
      } else {
        if (!this.kbS.isEditModeActivated) {
          this.kbS.toggleEdit();
        } else {
          this.kbS.setEditMode(KeyboardModes.NAVIGATION);
          //this.JumpToNextInput(event);
        }
      }
    }, 0);
  }
}
