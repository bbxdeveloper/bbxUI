import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';

@Component({
  selector: 'app-fkey-buttons-row',
  templateUrl: './fkey-buttons-row.component.html',
  styleUrls: ['./fkey-buttons-row.component.scss']
})
export class FKeyButtonsRowComponent implements OnInit {
  commands$: Observable<FooterCommandInfo[]>;

  constructor(
    private fS: FooterService,
    private kbS: KeyboardNavigationService) {
    this.commands$ = this.fS.commands;
  }

  ngOnInit(): void {
  }

}
