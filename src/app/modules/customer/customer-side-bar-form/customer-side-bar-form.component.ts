import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { LoggerService } from 'src/app/services/logger.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { SystemService } from '../../system/services/system.service';
import { CountryCode, OfflineCountryCodes } from '../models/CountryCode';
import { CustomerMisc } from '../models/CustomerMisc';
import { CustomerService } from '../services/customer.service';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { OfflinePaymentMethods } from '../../invoice/models/PaymentMethod';
import { OfflineUnitPriceTypes } from '../models/UnitPriceType';

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

  public unitPriceTypeComboData: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])

  public paymentMethodsComboData$ = new BehaviorSubject<string[]>([])

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

  constructor(
    private readonly sidebarService: SideBarFormService,
    kbS: KeyboardNavigationService,
    private readonly customerService: CustomerService,
    private readonly systemService: SystemService,
    private readonly commonService: CommonService,
    private readonly statusService: StatusService,
    private readonly invoiceService: InvoiceService,
    private loggerService: LoggerService,
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

  upperCaseFirstLetter(event: any, formField?: string): void {
    if (formField === undefined) {
      return
    }
    const val = this.currentForm?.form.controls[formField].value
    if (val.length === 1) {
      this.currentForm?.form.controls[formField].setValue(event.target.value = event.target.value.toUpperCase())
    } else if (val.length > 1) {
      const firstLetter = val[0]
      this.currentForm?.form.controls[formField].setValue(firstLetter.toUpperCase() + val.slice(1))
    }
  }

  cityInputFocusOut(event: any): void {
    this.upperCaseFirstLetter(event, 'city')
    if (!this.isHuCountryCodeSet) {
      return;
    }
    const newValue = this.currentForm?.form.controls['city'].value;
    if (!HelperFunctions.isEmptyOrSpaces(newValue) && this.currentForm && HelperFunctions.isEmptyOrSpaces(this.currentForm.form.controls['postalCode'].value)) {
      this.SetCityByZipInfo(newValue, false);
    }
  }

  SetCityByZipInfo(zipOrCity: any, byZip: boolean = true) {
    this.statusService.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
    if (byZip) {
      this.systemService.CityByZip(zipOrCity).subscribe({
        next: res => {
          if (res && this.currentForm) {
            this.currentForm.form.controls['city'].setValue(res.zipCity);
          }
        },
        error: err => {
          this.commonService.HandleError(err);
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
        },
        complete: () => {
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
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
          this.commonService.HandleError(err);
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
        },
        complete: () => {
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
        }
      });
    }
  }

  public ngOnInit(): void {
    this.sidebarService.forms.subscribe({ next: f => this.SetNewForm(f) });
  }

  public ngAfterViewInit(): void {
    this.comboBoxData()
    this.currentForm?.AfterViewInitSetup();
  }

  private async comboBoxData(): Promise<void> {
    let unitPriceTypes
    let paymentMethods
    try {
      const unitPriceTypeRequest = this.customerService.getUnitPriceTypes()
      const paymentMethodsRequest = this.invoiceService.getPaymentMethodsAsync()

      unitPriceTypes = await unitPriceTypeRequest
      paymentMethods = await paymentMethodsRequest
    } catch (error) {
      this.commonService.HandleError(error)

      return
    }

    this.unitPriceTypeComboData.next(unitPriceTypes.map(x => x.text))
    this.paymentMethodsComboData$.next(paymentMethods.map(x => x.text))

    const controls = this.currentForm!.form.controls

    const unitPriceType = controls['unitPriceType']
    if (HelperFunctions.isEmptyOrSpaces(unitPriceType.value) && unitPriceTypes.length > 0) {
      const tmp = unitPriceTypes.find(x => x.text === OfflineUnitPriceTypes.Unit.text) ?? unitPriceTypes[0].text
      unitPriceType.setValue(tmp)
    }

    const defPaymentMethod = controls['defPaymentMethod']
    if (HelperFunctions.isEmptyOrSpaces(defPaymentMethod.value) && paymentMethods.length > 0) {
      const tmp = paymentMethods.find(x => x.text === OfflinePaymentMethods.Cash.text) ?? paymentMethods[0].text
      defPaymentMethod.setValue(tmp)
    }
  }

  private refreshComboboxData(): void {
    // CountryCodes
    this.customerService.GetAllCountryCodes().subscribe({
      next: data => {
        this._countryCodes = data;
        this.countryCodes = data?.map(x => x.text) ?? [];
        this.countryCodeComboData$.next(this.countryCodes);
        if (HelperFunctions.isEmptyOrSpaces(this.currentForm?.form.controls['countryCode'].value) && this.countryCodes.length > 0) {
          const tmp = this.countryCodes.find(x => x === OfflineCountryCodes.Hu.text) ?? this.countryCodes[0]
          this.currentForm?.form.controls['countryCode'].setValue(tmp)
        }
      }
    });
  }
}