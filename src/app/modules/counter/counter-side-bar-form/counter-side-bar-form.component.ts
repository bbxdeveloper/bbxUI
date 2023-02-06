import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { createMask } from '@ngneat/input-mask';
import { BehaviorSubject, Observable, of } from 'rxjs';
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
  override tag = 'Counter';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  customPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  // WareHouse
  wareHouses: string[] = [];
  wareHouseComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private sbf: SideBarFormService, kbS: KeyboardNavigationService,
    private wareHouseApi: WareHouseService,
    cdref: ChangeDetectorRef) {
    super(kbS, cdref);
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
        this.wareHouses = data?.data?.map(x => x.warehouseDescription) ?? [];
        this.wareHouseComboData$.next(this.wareHouses);
      }
    });
  }
}