import { AfterViewInit, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/FlatDesignNavigatableForm';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Navigatable';
import { CustomerMisc } from '../../customer/models/CustomerMisc';

@Component({
  selector: 'app-customer-bank-account-number-input',
  templateUrl: './customer-bank-account-number-input.component.html',
  styleUrls: ['./customer-bank-account-number-input.component.scss']
})
export class CustomerBankAccountNumberInputComponent implements OnInit, AfterViewInit {
  @Input() currentForm?: FlatDesignNavigatableForm | FlatDesignNoTableNavigatableForm
  @Input() formFieldName: string = ''
  @Input() label: string = ''
  @Input() readonlyMode: boolean = false
  @Input() onFormUpdate: BehaviorSubject<FormGroup | undefined> = new BehaviorSubject<FormGroup | undefined>(undefined);

  get isReadonly() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT || this.readonlyMode
  }

  bankAccountMask: BehaviorSubject<any> = new BehaviorSubject<any>(CustomerMisc.DefaultPattern)

  TileCssClass = TileCssClass
  TileCssColClass = TileCssColClass

  get formValueFormCustomerBankAccNm(): string {
    const tmp = this.currentForm!.GetValue(this.formFieldName) as string
    return tmp ?? ''
  }

  constructor(private kbS: KeyboardNavigationService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.onFormUpdate.subscribe({
      next: f => {
        if (f) {
          const val = f.controls[this.formFieldName].value;
          const currentTypeBankAccountNumber = val !== undefined && val !== null ? val : ""
          const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber)
          const nextMask = isIbanStarted ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern
          this.bankAccountMask.next(nextMask)
        }
      }
    });
    this.currentForm?.form.controls[this.formFieldName].valueChanges.subscribe({
      next: val => {
        const currentTypeBankAccountNumber = val !== undefined && val !== null ? val : ""
        const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber)
        const nextMask = isIbanStarted ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern
        this.bankAccountMask.next(nextMask)
      }
    });
  }

  private checkIfIbanStarted(typedVal: string): boolean {
    var val = (typedVal ?? '').replace(/\s/g, '')
    // Azért [a-zA-Z]{1,3} [a-zA-Z]{1,2} helyett és [0-9]{0,23} a [0-9]{0,22}, mivel itt még nem jutott el a maszk ellenőrzéséig a begépelt érték
    // itt viszont számítani kell még rá.
    return CustomerMisc.IbanRegex.test(val)
  }

  checkBankAccountKeydownValue(event: any): void {
    if (event.key.length > 1) {
      return
    }

    var typed = this.formValueFormCustomerBankAccNm.concat(event.key)

    let currentMask = this.bankAccountMask.getValue();
    if (currentMask && typed.replace(/\s/g, '').length > currentMask.replace(/\s/g, '').length) {
      event.stopImmediatePropagation()
      event.preventDefault()
      event.stopPropagation()
      return
    }

    var nextMask = CustomerMisc.DefaultPattern

    if (this.checkIfIbanStarted(typed)) {      
      nextMask = CustomerMisc.IbanPattern
    }

    this.bankAccountMask.next(nextMask)
  }
}
