import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { NbSidebarService } from "@nebular/theme";
import { KeyboardNavigationService } from "src/app/services/keyboard-navigation.service";
import { SideBarFormService, FormSubject } from "src/app/services/side-bar-form.service";
import { FlatDesignNavigatableForm } from "src/assets/model/navigation/FlatDesignNavigatableForm";
import { TileCssClass } from "src/assets/model/navigation/Navigatable";
import { KeyBindings } from "src/assets/util/KeyBindings";
import { BaseSideBarFormComponent } from "../../shared/base-side-bar-form/base-side-bar-form.component";

@Component({
  selector: 'app-origin-side-bar-form',
  templateUrl: './origin-side-bar-form.component.html',
  styleUrls: ['./origin-side-bar-form.component.scss']
})
export class OriginSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  override tag = 'Origin';

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
}
