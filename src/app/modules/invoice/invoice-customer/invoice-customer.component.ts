import { Component, Input } from '@angular/core';
import { Customer, isCustomerPrivatePerson } from '../../customer/models/Customer';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-invoice-customer',
  templateUrl: './invoice-customer.component.html',
  styleUrls: ['./invoice-customer.component.scss']
})
export class InvoiceCustomerComponent {
  @Input()
  public set customer(value: Customer) {
    const zipCodeCity = value?.postalCode && value?.city
      ? `${value.postalCode} ${value.city}`
      : ''

    this.isPrivatePerson = this.markPrivatePerson && isCustomerPrivatePerson(value)

    this.customerForm.patchValue({
      customerName: value.customerName,
      zipCodeCity: zipCodeCity,
      additionalAddressDetail: value.additionalAddressDetail,
      customerBankAccountNumber: value.customerBankAccountNumber,
      taxpayerNumber: value.taxpayerNumber,
      thirdStateTaxId: value.thirdStateTaxId,
      comment: value.comment
    })
  }

  @Input()
  public markPrivatePerson = false

  public isPrivatePerson = false

  public customerForm: FormGroup

  constructor() {
    this.customerForm = new FormGroup({
      customerName: new FormControl('', [Validators.required]),
      zipCodeCity: new FormControl('', []),
      additionalAddressDetail: new FormControl('', []),
      customerBankAccountNumber: new FormControl('', []),
      taxpayerNumber: new FormControl('', []),
      thirdStateTaxId: new FormControl('', []),
      comment: new FormControl('', []),
    })
  }
}
