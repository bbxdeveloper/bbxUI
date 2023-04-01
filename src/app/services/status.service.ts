import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProcessStatus } from 'src/assets/model/ProcessStatus';
import { Constants } from 'src/assets/util/Constants';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private _actualStatus: BehaviorSubject<ProcessStatus>;
  public get ActualStatus() { return this._actualStatus; }

  private _inProgress: boolean = false;
  public get InProgress() { return this._inProgress; }

  constructor() {
    this._actualStatus = new BehaviorSubject<ProcessStatus>({} as ProcessStatus);
  }

  public push(title: string, value: number, msg: string, isSimple: boolean = true): void {
    this._inProgress = value !== -1 || !!title || !!msg;
    this._actualStatus.next({ value, msg } as ProcessStatus);
  }

  public pushProcessStatus(status: ProcessStatus): void {
    this._inProgress = status.value !== -1 || !!status.title || !!status.msg;
    this._actualStatus.next(status);
  }

  public waitForLoad(loading: boolean = true): void {
    if (loading) {
      this.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING])
    } else {
      this.pushProcessStatus(Constants.BlankProcessStatus)
    }
  }
}
