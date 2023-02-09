import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { Constants } from 'src/assets/util/Constants';
import { InventoryPeriodsKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { WareHouseService } from '../../warehouse/services/ware-house.service';

@Component({
  selector: 'app-inv-ctrl-period-side-bar-form',
  templateUrl: './inv-ctrl-period-side-bar-form.component.html',
  styleUrls: ['./inv-ctrl-period-side-bar-form.component.scss']
})
export class InvCtrlPeriodSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  override tag = 'InvCtrlPeriod';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  // Origin
  wareHouses: string[] = [];
  wareHouseComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService, kbS: KeyboardNavigationService, private wService: WareHouseService,
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

  public override readonly KeySetting: Constants.KeySettingsDct = InventoryPeriodsKeySettings;

  private refreshComboboxData(): void {
    // CountryCodes
    this.wService.GetAll().subscribe({
      next: data => {
        this.wareHouses = data?.data?.map(x => x.warehouseDescription) ?? [];
        this.wareHouseComboData$.next(this.wareHouses);
      }
    });
  }
}