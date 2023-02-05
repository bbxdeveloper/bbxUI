import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { FlatDesignNavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';

@Component({
  selector: 'app-user-side-bar-form',
  templateUrl: './user-side-bar-form.component.html',
  styleUrls: ['./user-side-bar-form.component.scss']
})
export class UserSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService, kbS: KeyboardNavigationService) {
    super(kbS);
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }
  ngAfterViewInit(): void {
    this.currentForm?.AfterViewInitSetup();
  }

  private SetNewForm(form?: FormSubject): void {
    if ((!!form && form[0] !== 'User') || !!!form || form[1] === undefined) {
      return;
    }
    
    this.readonlyMode = form[1].readonly ?? false;

    if (form[1].form === undefined) {
      return;
    }

    this.currentForm = form[1].form;
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug

    setTimeout(() => {
      this.currentForm?.GenerateAndSetNavMatrices(false, false);
    }, 200);
  }
}
