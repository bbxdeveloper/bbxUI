import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { SystemService } from '../../system/services/system.service';
import { CountryCode } from '../models/CountryCode';
import { CustomerMisc } from '../models/CustomerMisc';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-customer-side-bar-form',
  templateUrl: './customer-side-bar-form.component.html',
  styleUrls: ['./customer-side-bar-form.component.scss']
})
export class CustomerSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  override tag = 'Customer';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  customPatterns: any = CustomerMisc.CustomerNgxMaskPatterns;
  taxNumberMask: any = CustomerMisc.TaxNumberNgxMask;
  thirdStateTaxIdMask: any = CustomerMisc.ThirdStateTaxIdMask;

  // Origin
  countryCodes: string[] = [];
  _countryCodes: CountryCode[] = [];
  countryCodeComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  // bankAccountMask: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get privatePersonDefaultValue(): Boolean {
    return false;
  }

  get formValueFormCustomerBankAccNm(): string {
    const tmp = this.currentForm!.GetValue('customerBankAccountNumber') as string;
    return tmp !== undefined ? tmp : '';
  }

  get isHuCountryCodeSet(): boolean {
    const countryCode = this.currentForm?.form.controls['countryCode']?.value ?? '';
    const countryDesc = this._countryCodes?.find(x => x.value === 'HU')?.text;
    return HelperFunctions.isEmptyOrSpaces(countryCode) || (!!countryDesc && countryCode === countryDesc);
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService, kbS: KeyboardNavigationService, private cService: CustomerService,
    private systemService: SystemService,
    private cs: CommonService,
    private sts: StatusService,
    cdref: ChangeDetectorRef) {
    super(kbS, cdref);
    this.refreshComboboxData();
  }

  postalCodeInputFocusOut(event: any): void {
    if (!this.isHuCountryCodeSet) {
      return;
    }
    const newValue = this.currentForm?.form.controls['postalCode'].value;
    if (!HelperFunctions.isEmptyOrSpaces(newValue) && this.currentForm && HelperFunctions.isEmptyOrSpaces(this.currentForm.form.controls['city'].value)) {
      this.SetCityByZipInfo(newValue);
    }
  }

  cityInputFocusOut(event: any): void {
    if (!this.isHuCountryCodeSet) {
      return;
    }
    const newValue = this.currentForm?.form.controls['city'].value;
    if (!HelperFunctions.isEmptyOrSpaces(newValue) && this.currentForm && HelperFunctions.isEmptyOrSpaces(this.currentForm.form.controls['postalCode'].value)) {
      this.SetCityByZipInfo(newValue, false);
    }
  }

  SetCityByZipInfo(zipOrCity: any, byZip: boolean = true) {
    this.sts.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
    if (byZip) {
      this.systemService.CityByZip(zipOrCity).subscribe({
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
    } else {
      this.systemService.ZipByCity(zipOrCity).subscribe({
        next: res => {
          if (res && this.currentForm) {
            this.currentForm.form.controls['postalCode'].setValue(res.zipCode);
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
        this._countryCodes = data;
        this.countryCodes = data?.map(x => x.text) ?? [];
        this.countryCodeComboData$.next(this.countryCodes);
      }
    });
  }

  protected override SetupForms(): void {
    if (!!this.currentForm) {
      this.currentForm.form.controls['privatePerson'].setValue(this.privatePersonDefaultValue);

      // this.currentForm.form.controls['customerBankAccountNumber'].valueChanges.subscribe({
      //   next: val => {
      //     const currentTypeBankAccountNumber = val !== undefined && val !== null ? val : "";
      //     const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
      //     if (currentTypeBankAccountNumber.length > 1) {
      //       return;
      //     }
      //     const nextMask = isIbanStarted ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern;
      //     this.bankAccountMask.next(nextMask);
      //   }
      // });
    }
  }

  // private checkIfIbanStarted(typedVal: string): boolean {
  //   return typedVal !== undefined && typedVal !== null && typedVal.length > 0 && (typedVal.charAt(0) <= '0' || typedVal.charAt(0) >= '9');
  // }

  // GetBankAccountMask(): string {
  //   const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm;
  //   const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
  //   return isIbanStarted ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern;
  // }

  // checkBankAccountKeydownValue(event: any): void {
  //   if (event.key.length === 1) {
  //     const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm.concat(event.key);

  //     console.log('[checkBankAccountKeydownValue] ', this.currentForm!.GetValue('customerBankAccountNumber'), event.key, currentTypeBankAccountNumber, currentTypeBankAccountNumber.length);

  //     const nextMask = this.checkIfIbanStarted(currentTypeBankAccountNumber) ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern;
  //     console.log("Check: ", currentTypeBankAccountNumber.length, nextMask.length, nextMask);
  //     if (currentTypeBankAccountNumber.length > nextMask.length) {
  //       event.stopImmediatePropagation();
  //       event.preventDefault();
  //       event.stopPropagation();
  //     }

  //     if (currentTypeBankAccountNumber.length > 1) {
  //       return;
  //     }
  //     const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);

  //     console.log(isIbanStarted, currentTypeBankAccountNumber.length > 0, currentTypeBankAccountNumber.charAt(0) <= '0', currentTypeBankAccountNumber.charAt(0) >= '9');
  //     this.bankAccountMask.next(isIbanStarted ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern);
  //   } else {
  //     const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm.concat(event.key);

  //     console.log('[checkBankAccountKeydownValue] ', this.currentForm!.GetValue('customerBankAccountNumber'), event.key, currentTypeBankAccountNumber, currentTypeBankAccountNumber.length);

  //     if (currentTypeBankAccountNumber.length > 1) {
  //       return;
  //     }
  //     const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);

  //     console.log(isIbanStarted, currentTypeBankAccountNumber.length > 0, currentTypeBankAccountNumber.charAt(0) <= '0', currentTypeBankAccountNumber.charAt(0) >= '9');
  //     this.bankAccountMask.next(isIbanStarted ? CustomerMisc.IbanPattern : CustomerMisc.DefaultPattern);
  //   }
  // }
}