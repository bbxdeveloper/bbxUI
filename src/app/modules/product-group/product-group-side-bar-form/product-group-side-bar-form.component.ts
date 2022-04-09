import { AfterViewInit, Component, OnInit } from "@angular/core";
import { NbSidebarService } from "@nebular/theme";
import { KeyboardModes, KeyboardNavigationService } from "src/app/services/keyboard-navigation.service";
import { SideBarFormService, FormSubject } from "src/app/services/side-bar-form.service";
import { FlatDesignNavigatableForm } from "src/assets/model/navigation/FlatDesignNavigatableForm";
import { TileCssClass } from "src/assets/model/navigation/Navigatable";
import { Constants } from "src/assets/util/Constants";
import { KeyBindings } from "src/assets/util/KeyBindings";
import { BaseSideBarFormComponent } from "../../shared/base-side-bar-form/base-side-bar-form.component";

@Component({
  selector: 'app-product-group-side-bar-form',
  templateUrl: './product-group-side-bar-form.component.html',
  styleUrls: ['./product-group-side-bar-form.component.scss']
})
export class ProductGroupSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
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
    if ((!!form && form[0] !== 'ProductGroup') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug
  }
}
