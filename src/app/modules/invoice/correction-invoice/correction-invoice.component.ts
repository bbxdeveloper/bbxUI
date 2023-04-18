import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { CorrectionInvoiceSelectionDialogComponent } from '../correction-invoice-selection-dialog/correction-invoice-selection-dialog.component';

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
    this.dialogService.open(CorrectionInvoiceSelectionDialogComponent)
  }

}
