import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { Observable, of } from 'rxjs';
import { createMask } from '@ngneat/input-mask';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BlankComboBoxValue, FlatDesignNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { CrudManagerKeySettings, Actions, KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-bbx-combo-box',
  templateUrl: './bbx-combo-box.component.html',
  styleUrls: ['./bbx-combo-box.component.scss']
})
export class BbxComboBoxComponent implements OnInit, AfterViewInit {
  @Input() currentForm?: FlatDesignNavigatableForm;
  @Input() formFieldName: string = '';
  @Input() label: string = '';
  @Input() getData: () => string[] = () => [];
  @Input() data$: Observable<string[]> = of([]);

  blankOptionText: string = BlankComboBoxValue;

  comboBoxData: string[] = [];
  currentDataCount: number = 0;
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
    this.currentForm?.form.controls[this.formFieldName].valueChanges.subscribe({
      next: filterString => {
        const tmp = this.filterData(filterString);
        this.currentTypedData = filterString ?? '';
        this.currentDataCount = tmp.length;
        this.filteredData$ = of(tmp);
      }
    });
  }

  private filterData(value: string): string[] {
    if (value === undefined) {
      return this.comboBoxData;
    }
    const filterValue = value.toLowerCase();
    return this.comboBoxData.filter(optionValue => optionValue === this.blankOptionText || optionValue.toLowerCase().includes(filterValue));
  }

}
