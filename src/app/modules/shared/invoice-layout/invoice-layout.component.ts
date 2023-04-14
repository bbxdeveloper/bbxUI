import { Component, Input, OnInit } from '@angular/core';
import { OutGoingInvoiceFullData } from '../../invoice/models/CreateOutgoingInvoiceRequest';

@Component({
  selector: 'app-invoice-layout',
  templateUrl: './invoice-layout.component.html',
  styleUrls: ['./invoice-layout.component.scss']
})
export class InvoiceLayoutComponent implements OnInit {
  @Input() isPageReady: boolean = false
  @Input() outGoingInvoiceData?: OutGoingInvoiceFullData;

  constructor() { }

  ngOnInit(): void {
  }

}
