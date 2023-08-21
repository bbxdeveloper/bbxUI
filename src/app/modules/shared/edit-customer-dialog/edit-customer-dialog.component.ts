import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseNavigatableComponentComponent } from '../base-navigatable-component/base-navigatable-component.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Navigatable';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { CustomerMisc } from '../../customer/models/CustomerMisc';
import { BehaviorSubject, forkJoin, tap } from 'rxjs';
import { CustomerService } from '../../customer/services/customer.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { CountryCode } from '../../customer/models/CountryCode';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { StatusService } from 'src/app/services/status.service';
import { SystemService } from '../../system/services/system.service';
import { NavigatableForm } from 'src/assets/model/navigation/Nav';
import { Customer } from '../../customer/models/Customer';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { GetCustomerParamListModel } from '../../customer/models/GetCustomerParamListModel';

@Component({
  selector: 'app-edit-customer-dialog',
  templateUrl: './edit-customer-dialog.component.html',
  styleUrls: ['./edit-customer-dialog.component.scss']
})
export class EditCustomerDialogComponent extends BaseNavigatableComponentComponent  implements OnInit, AfterViewInit, OnDestroy {
  private static _opened = false
  public static get opened(): boolean {
    return EditCustomerDialogComponent._opened
  }

  public get isEditModeOff(): boolean {
    return !this.keyboardService.isEditModeActivated
  }

  @Input()
  public customerId: number|undefined

  private customer: Customer|undefined
  private isCustomerPrivatePerson = false

  get isHuCountryCodeSet(): boolean {
    const countryCode = this.formNav?.form.controls['countryCode']?.value ?? '';
    const countryDesc = this._countryCodes?.find(x => x.value === 'HU')?.text;
    return HelperFunctions.isEmptyOrSpaces(countryCode) || (!!countryDesc && countryCode === countryDesc);
  }

  public isLoading = false

  customPatterns: any = CustomerMisc.CustomerNgxMaskPatterns;
  taxNumberMask: any = CustomerMisc.TaxNumberNgxMask;
  thirdStateTaxIdMask: any = CustomerMisc.ThirdStateTaxIdMask;

  _countryCodes: CountryCode[] = []
  countryCodes: string[] = []
  countryCodeComboData$ = new BehaviorSubject<string[]>([]);

  public readonly formId = 'customer-edit-form-id'
  public customerForm: FormGroup
  public formNav: NavigatableForm

  TileCssClass = TileCssClass
  TileCssColClass = TileCssColClass

  constructor(
    private readonly keyboardService: KeyboardNavigationService,
    private readonly cdref: ChangeDetectorRef,
    private readonly customerService: CustomerService,
    private readonly commonService: CommonService,
    private readonly statusService: StatusService,
    private readonly systemService: SystemService,
    private readonly dialogRef: NbDialogRef<boolean>,
    private readonly dialogService: NbDialogService,
  ) {
    super()

    EditCustomerDialogComponent._opened = true

    this.IsDialog = true

    this.customerForm = new FormGroup({
      id: new FormControl(0, []),
      customerName: new FormControl(undefined, [Validators.required]),
      customerBankAccountNumber: new FormControl(undefined, []),
      taxpayerNumber: new FormControl(undefined, []),
      thirdStateTaxId: new FormControl(undefined, []),
      countryCode: new FormControl('Magyarország', [Validators.required]),
      postalCode: new FormControl(undefined, []),
      city: new FormControl(undefined, [Validators.required]),
      additionalAddressDetail: new FormControl(undefined, [Validators.required]),
      privatePerson: new FormControl(false, []),
    })

    this.formNav = new NavigatableForm(
      this.customerForm,
      this.keyboardService,
      cdref,
      [],
      this.formId,
      AttachDirection.UP,
      {} as IInlineManager
    )

    this.Matrix = [['confirm-dialog-button-yes', 'confirm-dialog-button-no']]
  }

  override ngOnInit(): void {
    this.statusService.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
    const countryCodesRequest = this.customerService.GetAllCountryCodes()

    const customerRequestParams = {
      ID: this.customerId
    } as GetCustomerParamListModel
    const customerRequest = this.customerService.Get(customerRequestParams)

    forkJoin([countryCodesRequest, customerRequest])
      .pipe(
        tap(() => this.statusService.pushProcessStatus(Constants.BlankProcessStatus)),
        tap(responses => {
          this._countryCodes = responses[0]
          this.countryCodes = responses[0].map(x => x.text) ?? [];
          this.countryCodeComboData$.next(this.countryCodes);
        }),
        tap(responses => {
          this.customer = responses[1]
          this.isCustomerPrivatePerson = responses[1].customerVatStatus === 'PRIVATE_PERSON'

          this.customerForm.patchValue({
            id: this.customer.id,
            customerName: this.customer.customerName,
            customerBankAccountNumber: this.customer.customerBankAccountNumber,
            taxpayerNumber: this.customer.taxpayerNumber,
            thirdStateTaxId: this.customer.thirdStateTaxId,
            postalCode: this.customer.postalCode,
            countryCode: this._countryCodes.find(x => x.value === this.customer?.countryCode)?.text,
            city: this.customer.city,
            additionalAddressDetail: this.customer.additionalAddressDetail,
            privatePerson: this.isCustomerPrivatePerson,
          })
        })
      )
      .subscribe()
  }

  ngAfterViewInit(): void {
    this.keyboardService.SetWidgetNavigatable(this)

    this.cdref.detectChanges()

    this.formNav.OuterJump = true
    this.OuterJump = true

    this.formNav.GenerateAndSetNavMatrices(true)

    this.keyboardService.SelectFirstTile()
    this.keyboardService.Jump(AttachDirection.UP, true)
  }

  public ngOnDestroy(): void {
    this.keyboardService.RemoveWidgetNavigatable()

    EditCustomerDialogComponent._opened = false
  }

  public close(): void {
    this.dialogRef.close(false)
  }

  public ok(): void {
    const isPrivatePerson = this.customerForm.controls['privatePerson'].value

    let msg: string|undefined
    if (this.isCustomerPrivatePerson && !isPrivatePerson) {
      msg = 'A partnert áfaalanyra módosítjuk?'
    }

    if (!this.isCustomerPrivatePerson && isPrivatePerson) {
      msg = 'A partnert magánszemélyre módosítjuk?'
    }

    if (msg) {
      HelperFunctions.confirm(this.dialogService, msg, this.saveAndClose.bind(this))
    }
    else {
      this.saveAndClose()
    }
  }

  private saveAndClose() {
    if (!this.customer) {
      return
    }

    const request = { ...this.customer, ...this.customerForm.value } as Customer
    request.countryCodeX = request.countryCode
    request.countryCode = this._countryCodes.find(x => x.text === request.countryCode)?.value ?? ''

    this.statusService.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING])
    this.customerService.Update(request)
      .subscribe({
        next: (res) => {
          if (res.errors) {
            for (const error of res.errors) {
              this.commonService.HandleError(error)
            }
          }
        },
        error: error => {
          this.commonService.HandleError(error)
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus)
        },
        complete: () => {
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus)

          this.dialogRef.close(true)
        }
      })
  }

  public moveToButtons(event: Event): void {
    if (this.isLoading) {
      return
    }

    if (this.isEditModeOff) {
      this.formNav.HandleFormEnter(event)
    }
    else {
      HelperFunctions.StopEvent(event)

      this.keyboardService.Jump(AttachDirection.DOWN, false)
      this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)
    }
  }

  cityInputFocusOut(event: any): void {
    if (!this.isHuCountryCodeSet) {
      return;
    }
    const newValue = this.formNav.form.controls['city'].value;
    if (!HelperFunctions.isEmptyOrSpaces(newValue) && HelperFunctions.isEmptyOrSpaces(this.formNav.form.controls['postalCode'].value)) {
      this.SetCityByZipInfo(newValue, false);
    }
  }

  postalCodeInputFocusOut(event: any): void {
    if (!this.isHuCountryCodeSet) {
      return;
    }
    const newValue = this.formNav.form.controls['postalCode'].value;
    if (!HelperFunctions.isEmptyOrSpaces(newValue) && HelperFunctions.isEmptyOrSpaces(this.formNav.form.controls['city'].value)) {
      this.SetCityByZipInfo(newValue);
    }
  }

  SetCityByZipInfo(zipOrCity: any, byZip: boolean = true) {
    this.statusService.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
    if (byZip) {
      this.systemService.CityByZip(zipOrCity).subscribe({
        next: res => {
          if (res) {
            this.formNav.form.controls['city'].setValue(res.zipCity);
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
          if (res) {
            this.formNav.form.controls['postalCode'].setValue(res.zipCode);
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
}
