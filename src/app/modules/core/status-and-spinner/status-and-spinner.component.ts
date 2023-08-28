import { Component } from '@angular/core';
import { StatusService } from 'src/app/services/status.service';
import { ProcessStatus } from 'src/assets/model/ProcessStatus';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-status-and-spinner',
  templateUrl: './status-and-spinner.component.html',
  styleUrls: ['./status-and-spinner.component.scss']
})
export class StatusAndSpinnerComponent {
  public _actualStatus: ProcessStatus;
  public get InProgress() { return this.sts.InProgress; }
  IsSimpleStatusMessage: boolean = true;

  get themeClass(): string {
    return `theme-${environment.theme}`
  }

  constructor(private sts: StatusService) {
    this._actualStatus = {} as ProcessStatus;
    sts.ActualStatus.subscribe({
      next: status => {
        this._actualStatus = status;
        this.IsSimpleStatusMessage = status.isSimple ?? true;
      }
    });
  }
}
