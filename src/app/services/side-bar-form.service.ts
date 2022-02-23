import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/Nav';

export type FormSubject = [string, FlatDesignNavigatableForm | undefined] | undefined;

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
