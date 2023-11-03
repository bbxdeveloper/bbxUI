import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProcessStatus } from 'src/assets/model/ProcessStatus';
import { Constants } from 'src/assets/util/Constants';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private _actualStatus: BehaviorSubject<ProcessStatus>;
  public get ActualStatus() { return this._actualStatus; }

  private _inProgress: boolean = false;
  public get InProgress() { return this._inProgress; }

  constructor(private loggerService: LoggerService) {
    this._actualStatus = new BehaviorSubject<ProcessStatus>({} as ProcessStatus);
  }

  public push(title: string, value: number, msg: string, isSimple: boolean = true): void {
    this.loggerService.info(`title '${title}' value '${value}' isSimple '${isSimple}'`)
    this._inProgress = value !== -1 || !!title || !!msg;
    this._actualStatus.next({ value, msg } as ProcessStatus);
  }

  public pushProcessStatus(status: ProcessStatus): void {
    this.loggerService.info(`[pushProcessStatus] status: ${JSON.stringify(status)}`)
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

  public waitForSave(saving: boolean = true): void {
    if (saving) {
      this.pushProcessStatus(Constants.LoadDataStatuses[Constants.GeneralSavingPhases.SAVING])
    } else {
      this.pushProcessStatus(Constants.BlankProcessStatus)
    }
  }

  public waitForAutoSave(saving: boolean = true): void {
    if (saving) {
      this.pushProcessStatus(Constants.LoadDataStatuses[Constants.GeneralAutoSavingPhases.SAVING])
    } else {
      this.pushProcessStatus(Constants.BlankProcessStatus)
    }
  }
}
