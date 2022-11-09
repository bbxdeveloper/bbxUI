import { Component, OnInit, forwardRef, Input, HostListener, Output, EventEmitter } from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR
} from "@angular/forms";

@Component({
  selector: 'app-bbx-char-checkbox',
  templateUrl: './bbx-char-checkbox.component.html',
  styleUrls: ['./bbx-char-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BbxCharCheckboxComponent),
      multi: true
    }
  ]
})
export class BbxCharCheckboxComponent implements ControlValueAccessor, OnInit {
  @Input() charChecked: string | number = "";
  @Input() charUnChecked: string | number = "";

  @Input() textAlign: string = "center";
  @Input() autoComplete: string = "off";

  @Output() blur: EventEmitter<any> = new EventEmitter();
  @Output() focus: EventEmitter<any> = new EventEmitter();

  checked: boolean = false;

  onChange: any = () => { };
  onTouch: any = () => { };

  constructor() { }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  ngOnInit() { }

  writeValue(checked: boolean) {
    this.checked = checked;
  }

  onModelChange(e: boolean) {
    this.checked = e;
    this.onChange(e);
  }

  onBlur(event: any): void {
    this.blur.emit(event);
  }

  onFocus(event: any): void {
    this.focus.emit(event);
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (event.code === "Space") {
     this.onModelChange(!this.checked);
    }
  }
}
