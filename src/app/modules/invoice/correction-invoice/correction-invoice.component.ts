import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { CorrectionInvoiceSelectionDialogComponent } from '../correction-invoice-selection-dialog/correction-invoice-selection-dialog.component';
import { Invoice } from '../models/Invoice';

@Component({
  selector: 'app-correction-invoice',
  templateUrl: './correction-invoice.component.html',
  styleUrls: ['./correction-invoice.component.scss']
})
export class CorrectionInvoiceComponent implements OnInit {

  constructor(
    private  readonly dialogService: NbDialogService
  ) { }

  public ngOnInit(): void {
    const dialog = this.dialogService
      .open(CorrectionInvoiceSelectionDialogComponent)
      .onClose.subscribe(this.onCorrentionInvoiceSelectionDialogClosed.bind(this))
  }

  private onCorrentionInvoiceSelectionDialogClosed(invoice: Invoice): void {
    debugger
  }

}
