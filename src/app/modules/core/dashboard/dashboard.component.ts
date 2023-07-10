import { Component, HostListener, OnInit } from '@angular/core';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { Constants } from 'src/assets/util/Constants';
import { DashboardKeySettings, GetFooterCommandListFromKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  KeySetting: Constants.KeySettingsDct = DashboardKeySettings;
  commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting)

  constructor(private kbS: KeyboardNavigationService, private readonly footerService: FooterService) { }

  ngOnInit(): void {
    this.kbS.ResetToRoot()
    this.kbS.SelectFirstTile()
    this.footerService.pushCommands(this.commands)
  }
  
  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (KeyBindings.F12 === event.key) {
      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()
      return
    }
  }
}
