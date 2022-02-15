import { Component, Input, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { Nav } from 'src/assets/model/Navigatable';

@Component({
  selector: 'app-customer-side-bar-form',
  templateUrl: './customer-side-bar-form.component.html',
  styleUrls: ['./customer-side-bar-form.component.scss']
})
export class CustomerSideBarFormComponent implements OnInit {
  // TODO: @Input() ?
  currentForm?: Nav.FlatDesignNavigatableForm;

  TileCssClass = Nav.TileCssClass;

  bankAccountMask: BehaviorSubject<any> = new BehaviorSubject<any>(null);

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
      if ((this.currentForm.GetValue('taxPayerNumber') === undefined || this.currentForm.GetValue('taxPayerNumber') === '') &&
        (this.currentForm.GetValue('thirdStateTaxId') === undefined || this.currentForm.GetValue('thirdStateTaxId') === '')) {
        this.currentForm.form.controls['privatePerson'].setValue(true);
      }

      this.currentForm.form.controls['customerBankAccountNumber'].valueChanges.subscribe({
        next: val => {
          const currentTypeBankAccountNumber = val;
          const isIbanStarted = currentTypeBankAccountNumber.length > 2 && (currentTypeBankAccountNumber.charAt(2) >= '0' && currentTypeBankAccountNumber.charAt(2) <= '9');
          if (currentTypeBankAccountNumber.length > 3) {
            return;
          }
          this.bankAccountMask.next(isIbanStarted ? 'SS00 0000 0000 0000 0000 0000 0000' : 'SSSSSSSS-SSSSSSSS-SSSSSSSS');
        }
      });
    }
  }

  GetBankAccountMask(): string {
    const currentTypeBankAccountNumber = this.currentForm!.GetValue('customerBankAccountNumber') as string;
    const isIbanStarted = currentTypeBankAccountNumber.length > 2 && (currentTypeBankAccountNumber.charAt(2) >= '0' && currentTypeBankAccountNumber.charAt(2) <= '9');
    return isIbanStarted ? 'SS00 0000 0000 0000 0000 0000 0000' : 'SSSSSSSS-SSSSSSSS-SSSSSSSS';
  }

  checkBankAccountKeydownValue(event: any): void {
    console.log(this.currentForm!.GetValue('customerBankAccountNumber'), event.key)
    const currentTypeBankAccountNumber = (this.currentForm!.GetValue('customerBankAccountNumber') as string).concat(event.key);
    if (currentTypeBankAccountNumber.length > 3) {
      return;
    }
    const isIbanStarted = currentTypeBankAccountNumber.length > 2 && (currentTypeBankAccountNumber.charAt(2) >= '0' && currentTypeBankAccountNumber.charAt(2) <= '9');
    console.log(isIbanStarted, currentTypeBankAccountNumber.length > 2, currentTypeBankAccountNumber.charAt(2) >= '0', currentTypeBankAccountNumber.charAt(2) <= '9');
    this.bankAccountMask.next(isIbanStarted ? 'SS00 0000 0000 0000 0000 0000 0000' : 'SSSSSSSS-SSSSSSSS-SSSSSSSS');
    //this.currentForm!.form.controls['customerBankAccountNumber'].setValue(currentTypeBankAccountNumber);
  }

}
3