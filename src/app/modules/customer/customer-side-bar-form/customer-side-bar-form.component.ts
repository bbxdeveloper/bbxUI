import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
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
  currentCountryCodeCount: number = 0;
  filteredCountryCodes$: Observable<string[]> = of([]);

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  bankAccountMask: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get privatePersonDefaultValue(): Boolean {
    return (this.currentForm?.GetValue('taxpayerNumber') === undefined || this.currentForm.GetValue('taxpayerNumber') === '') &&
      (this.currentForm?.GetValue('thirdStateTaxId') === undefined || this.currentForm.GetValue('thirdStateTaxId') === '');
  }

  get formValueFormCustomerBankAccNm(): string {
    const tmp = this.currentForm!.GetValue('customerBankAccountNumber') as string;
    return tmp !== undefined ? tmp : '';
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService, private kbS: KeyboardNavigationService, private cService: CustomerService,
    private cdref: ChangeDetectorRef) {
    super();
    this.refreshComboboxData();
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
        this.filteredCountryCodes$ = of(this.countryCodes);
        this.currentCountryCodeCount = this.countryCodes.length;
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
          const currentTypeBankAccountNumber = val;
          const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
          if (currentTypeBankAccountNumber.length > 1) {
            return;
          }
          this.bankAccountMask.next(isIbanStarted ? ibanPattern : defaultPattern);
        }
      });

      this.currentForm?.form.controls['countryCode'].valueChanges.subscribe({
        next: filterString => {
          const tmp = this.filterCountryCode(filterString);
          this.currentCountryCodeCount = tmp.length;
          this.filteredCountryCodes$ = of(tmp);
        }
      });
    }
  }

  private checkIfIbanStarted(typedVal: string): boolean {
    return typedVal.length > 0 && (typedVal.charAt(0) <= '0' || typedVal.charAt(0) >= '9');
  }

  GetBankAccountMask(): string {
    const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm;
    const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
    return isIbanStarted ? ibanPattern : defaultPattern;
  }

  checkBankAccountKeydownValue(event: any): void {
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

  private filterCountryCode(value: string): string[] {
    if (value === undefined) {
      return this.countryCodes;
    }
    const filterValue = value.toLowerCase();
    return this.countryCodes.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
  }
}