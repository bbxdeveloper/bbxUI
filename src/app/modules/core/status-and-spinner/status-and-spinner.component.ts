import { Component } from '@angular/core';
import { StatusService } from 'src/app/services/status.service';
import { ProcessStatus } from 'src/assets/model/ProcessStatus';

@Component({
  selector: 'app-status-and-spinner',
  templateUrl: './status-and-spinner.component.html',
  styleUrls: ['./status-and-spinner.component.scss']
})
export class StatusAndSpinnerComponent {
  public _actualStatus: ProcessStatus;
  public get InProgress() { return this.sts.InProgress; }

  constructor(private sts: StatusService) {
    this._actualStatus = {} as ProcessStatus;
    sts.ActualStatus.subscribe(status => this._actualStatus = status);
  }
}
