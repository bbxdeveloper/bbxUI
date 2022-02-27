import { Component, Input, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { FlatDesignNavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { PocType } from '../models/PocType';
import { PocService } from '../services/poc.service';

@Component({
  selector: 'app-poc-side-bar-form',
  templateUrl: './poc-side-bar-form.component.html',
  styleUrls: ['./poc-side-bar-form.component.scss']
})
export class PocSideBarFormComponent implements OnInit {
  currentForm?: FlatDesignNavigatableForm;

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  TileCssClass = TileCssClass;

  pocTypes$: Observable<PocType[]> = of([]);

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService,
    private seInv: PocService, private kbS: KeyboardNavigationService) {
      this.seInv.GetPocTypes().subscribe({
        next: data => {
          this.pocTypes$ = of(data.data!);
        }
      });
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }

  private SetNewForm(form?: FormSubject): void {
    console.log(form);
    if ((!!form && form[0] !== 'Poc') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug
  }

}