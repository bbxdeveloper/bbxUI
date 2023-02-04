import { AfterViewInit, Component, OnInit } from "@angular/core";
import { NbSidebarService } from "@nebular/theme";
import { KeyboardNavigationService } from "src/app/services/keyboard-navigation.service";
import { SideBarFormService, FormSubject } from "src/app/services/side-bar-form.service";
import { FlatDesignNavigatableForm } from "src/assets/model/navigation/FlatDesignNavigatableForm";
import { TileCssClass } from "src/assets/model/navigation/Navigatable";
import { KeyBindings } from "src/assets/util/KeyBindings";
import { BaseSideBarFormComponent } from "../../shared/base-side-bar-form/base-side-bar-form.component";

@Component({
  selector: 'app-location-side-bar-form',
  templateUrl: './location-side-bar-form.component.html',
  styleUrls: ['./location-side-bar-form.component.scss']
})
export class LocationSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
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
    if ((!!form && form[0] !== 'Location') || !!!form || form[1] === undefined) {
      return;
    }
    
    this.readonlyMode = form[1].readonly ?? false;

    if (form[1].form === undefined) {
      return;
    }

    this.currentForm = form[1].form;
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug
  }
}
