import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';

@Component({
  selector: 'app-user-side-bar-form',
  templateUrl: './user-side-bar-form.component.html',
  styleUrls: ['./user-side-bar-form.component.scss']
})
export class UserSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  override tag = 'User';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService, kbS: KeyboardNavigationService,
    cdref: ChangeDetectorRef) {
    super(kbS, cdref);
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }
  ngAfterViewInit(): void {
    this.currentForm?.AfterViewInitSetup();
  }

  protected override SetupForms(): void {
    setTimeout(() => {
      this.currentForm?.GenerateAndSetNavMatrices(false, false);
    }, 200);
  }
}
