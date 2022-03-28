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
  @Input() min?: number;
  @Input() max?: number;
  @Input() label?: string;

  public get ValidationMessage(): typeof ValidationMessage {
    return ValidationMessage;
  }

  constructor() { }

  public GetErrorMessage(vm: ValidationMessage): string {
    switch(vm) {
      case ValidationMessage.ErrorRequired:
        return this.label ? `A ${this.label} mező kitöltése kötelező!` : ValidationMessage.ErrorRequired;
      case ValidationMessage.ErrorMin:
        return this.label ? `A ${this.label} mező értéke kisebb a megengedett minimumnál (${this.min})!` : ValidationMessage.ErrorMin;
      case ValidationMessage.ErrorMax:
        return this.label ? `A ${this.label} mező értéke nagyobb a megengedett maximumnál (${this.min})!` : ValidationMessage.ErrorMax;
    }
  }

}
