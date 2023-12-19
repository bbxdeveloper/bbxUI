import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseSideBarFormComponent } from 'src/app/modules/shared/base-side-bar-form/base-side-bar-form.component';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { Constants } from 'src/assets/util/Constants';
import { KeyBindings, EqualizationNavigationManagerComponentKeySettings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-equalization-navigation-side-bar-form',
  templateUrl: './equalization-navigation-side-bar-form.component.html',
  styleUrls: ['./equalization-navigation-side-bar-form.component.scss']
})
export class EqualizationNavigationSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  override tag = 'EqualizationNavigationManagerComponent';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  public override KeySetting: Constants.KeySettingsDct = EqualizationNavigationManagerComponentKeySettings;

  customPatterns = Constants.ProductCodePatterns;

  constructor(private sbf: SideBarFormService, kbS: KeyboardNavigationService,
    cdref: ChangeDetectorRef, private cs: CommonService) {
    super(kbS, cdref);
  }

  moveCursor(codeInput: any): void {
    setTimeout(function () {
      codeInput.setSelectionRange(0, 0);
    }, 100);
  }

  async ngOnInit(): Promise<void> {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }
  ngAfterViewInit(): void {
    this.currentForm?.AfterViewInitSetup();
  }

  SetCursorPose(event: any): void {
    setTimeout(() => {
      console.log("SetCursorPose: ", event.target.value);
      event.target.setSelectionRange(0, 0);
    }, 50);
  }
}