import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Nav } from 'src/assets/model/Navigatable';

export type FormSubject = [string, Nav.FlatDesignNavigatableForm | undefined] | undefined;

@Injectable({
  providedIn: 'root'
})
export class SideBarFormService {
  forms: BehaviorSubject<FormSubject>;

  constructor() {
    this.forms = new BehaviorSubject<FormSubject>(undefined);
  }

  public SetCurrentForm(form: FormSubject): void {
    this.forms.next(form);
  }

  public Clear(): void {
    this.forms.next(undefined);
  }
}
