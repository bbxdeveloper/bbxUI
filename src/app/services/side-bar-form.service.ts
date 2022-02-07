import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Nav } from 'src/assets/model/Navigatable';

@Injectable({
  providedIn: 'root'
})
export class SideBarFormService {
  forms: BehaviorSubject<Nav.FlatDesignNavigatableForm | undefined>;

  constructor() {
    this.forms = new BehaviorSubject<Nav.FlatDesignNavigatableForm | undefined>(undefined);
  }

  public SetCurrentForm(form: Nav.FlatDesignNavigatableForm): void {
    this.forms.next(form);
  }

  public Clear(): void {
    this.forms.next(undefined);
  }
}
