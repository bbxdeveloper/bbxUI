import { Component, HostListener, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { Nav } from 'src/assets/model/Navigatable';
import { KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-side-bar-form',
  templateUrl: './side-bar-form.component.html',
  styleUrls: ['./side-bar-form.component.scss']
})
export class SideBarFormComponent implements OnInit {
  currentForm?: Nav.FlatDesignNavigatableForm;
  TileCssClass = Nav.TileCssClass;

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService) { }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f)});
  }

  // private SetNewForm(form?: Nav.FlatDesignNavigatableForm): void {
  //   this.currentForm = form;
  //   console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug
  // }

  private SetNewForm(form?: FormSubject): void {
    if ((!!form && form[0] !== 'User') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug
  }

  // @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
  //   if (event.code === 'Tab') {
  //     event.preventDefault();
  //   }
  //   switch (event.key) {
  //     case KeyBindings.F8: {
  //       if (!!this.currentForm) {
  //         event.preventDefault();
  //         event.stopPropagation();
  //         this.currentForm.ActionNew();
  //       }
  //       break;
  //     }
  //     case KeyBindings.F9: {
  //       if (!!this.currentForm) {
  //         event.preventDefault();
  //         event.stopPropagation();
  //         this.currentForm.ActionReset();
  //       }
  //       break;
  //     }
  //     case KeyBindings.F10: {
  //       if (!!this.currentForm) {
  //         event.preventDefault();
  //         event.stopPropagation();
  //         this.currentForm.ActionPut();
  //       }
  //       break;
  //     }
  //     case KeyBindings.F11: {
  //       if (!!this.currentForm) {
  //         event.preventDefault();
  //         event.stopPropagation();
  //         this.currentForm.ActionDelete();
  //       }
  //       break;
  //     }
  //     case KeyBindings.F12: {
  //       if (!!this.currentForm) {
  //         event.preventDefault();
  //       }
  //       break;
  //     }
  //     default: { }
  //   }
  // }

  close(): void {
    this.sb.collapse();
  }

}
