import { Component, Input } from '@angular/core';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/FlatDesignNavigatableForm';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { InlineTableNavigatableForm } from 'src/assets/model/navigation/InlineTableNavigatableForm';
import { ValidationMessage } from 'src/assets/util/ValidationMessages';

@Component({
  selector: 'app-form-control-error',
  templateUrl: './form-control-error.component.html',
  styleUrls: ['./form-control-error.component.scss']
})
export class FormControlErrorComponent {
  @Input() form?: FlatDesignNavigatableForm | InlineTableNavigatableForm | FlatDesignNoTableNavigatableForm;
  @Input() controlName?: string;
  @Input() min?: number;
  @Input() max?: number;
  @Input() validationParameterDate?: Date | undefined;
  @Input() validationParameterDateSecondary?: Date | undefined;
  @Input() label?: string;

  @Input() formGroupMode: boolean = false;
  @Input() formGroupMessage: string = "";

  public get ValidationMessage(): typeof ValidationMessage {
    return ValidationMessage;
  }

  constructor() { }

  public GetErrorMessage(vm: ValidationMessage): string {
    switch(vm) {
      case ValidationMessage.ErrorRequired:
        return this.label ? `A ${this.label} kitöltése kötelező!` : ValidationMessage.ErrorRequired;
      case ValidationMessage.ErrorMin:
        return this.label ? `A ${this.label} értéke kisebb a minimumnál (${this.min})!` : ValidationMessage.ErrorMin;
      case ValidationMessage.ErrorMax:
        return this.label ? `A ${this.label} értéke nagyobb a maximumnál (${this.max})!` : ValidationMessage.ErrorMax;
      case ValidationMessage.ErrorMinDate:
        return this.label ? `A ${this.label} értéke kisebb a minimumnál!` : ValidationMessage.ErrorMinDate;
      case ValidationMessage.ErrorMaxDate:
        return this.label ? `A ${this.label} értéke nagyobb a maximumnál!` : ValidationMessage.ErrorMaxDate;
      case ValidationMessage.ErrorMinMaxDate:
        return this.label ? `A ${this.label} értékhatárokon kívülre esik!` : ValidationMessage.ErrorMinMaxDate;
      case ValidationMessage.ErrorTodaysDate:
        return this.label ? `A ${this.label} legfeljebb mai dátum lehet!` : ValidationMessage.ErrorTodaysDate;
      case ValidationMessage.ErrorValidDate:
        return this.label ? `A ${this.label} értéke érvénytelen dátum!` : ValidationMessage.ErrorValidDate;
      case ValidationMessage.ErrorWrongDate:
        return this.label ? `A ${this.label} értéke helytelen!` : ValidationMessage.ErrorWrongDate;
      case ValidationMessage.ErrorZero:
        return this.label ? `A ${this.label} értéke nem lehet nulla!` : ValidationMessage.ErrorZero;
      case ValidationMessage.ErrorMinLength:
        return this.label ? `A ${this.label} értéke túl rövid (min ${this.min})!` : ValidationMessage.ErrorMinLength;
      case ValidationMessage.ErrorMaxLength:
        return this.label ? `A ${this.label} értéke túl hosszú (max ${this.max})!` : ValidationMessage.ErrorMaxLength;
      case ValidationMessage.ErrorInvalidSelectedValue:
        return this.label ? `A ${this.label} választott értéke érvénytelen!` : ValidationMessage.ErrorInvalidSelectedValue;
    }
  }

}
