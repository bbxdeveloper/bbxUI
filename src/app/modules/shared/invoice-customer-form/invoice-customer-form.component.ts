import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Customer } from '../../customer/models/Customer';

@Component({
  selector: 'app-invoice-customer-form',
  templateUrl: './invoice-customer-form.component.html',
  styleUrls: ['./invoice-customer-form.component.scss']
})
export class InvoiceCustomerFormComponent implements OnInit {
  @Input() title: string = ''
  @Input() customer: Customer = {} as Customer

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

  ngOnInit(): void {
  }

}
