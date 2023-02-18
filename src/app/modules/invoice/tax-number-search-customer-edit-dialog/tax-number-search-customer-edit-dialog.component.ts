import { AfterContentInit, AfterViewChecked, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { CustomerService } from '../../customer/services/customer.service';

import { AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { BlankComboBoxValue, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { createMask } from '@ngneat/input-mask';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';

import { Actions, KeyBindings } from 'src/assets/util/KeyBindings';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { CreateCustomerRequest } from '../../customer/models/CreateCustomerRequest';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { SystemService } from '../../system/services/system.service';
import { CustomerMisc } from '../../customer/models/CustomerMisc';
import { CountryCode } from '../../customer/models/CountryCode';

@Component({
  selector: 'app-tax-number-search-customer-edit-dialog',
  templateUrl: './tax-number-search-customer-edit-dialog.component.html',
  styleUrls: ['./tax-number-search-customer-edit-dialog.component.scss']
})
export class TaxNumberSearchCustomerEditDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked, AfterViewInit {
  @Input() data!: Customer;
  @Input() createCustomer: boolean = false;

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  public get saveIsDisabled(): boolean {
    if (this.currentForm !== undefined && this.currentForm.form !== undefined) {
      return this.currentForm.form.invalid;
    } else {
      return true;
    }
  }

  customPatterns: any = CustomerMisc.CustomerNgxMaskPatterns;
  taxNumberMask: any = CustomerMisc.TaxNumberNgxMask;
  thirdStateTaxIdMask: any = CustomerMisc.ThirdStateTaxIdMask;

  get isHuCountryCodeSet(): boolean {
    const countryCode = this.currentForm?.form.controls['countryCode']?.value ?? '';
    const countryDesc = this._countryCodes?.find(x => x.value === 'HU')?.text;
    return HelperFunctions.isEmptyOrSpaces(countryCode) || (!!countryDesc && countryCode === countryDesc);
  }

  blankOptionText: string = BlankComboBoxValue;

  numberInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0',
  });

  numberInputMaskInteger = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 0,
    digitsOptional: true,
    prefix: '',
    placeholder: '0',
  });

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  closedManually: boolean = false;

  currentForm?: FlatDesignNoTableNavigatableForm;
  sumForm: FormGroup;
  sumFormId: string = "TaxNumberSearchCustomerEditDialogComponentForm";

  // Origin
  countryCodes: string[] = [];
  _countryCodes: CountryCode[] = [];
  countryCodeComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  get privatePersonDefaultValue(): Boolean {
    return !this.createCustomer && (this.currentForm?.GetValue('taxpayerNumber') === undefined || this.currentForm.GetValue('taxpayerNumber') === '') &&
      (this.currentForm?.GetValue('thirdStateTaxId') === undefined || this.currentForm.GetValue('thirdStateTaxId') === '');
  }

  constructor(
    private bbxsb: BbxSidebarService,
    private cService: CustomerService,
    private cdref: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<TaxNumberSearchCustomerEditDialogComponent>,
    private kbS: KeyboardNavigationService,
    private fs: FooterService,
    private sts: StatusService,
    private cs: CommonService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    private systemService: SystemService
  ) {
    super();
    this.Setup();

    this.sumForm = new FormGroup({
      id: new FormControl(0, []),
      customerName: new FormControl('', [Validators.required]),
      customerBankAccountNumber: new FormControl('', []),
      taxpayerNumber: new FormControl('', []),
      thirdStateTaxId: new FormControl('', []),
      countryCode: new FormControl(null, []),
      postalCode: new FormControl(undefined, []),
      city: new FormControl('', [Validators.required]),
      additionalAddressDetail: new FormControl('', [Validators.required]),
      privatePerson: new FormControl(false, []),
      comment: new FormControl('', []),
    });

    this.refreshComboboxData();
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button-yes", "confirm-dialog-button-no"]];
  }

  override ngOnInit(): void {
    // this.kbS.SelectFirstTile();
  }
  ngAfterContentInit(): void {
    if (!this.createCustomer) {
      this.sumForm.controls['id'].setValue(this.data.id);
      this.sumForm.controls['customerName'].setValue(this.data.customerName);
      this.sumForm.controls['customerBankAccountNumber'].setValue(this.data.customerBankAccountNumber ?? '');
      this.sumForm.controls['taxpayerNumber'].setValue(this.data.taxpayerNumber);
      this.sumForm.controls['thirdStateTaxId'].setValue(this.data.thirdStateTaxId);
      this.sumForm.controls['countryCode'].setValue(this.data.countryCode);
      this.sumForm.controls['postalCode'].setValue(this.data.postalCode);
      this.sumForm.controls['city'].setValue(this.data.city);
      this.sumForm.controls['additionalAddressDetail'].setValue(this.data.additionalAddressDetail);
      this.sumForm.controls['privatePerson'].setValue(this.data.privatePerson);
      this.sumForm.controls['comment'].setValue(this.data.comment);
    }
  }
  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }
  ngAfterViewChecked(): void {
  }
  ngAfterViewInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.SetNewForm(this.sumForm);

    // We can move onto the confirmation buttons from the form.
    this.currentForm!.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;

    this.currentForm?.AfterViewInitSetup();

    this.kbS.SelectFirstTile();
    this.kbS.Jump(AttachDirection.UP, true);
  }

  private SetNewForm(form?: FormGroup): void {
    this.currentForm = new FlatDesignNoTableNavigatableForm(
      this.sumForm,
      this.kbS,
      this.cdref,
      [],
      this.sumFormId,
      AttachDirection.UP,
      [],
      this.bbxsb,
      this.fs
    );
    this.currentForm.IsFootersEnabled = false;

    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug

    this.cdref.detectChanges();

    if (!!this.currentForm) {
      this.currentForm.form.controls['privatePerson'].setValue(this.privatePersonDefaultValue);
    }
  }

  close(answer: any) {
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable();
    this.dialogRef.close(answer);
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this.currentForm!.HandleFormEnter(event);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.kbS.Jump(AttachDirection.DOWN, false);
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  private CustomerToCreateRequest(p: Customer): CreateCustomerRequest {
    console.log("[TaxNumberSearchCustomerEditDialogComponent] CustomerToCreateRequest begin:", p);

    let country = this._countryCodes.find(x => x.text === p.countryCode);
    if (country) {
      p.countryCode = country.value;
    }

    if (p.customerBankAccountNumber) {
      p.customerBankAccountNumber = p.customerBankAccountNumber.replace(/\s/g, '');
    }

    const res = {
      additionalAddressDetail: p.additionalAddressDetail,
      city: p.city,
      comment: p.comment,
      countryCode: p.countryCode,
      customerBankAccountNumber: p.customerBankAccountNumber,
      customerName: p.customerName,
      isOwnData: p.isOwnData,
      postalCode: p.postalCode,
      privatePerson: p.privatePerson,
      taxpayerNumber: p.taxpayerNumber,
      thirdStateTaxId: p.thirdStateTaxId,
    } as CreateCustomerRequest;

    console.log("[TaxNumberSearchCustomerEditDialogComponent] CustomerToCreateRequest after:", res);

    return res;
  }

  Save(): void {
    const createRequest = this.CustomerToCreateRequest(this.currentForm!.FillObjectWithForm());

    this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);
    this.cService.Create(createRequest).subscribe({
      next: d => {
        if (d.succeeded && !!d.data) {
          this.cService.Get({ ID: d.data.id }).subscribe({
            next: getData => {
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);

              setTimeout(() => {
                this.simpleToastrService.show(
                  Constants.MSG_SAVE_SUCCESFUL,
                  Constants.TITLE_INFO,
                  Constants.TOASTR_SUCCESS_5_SEC
                );
              }, 200);

              this.close(getData);
            },
            error: err => {
              this.cs.HandleError(err);
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            }
          });
        } else {
          console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
          this.bbxToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      },
      error: err => {
        this.cs.HandleError(err);
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
      }
    });
  }

  private refreshComboboxData(): void {
    // CountryCodes
    this.cService.GetAllCountryCodes().subscribe({
      next: data => {
        this.countryCodes = data?.map(x => x.text) ?? [];
        this._countryCodes = data ?? [];
        this.countryCodeComboData$.next(this.countryCodes);
      }
    });
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

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.key == KeyBindings.exit || event.key == KeyBindings.exitIE) {
      if (this.isEditModeOff) {
        this.close(undefined)
      } else {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION)
      }
    }
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.currentForm?.HandleFormShiftEnter(event)
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
  }
}
