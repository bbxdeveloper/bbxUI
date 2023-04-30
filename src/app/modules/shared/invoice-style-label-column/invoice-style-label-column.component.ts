import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-invoice-style-label-column',
  templateUrl: './invoice-style-label-column.component.html',
  styleUrls: ['./invoice-style-label-column.component.scss']
})
export class InvoiceStyleLabelColumnComponent implements OnInit {
  @Input() title: string = ''

  constructor() { }

  ngOnInit(): void {
  }

}
