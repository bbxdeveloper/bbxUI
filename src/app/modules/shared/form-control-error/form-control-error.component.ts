import { Component, Input } from '@angular/core';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/FlatDesignNavigatableForm';
import { ValidationMessage } from 'src/assets/util/ValidationMessages';

@Component({
  selector: 'app-form-control-error',
  templateUrl: './form-control-error.component.html',
  styleUrls: ['./form-control-error.component.scss']
})
export class FormControlErrorComponent {
  @Input() form?: FlatDesignNavigatableForm;
  @Input() controlName?: string;

  public get ValidationMessage(): typeof ValidationMessage {
    return ValidationMessage;
  }

  constructor() { }

}
