import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseSideBarFormComponent } from '../../../shared/base-side-bar-form/base-side-bar-form.component';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';

@Component({
  selector: 'app-nav-sent-data-sidebar-form',
  templateUrl: './nav-sent-data-sidebar-form.component.html',
  styleUrls: ['./nav-sent-data-sidebar-form.component.scss']
})
export class NavSentDataSidebarFormComponent extends BaseSideBarFormComponent implements OnInit {
  override tag = 'nav-data'

  constructor(
    keyboardService: KeyboardNavigationService,
    cdref: ChangeDetectorRef,
    private readonly sidebarFormService: SideBarFormService,
  ) {
    super(keyboardService, cdref)
  }

  ngOnInit(): void {
    this.sidebarFormService.forms.subscribe(form => {
      return this.SetNewForm(form);
    })
  }

}
