import { AfterContentChecked, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Customer, isCustomerPrivatePerson } from '../../customer/models/Customer';

@Component({
  selector: 'app-invoice-customer-form',
  templateUrl: './invoice-customer-form.component.html',
  styleUrls: ['./invoice-customer-form.component.scss']
})
export class InvoiceCustomerFormComponent implements AfterContentChecked {
  @Input() title: string = ''
  @Input() customer?: Customer
  @Input() markPrivatePerson = false

  form: FormGroup;

  isPrivatePerson = false

  constructor() {
    this.form = new FormGroup({
      customerName: new FormControl('', []),
      zipCodeCity: new FormControl('', []),
      additionalAddressDetail: new FormControl('', []),
      customerBankAccountNumber: new FormControl('', []),
      taxpayerNumber: new FormControl('', []),
      thirdStateTaxId: new FormControl('', []),
      comment: new FormControl('', []),
    });
  }

  ngAfterContentChecked(): void {
    this.SetDataForForm(this.customer)
  }

  SetDataForForm(data: Customer|undefined): void {
    if (!data) {
      return
    }

    const zipCodeCity = data.postalCode + ' ' + data.city;

    this.form.patchValue({
      customerName: data.customerName,
      zipCodeCity: zipCodeCity,
      additionalAddressDetail: data.additionalAddressDetail,
      customerBankAccountNumber: data.customerBankAccountNumber,
      taxpayerNumber: data.taxpayerNumber,
      thirdStateTaxId: data.thirdStateTaxId,
      comment: data.comment
    })

    this.isPrivatePerson = this.markPrivatePerson && isCustomerPrivatePerson(data)
  }
}
