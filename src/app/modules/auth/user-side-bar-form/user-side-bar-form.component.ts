import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { BehaviorSubject } from 'rxjs';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { StatusService } from 'src/app/services/status.service';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-user-side-bar-form',
  templateUrl: './user-side-bar-form.component.html',
  styleUrls: ['./user-side-bar-form.component.scss']
})
export class UserSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  override tag = 'User';

  // WareHouse
  wareHouses: string[] = []
  wareHousesData: WareHouse[] = []
  wareHouseComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  constructor(
      private sbf: SideBarFormService,
      private sb: NbSidebarService,
      kbS: KeyboardNavigationService,
      cdref: ChangeDetectorRef,
      private statusService: StatusService,
      private wareHouseApi: WareHouseService,
      private commonService: CommonService) {
    super(kbS, cdref);
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }
  async ngAfterViewInit(): Promise<void> {
    await this.refreshComboboxData()
    this.currentForm?.AfterViewInitSetup();
  }

  protected override SetupForms(): void {
    setTimeout(() => {
      this.currentForm?.GenerateAndSetNavMatrices(false, false);
    }, 200);
  }

  private async refreshComboboxData(): Promise<void> {
    try {
      this.statusService.waitForLoad()

      const warehouseData = await this.wareHouseApi.GetAllPromise()

      this.wareHousesData = warehouseData.data ?? []
      this.wareHouses = warehouseData?.data?.map(x => x.warehouseDescription) ?? []
      this.wareHouseComboData$.next(this.wareHouses)
    } catch (error) {
      this.commonService.HandleError(error)
    } finally {
      this.statusService.waitForLoad(false)
    }
  }
}
