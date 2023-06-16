import { Component, HostListener, OnInit } from '@angular/core';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private kbS: KeyboardNavigationService) { }

  ngOnInit(): void {
    this.kbS.ResetToRoot();
    this.kbS.SelectFirstTile();
  }
  
  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (KeyBindings.F12 === event.key) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
  }
}
