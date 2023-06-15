import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/Nav';
import { LoggerService } from './logger.service';

export interface FormSubjectData {
  form?: FlatDesignNavigatableForm,
  readonly?: boolean
}
export type FormSubject = [string, FormSubjectData | undefined] | undefined;

@Injectable({
  providedIn: 'root'
})
export class SideBarFormService {
  forms: BehaviorSubject<FormSubject>;

  constructor(private readonly loggerService: LoggerService) {
    this.forms = new BehaviorSubject<FormSubject>(undefined);
  }

  public SetCurrentForm(form: FormSubject): void {
    if (form) {
      this.loggerService.info(`Called SetCurrentForm, tag: ${form[0]}, readonly: ${form[1]?.readonly}`)
    } else {
      this.loggerService.info(`Called SetCurrentForm, parameter is undefined`)
    }
    this.forms.next(form);
  }

  public Clear(): void {
    this.forms.next(undefined);
  }
}
