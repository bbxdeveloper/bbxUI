import { AfterContentChecked, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Customer } from '../../customer/models/Customer';

@Component({
  selector: 'app-invoice-customer-form',
  templateUrl: './invoice-customer-form.component.html',
  styleUrls: ['./invoice-customer-form.component.scss']
})
export class InvoiceCustomerFormComponent implements OnInit, AfterContentChecked {
  @Input() title: string = ''
  @Input() customer?: Customer

  form: FormGroup;

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

  ngOnInit(): void {
  }

  SetDataForForm(data: any): void {
    if (!!data) {
      this.customer = { ...data as Customer };
      data.zipCodeCity = data.postalCode + ' ' + data.city;

      HelperFunctions.FillForm(this.form, data);
    }
  }

}
