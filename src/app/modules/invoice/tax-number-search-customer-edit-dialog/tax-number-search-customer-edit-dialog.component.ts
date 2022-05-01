import { AfterContentInit, AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { SelectedCell } from 'src/assets/model/navigation/SelectedCell';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CustomerService } from '../../customer/services/customer.service';
import { SelectTableDialogComponent } from '../../shared/select-table-dialog/select-table-dialog.component';

import { AfterViewInit, HostListener, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NbTable, NbSortDirection, NbDialogService, NbToastrService } from '@nebular/theme';
import { Observable, of, startWith, map, BehaviorSubject } from 'rxjs';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { BlankComboBoxValue, NavigatableForm as InlineTableNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { maxDate, minDate, todaysDate } from 'src/assets/model/Validators';
import { Product } from '../../product/models/Product';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { CustomerSelectTableDialogComponent } from '../customer-select-table-dialog/customer-select-table-dialog.component';
import { CreateOutgoingInvoiceRequest } from '../models/CreateOutgoingInvoiceRequest';
import { InvoiceLine } from '../models/InvoiceLine';
import { PaymentMethod } from '../models/PaymentMethod';
import { ProductSelectTableDialogComponent } from '../product-select-table-dialog/product-select-table-dialog.component';
import { InvoiceService } from '../services/invoice.service';
import { createMask } from '@ngneat/input-mask';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { SumData } from '../models/SumData';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';

import { NbSidebarService } from '@nebular/theme';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { toBase64String } from '@angular/compiler/src/output/source_map';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { CreateCustomerRequest } from '../../customer/models/CreateCustomerRequest';

const ibanPattern: string = 'SS00 0000 0000 0000 0000 0000 0000';
const defaultPattern: string = '00000000-00000000-00000000';

@Component({
  selector: 'app-tax-number-search-customer-edit-dialog',
  templateUrl: './tax-number-search-customer-edit-dialog.component.html',
  styleUrls: ['./tax-number-search-customer-edit-dialog.component.scss']
})
export class TaxNumberSearchCustomerEditDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked, AfterViewInit {
  @Input() data!: Customer;

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  customPatterns: any = {
    'X': { pattern: new RegExp('\[A-Z0-9\]'), symbol: 'X' },
    'Y': { pattern: new RegExp('\[A-Z\]'), symbol: 'Y' },
  };

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
  isLoading: boolean = true;

  currentForm?: FlatDesignNoTableNavigatableForm;
  sumForm: FormGroup;
  sumFormId: string = "TaxNumberSearchCustomerEditDialogComponentForm";

  // Origin
  countryCodes: string[] = [];
  countryCodeComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  bankAccountMask: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get privatePersonDefaultValue(): Boolean {
    return (this.currentForm?.GetValue('taxpayerNumber') === undefined || this.currentForm.GetValue('taxpayerNumber') === '') &&
      (this.currentForm?.GetValue('thirdStateTaxId') === undefined || this.currentForm.GetValue('thirdStateTaxId') === '');
  }

  get formValueFormCustomerBankAccNm(): string {
    const tmp = this.currentForm!.GetValue('customerBankAccountNumber') as string;
    return tmp !== undefined ? tmp : '';
  }

  constructor(
    private sbf: SideBarFormService,
    private sb: NbSidebarService,
    private bbxsb: BbxSidebarService,
    private cService: CustomerService,
    private cdref: ChangeDetectorRef,
    private sidebarFormSercie: SideBarFormService,
    protected dialogRef: NbDialogRef<TaxNumberSearchCustomerEditDialogComponent>,
    private kbS: KeyboardNavigationService,
    private fs: FooterService,
    private dialogService: NbDialogService,
    private sts: StatusService,
    private cs: CommonService,
    private toastrService: BbxToastrService
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
          const nextMask = isIbanStarted ? ibanPattern : defaultPattern;
          this.bankAccountMask.next(nextMask);
        }
      });
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
    }
  }

  private CustomerToCreateRequest(p: Customer): CreateCustomerRequest {
    console.log("[TaxNumberSearchCustomerEditDialogComponent] CustomerToCreateRequest begin:", p);

    let countryCode = !!p.countryCode?.includes('-') ? p.countryCode.split('-')[0] : '';

    const res = {
      additionalAddressDetail: p.additionalAddressDetail,
      city: p.city,
      comment: p.comment,
      countryCode: countryCode,
      customerBankAccountNumber: p.customerBankAccountNumber,
      customerName: p.customerName,
      isOwnData: p.isOwnData,
      postalCode: p.postalCode,
      privatePerson: p.privatePerson,
      thirdStateTaxId: p.thirdStateTaxId,
    } as CreateCustomerRequest;

    console.log("[TaxNumberSearchCustomerEditDialogComponent] CustomerToCreateRequest after:", res);

    return res;
  }

  Save(): void {
    const createRequest = this.CustomerToCreateRequest(this.currentForm!.FillObjectWithForm() as Customer);

    this.isLoading = true;
    this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);
    this.cService.Create(createRequest).subscribe({
      next: d => {
        if (d.succeeded && !!d.data) {
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);

          setTimeout(() => {
            this.toastrService.show(Constants.MSG_SAVE_SUCCESFUL, Constants.TITLE_INFO, Constants.TOASTR_SUCCESS);
          }, 200);

          this.close(d.data);
        } else {
          console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
          this.toastrService.show(d.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      },
      error: err => {
        this.cs.HandleError(err);
        this.isLoading = false;
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
      }
    });
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

  private checkIfIbanStarted(typedVal: string): boolean {
    return typedVal.length > 0 && (typedVal.charAt(0) <= '0' || typedVal.charAt(0) >= '9');
  }

  GetBankAccountMask(): string {
    const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm;
    const isIbanStarted = this.checkIfIbanStarted(currentTypeBankAccountNumber);
    return isIbanStarted ? ibanPattern : defaultPattern;
  }

  checkBankAccountKeydownValue(event: any): void {
    if (event.key.length === 1) {
      const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm.concat(event.key) ?? '';

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
      const currentTypeBankAccountNumber = this.formValueFormCustomerBankAccNm.concat(event.key) ?? '';

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
