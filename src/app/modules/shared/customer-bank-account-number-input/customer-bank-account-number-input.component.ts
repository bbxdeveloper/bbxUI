import { AfterViewInit, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/FlatDesignNavigatableForm';
import { TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Navigatable';
import { CustomerMisc } from '../../customer/models/CustomerMisc';

@Component({
  selector: 'app-customer-bank-account-number-input',
  templateUrl: './customer-bank-account-number-input.component.html',
  styleUrls: ['./customer-bank-account-number-input.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomerBankAccountNumberInputComponent implements OnInit, AfterViewInit {
  @Input() currentForm?: FlatDesignNavigatableForm;
  @Input() formFieldName: string = '';
  @Input() label: string = '';
  @Input() readonlyMode: boolean = false;

  get isReadonly() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT || this.readonlyMode;
  }

  bankAccountMask: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  get formValueFormCustomerBankAccNm(): string {
    const tmp = this.currentForm!.GetValue(this.formFieldName) as string;
    return tmp !== undefined ? tmp : '';
  }

  constructor(private kbS: KeyboardNavigationService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.currentForm?.form.controls[this.formFieldName].valueChanges.subscribe({
      next: val => {
        const currentTypeBankAccountNumber = val !== undefined && val !== null ? val : "";
        const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
        if (currentTypeBankAccountNumber.length > 1) {
          return;
        }
        const nextMask = isIbanStarted ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern;
        this.bankAccountMask.next(nextMask);
      }
    });
  }

  private checkIfIbanStarted(typedVal: string): boolean {
    return typedVal !== undefined && typedVal !== null && typedVal.length > 0 && (typedVal.charAt(0) <= '0' || typedVal.charAt(0) >= '9');
  }

  GetBankAccountMask(): string {
    const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm;
    const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
    return isIbanStarted ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern;
  }

  checkBankAccountKeydownValue(event: any): void {
    if (event.key.length === 1) {
      const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm.concat(event.key);

      console.log('[checkBankAccountKeydownValue] ', this.currentForm!.GetValue(this.formFieldName), event.key, currentTypeBankAccountNumber, currentTypeBankAccountNumber.length);

      const nextMask = this.checkIfIbanStarted(currentTypeBankAccountNumber) ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern;
      console.log("Check: ", currentTypeBankAccountNumber.length, nextMask.length, nextMask);
      if (currentTypeBankAccountNumber.length > nextMask.length) {
        event.stopImmediatePropagation();
        event.preventDefault();
        event.stopPropagation();
      }

      if (currentTypeBankAccountNumber.length > 1) {
        return;
      }
      const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);

      console.log(isIbanStarted, currentTypeBankAccountNumber.length > 0, currentTypeBankAccountNumber.charAt(0) <= '0', currentTypeBankAccountNumber.charAt(0) >= '9');
      this.bankAccountMask.next(isIbanStarted ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern);
    } else {
      const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm.concat(event.key);

      console.log('[checkBankAccountKeydownValue] ', this.currentForm!.GetValue(this.formFieldName), event.key, currentTypeBankAccountNumber, currentTypeBankAccountNumber.length);

      if (currentTypeBankAccountNumber.length > 1) {
        return;
      }
      const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);

      console.log(isIbanStarted, currentTypeBankAccountNumber.length > 0, currentTypeBankAccountNumber.charAt(0) <= '0', currentTypeBankAccountNumber.charAt(0) >= '9');
      this.bankAccountMask.next(isIbanStarted ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern);
    }
  }

}
