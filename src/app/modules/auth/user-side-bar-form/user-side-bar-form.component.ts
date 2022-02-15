import { Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { Nav } from 'src/assets/model/Navigatable';

@Component({
  selector: 'app-user-side-bar-form',
  templateUrl: './user-side-bar-form.component.html',
  styleUrls: ['./user-side-bar-form.component.scss']
})
export class UserSideBarFormComponent implements OnInit {
  currentForm?: Nav.FlatDesignNavigatableForm;
  TileCssClass = Nav.TileCssClass;

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService) { }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }

  private SetNewForm(form?: FormSubject): void {
    if ((!!form && form[0] !== 'User') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug
  }
}
