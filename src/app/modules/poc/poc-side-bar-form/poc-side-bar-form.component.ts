import { Component, Input, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject, map, Observable, of, startWith } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { FlatDesignNavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { PocType } from '../models/PocType';
import { PocService } from '../services/poc.service';

@Component({
  selector: 'app-poc-side-bar-form',
  templateUrl: './poc-side-bar-form.component.html',
  styleUrls: ['./poc-side-bar-form.component.scss']
})
export class PocSideBarFormComponent extends BaseSideBarFormComponent implements OnInit {
  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  TileCssClass = TileCssClass;

  pocTypes: PocType[] = [];
  filteredPocTypes$: Observable<PocType[]> | undefined = of([]);

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService,
    private seInv: PocService, private kbS: KeyboardNavigationService) {
      super();
      this.seInv.GetPocTypes().subscribe({
        next: data => {
          this.pocTypes = data.data!;
          this.filteredPocTypes$ = of(this.pocTypes);
        }
      });
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });

    this.filteredPocTypes$ = this.currentForm?.form.controls['pocType'].valueChanges
      .pipe(
        startWith(''),
        map(filterString => this.filter(filterString)),
      );
  }

  private SetNewForm(form?: FormSubject): void {
    console.log(form);
    if ((!!form && form[0] !== 'Poc') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug
  }

  private filter(value: string): PocType[] {
    const filterValue = value.toLowerCase();
    return this.pocTypes.filter(optionValue => optionValue.code.toLowerCase().includes(filterValue));
  }

}