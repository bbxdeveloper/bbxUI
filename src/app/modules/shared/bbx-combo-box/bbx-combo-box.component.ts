import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BlankComboBoxValue, FlatDesignNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';

@Component({
  selector: 'app-bbx-combo-box',
  templateUrl: './bbx-combo-box.component.html',
  styleUrls: ['./bbx-combo-box.component.scss']
})
export class BbxComboBoxComponent implements OnInit, AfterViewInit {
  @Input() currentForm?: FlatDesignNavigatableForm | FlatDesignNoTableNavigatableForm | InlineTableNavigatableForm;
  @Input() formFieldName: string = '';
  @Input() label: string = '';
  @Input() getData: () => string[] = () => [];
  @Input() data$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  @Input() isWide: boolean = true;
  @Input() wrapperClass: string = 'mode-default';
  @Input() simpleMode: boolean = false;
  @Input() needErrorMsg: boolean = true;
  @Input() labelAboveField: boolean = false;
  @Input() needBlankOption: boolean = true;
  @Input() autoFillFirstAvailableValue: boolean = false;
  @Input() lastFormField: boolean = false;

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
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  get cssClasses(): string {
    return this.labelAboveField ? "display-as-block" : "";
  }

  constructor(private kbS: KeyboardNavigationService) {
    this.data$.subscribe({
      next: data => {
        this.comboBoxData = data;
      }
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.data$.subscribe({
      next: data => {
        console.log('[BbxComboBox data$.subscribe next]: ', data);
        if (this.needBlankOption) {
            this.comboBoxData = [this.blankOptionText].concat(data ?? []);
        } else {
            this.comboBoxData = data ?? [];
        }
        this.filteredData$ = of(this.comboBoxData);
        this.currentFilteredData = this.comboBoxData;
        this.currentDataCount = this.comboBoxData.length;
        if (this.autoFillFirstAvailableValue && this.comboBoxData.length > 0) {
          this.currentForm?.form.controls[this.formFieldName].setValue(this.comboBoxData[0]);
          this.autoFillFirstAvailableValue = false;
        }
      }
    });

    console.log('[BbxComboBox afterviewinit]: ', this.currentForm);

    this.currentForm?.form.controls[this.formFieldName].valueChanges.subscribe({
      next: filterString => {
        const tmp = this.filterData(filterString);
        this.currentTypedData = filterString ?? '';
        this.currentDataCount = tmp.length;
        this.filteredData$ = of(tmp);
      }
    });

    this.currentTypedData = this.currentForm?.form.controls[this.formFieldName].value ?? '';
  }

  private filterData(value: string): string[] {
    if (value === undefined) {
      return this.comboBoxData;
    }
    const filterValue = value.toLowerCase();
    if (this.needBlankOption) {
      return this.comboBoxData.filter(optionValue => optionValue === this.blankOptionText || optionValue.toLowerCase().includes(filterValue));
    } else {
      return this.comboBoxData.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
    }
  }

}
