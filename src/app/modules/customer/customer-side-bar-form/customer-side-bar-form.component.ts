import { Component, Input, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { FlatDesignNavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';

const ibanPattern: string = 'SS00 0000 0000 0000 0000 0000 0000';
const defaultPattern: string = '00000000-00000000-00000000';

@Component({
  selector: 'app-customer-side-bar-form',
  templateUrl: './customer-side-bar-form.component.html',
  styleUrls: ['./customer-side-bar-form.component.scss']
})
export class CustomerSideBarFormComponent implements OnInit {
  // TODO: @Input() ?
  currentForm?: FlatDesignNavigatableForm;

  TileCssClass = TileCssClass;

  bankAccountMask: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get privatePersonDefaultValue(): Boolean {
    return (this.currentForm?.GetValue('taxpayerNumber') === undefined || this.currentForm.GetValue('taxpayerNumber') === '') &&
      (this.currentForm?.GetValue('thirdStateTaxId') === undefined || this.currentForm.GetValue('thirdStateTaxId') === '');
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService) { }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }

  private SetNewForm(form?: FormSubject): void {
    console.log(form);
    if ((!!form && form[0] !== 'Customer') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug

    if (!!this.currentForm) {
      this.currentForm.form.controls['privatePerson'].setValue(this.privatePersonDefaultValue);

      this.currentForm.form.controls['customerBankAccountNumber'].valueChanges.subscribe({
        next: val => {
          const currentTypeBankAccountNumber = val;
          const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
          if (currentTypeBankAccountNumber.length > 1) {
            return;
          }
          this.bankAccountMask.next(isIbanStarted ? ibanPattern : defaultPattern);
        }
      });
    }
  }

  private checkIfIbanStarted(typedVal: string): boolean {
    return typedVal.length > 0 && (typedVal.charAt(0) <= '0' || typedVal.charAt(0) >= '9');
  }

  GetBankAccountMask(): string {
    const currentTypeBankAccountNumber = this.currentForm!.GetValue('customerBankAccountNumber') as string;
    const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
    return isIbanStarted ? ibanPattern : defaultPattern;
  }

  checkBankAccountKeydownValue(event: any): void {
    const currentTypeBankAccountNumber = (this.currentForm!.GetValue('customerBankAccountNumber') as string).concat(event.key);
    console.log('[checkBankAccountKeydownValue] ', this.currentForm!.GetValue('customerBankAccountNumber'), event.key, currentTypeBankAccountNumber, currentTypeBankAccountNumber.length);
    if (currentTypeBankAccountNumber.length > 1) {
      return;
    }
    const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
    console.log(isIbanStarted, currentTypeBankAccountNumber.length > 0, currentTypeBankAccountNumber.charAt(0) <= '0', currentTypeBankAccountNumber.charAt(0) >= '9');
    this.bankAccountMask.next(isIbanStarted ? ibanPattern : defaultPattern);
    //this.currentForm!.form.controls['customerBankAccountNumber'].setValue(currentTypeBankAccountNumber);
  }

}
3