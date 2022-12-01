import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject, lastValueFrom, Observable, of } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { ZipInfo } from '../../system/models/ZipInfo';
import { SystemService } from '../../system/services/system.service';
import { CustomerService } from '../services/customer.service';

const ibanPattern: string = 'SS00 0000 0000 0000 0000 0000 0000';
const defaultPattern: string = '00000000-00000000-00000000';

@Component({
  selector: 'app-customer-side-bar-form',
  templateUrl: './customer-side-bar-form.component.html',
  styleUrls: ['./customer-side-bar-form.component.scss']
})
export class CustomerSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  customPatterns: any = {
    'X': { pattern: new RegExp('\[A-Z0-9\]'), symbol: 'X' },
    'Y': { pattern: new RegExp('\[A-Z\]'), symbol: 'Y' },
  };

  // Origin
  countryCodes: string[] = [];
  countryCodeComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  bankAccountMask: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get privatePersonDefaultValue(): Boolean {
    return false;
    // return (this.currentForm?.GetValue('taxpayerNumber') === undefined || this.currentForm.GetValue('taxpayerNumber') === '') &&
    //   (this.currentForm?.GetValue('thirdStateTaxId') === undefined || this.currentForm.GetValue('thirdStateTaxId') === '');
  }

  get formValueFormCustomerBankAccNm(): string {
    const tmp = this.currentForm!.GetValue('customerBankAccountNumber') as string;
    return tmp !== undefined ? tmp : '';
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService, kbS: KeyboardNavigationService, private cService: CustomerService,
    private cdref: ChangeDetectorRef, private systemService: SystemService,
    private cs: CommonService,
    private sts: StatusService,) {
    super(kbS);
    this.refreshComboboxData();
  }

  postalCodeInputFocusOut(event: any): void {
    const newValue = this.currentForm?.form.controls['postalCode'].value;
    if (!HelperFunctions.isEmptyOrSpaces(newValue) && this.currentForm && HelperFunctions.isEmptyOrSpaces(this.currentForm.form.controls['city'].value)) {
      this.SetCityByZipInfo(newValue);
    }
  }

  SetCityByZipInfo(zip: any) {
    this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
    this.systemService.CityByZip(zip).subscribe({
      next: res => {
        if (res && this.currentForm) {
          this.currentForm.form.controls['city'].setValue(res.zipCity);
        }
      },
      error: err => {
        this.cs.HandleError(err);
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
      },
      complete: () => {
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
      }
    });
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }
  ngAfterViewInit(): void {
    this.currentForm?.AfterViewInitSetup();
  }

  private refreshComboboxData(): void {
    // CountryCodes
    this.cService.GetAllCountryCodes().subscribe({
      next: data => {
        this.countryCodes = data?.map(x => x.text) ?? [];
        this.countryCodeComboData$.next(this.countryCodes);
      }
    });
  }

  private SetNewForm(form?: FormSubject): void {
    console.log(form);
    if ((!!form && form[0] !== 'Customer') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug

    this.cdref.detectChanges();
    
    if (!!this.currentForm) {
      this.currentForm.form.controls['privatePerson'].setValue(this.privatePersonDefaultValue);

      this.currentForm.form.controls['customerBankAccountNumber'].valueChanges.subscribe({
        next: val => {
          const currentTypeBankAccountNumber = val !== undefined && val !== null ? val : "";
          const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
          if (currentTypeBankAccountNumber.length > 1) {
            return;
          }
          const nextMask = isIbanStarted ? ibanPattern : defaultPattern;
          this.bankAccountMask.next(nextMask);
        }
      });
    }
  }

  private checkIfIbanStarted(typedVal: string): boolean {
    return typedVal !== undefined && typedVal !== null && typedVal.length > 0 && (typedVal.charAt(0) <= '0' || typedVal.charAt(0) >= '9');
  }

  GetBankAccountMask(): string {
    const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm;
    const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
    return isIbanStarted ? ibanPattern : defaultPattern;
  }

  checkBankAccountKeydownValue(event: any): void {
    if (event.key.length === 1) {
      const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm.concat(event.key);

      console.log('[checkBankAccountKeydownValue] ', this.currentForm!.GetValue('customerBankAccountNumber'), event.key, currentTypeBankAccountNumber, currentTypeBankAccountNumber.length);

      const nextMask = this.checkIfIbanStarted(currentTypeBankAccountNumber) ? ibanPattern : defaultPattern;
      console.log("Check: ", currentTypeBankAccountNumber.length, nextMask.length, nextMask);
      if (currentTypeBankAccountNumber.length > nextMask.length) {
        //event.target.value = currentTypeBankAccountNumber.substring(0, nextMask.length - 1);
        event.stopImmediatePropagation();
        event.preventDefault();
        event.stopPropagation();
        // this.currentForm!.form.controls['privatePerson'].setValue(currentTypeBankAccountNumber.substring(0, nextMask.length));
      }

      if (currentTypeBankAccountNumber.length > 1) {
        return;
      }
      const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);

      console.log(isIbanStarted, currentTypeBankAccountNumber.length > 0, currentTypeBankAccountNumber.charAt(0) <= '0', currentTypeBankAccountNumber.charAt(0) >= '9');
      this.bankAccountMask.next(isIbanStarted ? ibanPattern : defaultPattern);
    //this.currentForm!.form.controls['customerBankAccountNumber'].setValue(currentTypeBankAccountNumber);
    } else {
      const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm.concat(event.key);

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
}