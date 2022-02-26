import { Component, OnInit } from "@angular/core";
import { NbSidebarService } from "@nebular/theme";
import { SideBarFormService, FormSubject } from "src/app/services/side-bar-form.service";
import { FlatDesignNavigatableForm } from "src/assets/model/navigation/FlatDesignNavigatableForm";
import { TileCssClass } from "src/assets/model/navigation/Navigatable";
import { KeyBindings } from "src/assets/util/KeyBindings";

@Component({
  selector: 'app-product-group-side-bar-form',
  templateUrl: './product-group-side-bar-form.component.html',
  styleUrls: ['./product-group-side-bar-form.component.scss']
})
export class ProductGroupSideBarFormComponent implements OnInit {
  currentForm?: FlatDesignNavigatableForm;
  TileCssClass = TileCssClass;

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService) { }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }

  private SetNewForm(form?: FormSubject): void {
    if ((!!form && form[0] !== 'ProductGroup') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug
  }
}
