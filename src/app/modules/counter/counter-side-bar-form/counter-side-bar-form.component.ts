import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { TileCssClass } from 'src/assets/model/navigation/Nav';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { WareHouseService } from '../../warehouse/services/ware-house.service';

@Component({
  selector: 'app-counter-side-bar-form',
  templateUrl: './counter-side-bar-form.component.html',
  styleUrls: ['./counter-side-bar-form.component.scss']
})
export class CounterSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  customPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  // WareHouse
  wareHouses: string[] = [];
  currentWareHouseCount: number = 0;
  filteredWareHouses$: Observable<string[]> = of([]);

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  constructor(private sbf: SideBarFormService, private kbS: KeyboardNavigationService,
    private wareHouseApi: WareHouseService, private cdref: ChangeDetectorRef) {
    super();
    this.refreshComboboxData();
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }
  ngAfterViewInit(): void {
    this.currentForm?.AfterViewInitSetup();
  }

  private refreshComboboxData(): void {
    // WareHouse
    this.wareHouseApi.GetAll().subscribe({
      next: data => {
        this.wareHouses = data?.data?.map(x => x.warehouseCode + '-' + x.warehouseDescription) ?? [];
        this.filteredWareHouses$ = of(this.wareHouses);
        this.currentWareHouseCount = this.wareHouses.length;
      }
    });
  }

  private SetNewForm(form?: FormSubject): void {
    console.log(form);
    if ((!!form && form[0] !== 'Counter') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug

    this.cdref.detectChanges();

    this.currentForm?.form.controls['warehouse'].valueChanges.subscribe({
      next: filterString => {
        const tmp = this.filterCounterGroup(filterString);
        this.currentWareHouseCount = tmp.length;
        this.filteredWareHouses$ = of(tmp);
      }
    });
  }

  private filterCounterGroup(value: string): string[] {
    if (value === undefined) {
      return this.wareHouses;
    }
    const filterValue = value.toLowerCase();
    return this.wareHouses.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
  }
}