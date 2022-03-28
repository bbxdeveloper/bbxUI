import { Component, OnInit } from '@angular/core';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';

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

}
