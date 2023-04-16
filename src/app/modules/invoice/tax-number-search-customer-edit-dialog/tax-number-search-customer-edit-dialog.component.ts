import { AfterContentInit, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
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

import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { CreateCustomerRequest } from '../../customer/models/CreateCustomerRequest';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { SystemService } from '../../system/services/system.service';
import { CustomerMisc } from '../../customer/models/CustomerMisc';
import { CountryCode } from '../../customer/models/CountryCode';
import { UnitPriceType, UnitPriceTypes } from '../../customer/models/UnitPriceType';

@Component({
  selector: 'app-tax-number-search-customer-edit-dialog',
  templateUrl: './tax-number-search-customer-edit-dialog.component.html',
  styleUrls: ['./tax-number-search-customer-edit-dialog.component.scss']
})
export class TaxNumberSearchCustomerEditDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy, OnInit, AfterViewInit {
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
    return !this.keyboardService.isEditModeActivated;
  }

  closedManually: boolean = false;

  currentForm?: FlatDesignNoTableNavigatableForm;
  sumForm!: FormGroup;
  sumFormId: string = "TaxNumberSearchCustomerEditDialogComponentForm";

  countryCodes: string[] = [];
  _countryCodes: CountryCode[] = [];
  countryCodeComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  private unitPriceTypes: UnitPriceType[] = []
  public unitPriceTypeData: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])

  get privatePersonDefaultValue(): Boolean {
    return !this.createCustomer && (this.currentForm?.GetValue('taxpayerNumber') === undefined || this.currentForm.GetValue('taxpayerNumber') === '') &&
      (this.currentForm?.GetValue('thirdStateTaxId') === undefined || this.currentForm.GetValue('thirdStateTaxId') === '');
  }

  constructor(
    private readonly bbxsb: BbxSidebarService,
    private readonly customerService: CustomerService,
    private readonly cdref: ChangeDetectorRef,
    private readonly dialogRef: NbDialogRef<TaxNumberSearchCustomerEditDialogComponent>,
    private readonly keyboardService: KeyboardNavigationService,
    private readonly footerService: FooterService,
    private readonly statusService: StatusService,
    private readonly commonService: CommonService,
    private readonly bbxToastrService: BbxToastrService,
    private readonly simpleToastrService: NbToastrService,
    private readonly systemService: SystemService
  ) {
    super();
    this.Setup();
  }

  private Setup(): void {
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
      unitPriceType: new FormControl('Listaár', [Validators.required])
    });

    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button-yes", "confirm-dialog-button-no"]];
  }

  override ngOnInit(): void {
    this.refreshComboboxData();
  }

  public ngAfterContentInit(): void {
    if (!this.createCustomer) {
      const controls = this.sumForm.controls
      controls['id'].setValue(this.data.id);
      controls['customerName'].setValue(this.data.customerName);
      controls['customerBankAccountNumber'].setValue(this.data.customerBankAccountNumber ?? '');
      controls['taxpayerNumber'].setValue(this.data.taxpayerNumber);
      controls['thirdStateTaxId'].setValue(this.data.thirdStateTaxId);
      controls['countryCode'].setValue(this.data.countryCode);
      controls['postalCode'].setValue(this.data.postalCode);
      controls['city'].setValue(this.data.city);
      controls['additionalAddressDetail'].setValue(this.data.additionalAddressDetail);
      controls['privatePerson'].setValue(this.data.privatePerson);
      controls['comment'].setValue(this.data.comment);
      controls['unitPriceType'].setValue(this.data.unitPriceType)
    }
  }

  public ngOnDestroy(): void {
    if (!this.closedManually) {
      this.keyboardService.RemoveWidgetNavigatable();
    }
  }

  public ngAfterViewInit(): void {
    this.keyboardService.SetWidgetNavigatable(this);
    this.SetNewForm(this.sumForm);

    // We can move onto the confirmation buttons from the form.
    this.currentForm!.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;

    this.currentForm?.AfterViewInitSetup();

    this.keyboardService.SelectFirstTile();
    this.keyboardService.Jump(AttachDirection.UP, true);
  }

  private SetNewForm(form?: FormGroup): void {
    this.currentForm = new FlatDesignNoTableNavigatableForm(
      this.sumForm,
      this.keyboardService,
      this.cdref,
      [],
      this.sumFormId,
      AttachDirection.UP,
      [],
      this.bbxsb,
      this.footerService
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
    this.keyboardService.RemoveWidgetNavigatable();
    this.dialogRef.close(answer);
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this.currentForm!.HandleFormEnter(event);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.keyboardService.Jump(AttachDirection.DOWN, false);
      this.keyboardService.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  private CustomerToCreateRequest(customer: Customer): CreateCustomerRequest {
    console.log("[TaxNumberSearchCustomerEditDialogComponent] CustomerToCreateRequest begin:", customer);

    const country = this._countryCodes.find(x => x.text === customer.countryCode);
    if (country) {
      customer.countryCode = country.value;
    }

    if (customer.customerBankAccountNumber) {
      customer.customerBankAccountNumber = customer.customerBankAccountNumber.replace(/\s/g, '');
    }

    customer.unitPriceType = this.unitPriceTypes.find(x => customer.unitPriceType === x.text)?.value ?? UnitPriceTypes.List

    const res = {
      additionalAddressDetail: customer.additionalAddressDetail,
      city: customer.city,
      comment: customer.comment,
      countryCode: customer.countryCode,
      customerBankAccountNumber: customer.customerBankAccountNumber,
      customerName: customer.customerName,
      isOwnData: customer.isOwnData,
      postalCode: customer.postalCode,
      privatePerson: customer.privatePerson,
      taxpayerNumber: customer.taxpayerNumber,
      thirdStateTaxId: customer.thirdStateTaxId,
      unitPriceType: customer.unitPriceType,
    } as CreateCustomerRequest;

    console.log("[TaxNumberSearchCustomerEditDialogComponent] CustomerToCreateRequest after:", res);

    return res;
  }

  Save(): void {
    const createRequest = this.CustomerToCreateRequest(this.currentForm!.FillObjectWithForm());

    this.statusService.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);
    this.customerService.Create(createRequest).subscribe({
      next: d => {
        if (d.succeeded && !!d.data) {
          this.customerService.Get({ ID: d.data.id }).subscribe({
            next: getData => {
              this.statusService.pushProcessStatus(Constants.BlankProcessStatus);

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
              this.commonService.HandleError(err);
              this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
            }
          });
        } else {
          console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
          this.bbxToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
        }
      },
      error: err => {
        this.commonService.HandleError(err);
        this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
      }
    });
  }

  private async refreshComboboxData(): Promise<void> {
    try {
      const countryCodesRequest = this.customerService.GetAllCountryCodesAsync()
      const unitPriceTypeRequest = this.customerService.getUnitPriceTypes()

      const countryCodeData = await countryCodesRequest
      this._countryCodes = countryCodeData ?? []
      this.countryCodes = countryCodeData?.map(x => x.text) ?? []
      this.countryCodeComboData$.next(this.countryCodes)

      this.unitPriceTypes = await unitPriceTypeRequest ?? []
      this.unitPriceTypeData.next(this.unitPriceTypes.map(x => x.text))
    } catch (error) {
      this.commonService.HandleError(error)
    }
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

  @HostListener('window:keydown', ['$event'])
  public onFunctionKeyDown(event: KeyboardEvent) {
    if (event.key == KeyBindings.exit || event.key == KeyBindings.exitIE) {
      if (this.isEditModeOff) {
        this.close(undefined)
      } else {
        this.keyboardService.setEditMode(KeyboardModes.NAVIGATION)
      }
    }
    if (event.shiftKey && event.key == 'Enter') {
      this.keyboardService.BalanceCheckboxAfterShiftEnter((event.target as any).id);
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
