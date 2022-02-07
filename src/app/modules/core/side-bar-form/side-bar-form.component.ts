import { Component, OnInit } from '@angular/core';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { Nav } from 'src/assets/model/Navigatable';

@Component({
  selector: 'app-side-bar-form',
  templateUrl: './side-bar-form.component.html',
  styleUrls: ['./side-bar-form.component.scss']
})
export class SideBarFormComponent implements OnInit {
  currentForm?: Nav.FlatDesignNavigatableForm;
  TileCssClass = Nav.TileCssClass;

  constructor(private sbf: SideBarFormService) { }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f)});
  }

  private SetNewForm(form?: Nav.FlatDesignNavigatableForm): void {
    this.currentForm = form;
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug
  }

}
