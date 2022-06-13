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

  blankOptionText: string = BlankComboBoxValue;

  comboBoxData: string[] = [];
  currentDataCount: number = 0;
  get defaultDataCount(): number { return this.comboBoxData.length; }
  filteredData$: Observable<string[]> = of([]);
  currentFilteredData: string[] = [];
  currentTypedData: string = '';

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
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
        this.comboBoxData = [this.blankOptionText].concat(data ?? []);
        this.filteredData$ = of(this.comboBoxData);
        this.currentFilteredData = this.comboBoxData;
        this.currentDataCount = this.comboBoxData.length;
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
    return this.comboBoxData.filter(optionValue => optionValue === this.blankOptionText || optionValue.toLowerCase().includes(filterValue));
  }

}
