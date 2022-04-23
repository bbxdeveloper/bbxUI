import { Component, Input } from '@angular/core';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/FlatDesignNavigatableForm';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { ValidationMessage } from 'src/assets/util/ValidationMessages';

@Component({
  selector: 'app-form-control-error',
  templateUrl: './form-control-error.component.html',
  styleUrls: ['./form-control-error.component.scss']
})
export class FormControlErrorComponent {
  @Input() form?: FlatDesignNavigatableForm | InlineTableNavigatableForm;
  @Input() controlName?: string;
  @Input() min?: number;
  @Input() max?: number;
  @Input() validationParameterDate?: Date | undefined;
  @Input() validationParameterDateSecondary?: Date | undefined;
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
      case ValidationMessage.ErrorMinDate:
        return this.label ? `A ${this.label} mezőben megadott dátum kisebb a megengedett minimumnál!` : ValidationMessage.ErrorMax;
      case ValidationMessage.ErrorMaxDate:
        return this.label ? `A ${this.label} mezőben megadott dátum nagyobb a megengedett maximumnál!` : ValidationMessage.ErrorMax;
      case ValidationMessage.ErrorMinMaxDate:
        return this.label ? `A ${this.label} mezőben megadott dátum a megengedett intervallumon kívülre esik!` : ValidationMessage.ErrorMax;
      case ValidationMessage.ErrorTodaysDate:
        return this.label ? `A ${this.label} mezőben csak mai, vagy annál korábbi dátum adható meg!` : ValidationMessage.ErrorMax;
    }
  }

}
