import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BlankComboBoxValue, FlatDesignNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';

@Component({
  selector: 'app-bbx-two-row-combo-box',
  templateUrl: './bbx-two-row-combo-box.component.html',
  styleUrls: ['./bbx-two-row-combo-box.component.scss']
})
export class BbxTwoRowComboBoxComponent implements OnInit, AfterViewInit {
  @Input() currentForm?: FlatDesignNavigatableForm | FlatDesignNoTableNavigatableForm;
  @Input() formFieldName: string = '';
  @Input() label: string = '';
  @Input() getData: () => string[] = () => [];
  @Input() data$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  @Input() isWide: boolean = true;
  @Input() needBlankOption: boolean = true;
  @Input() autoFillFirstAvailableValue: boolean = false;

  blankOptionText: string = BlankComboBoxValue;

  comboBoxData: string[] = [];
  currentDataCount: number = 0;
  filteredData$: Observable<string[]> = of([]);
  currentFilteredData: string[] = [];
  currentTypedData: string = '';

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
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
