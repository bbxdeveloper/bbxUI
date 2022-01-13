import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProcessStatus } from 'src/assets/model/ProcessStatus';

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

  public push(title: string, value: number, msg: string): void {
    this._inProgress = value !== -1 || !!title || !!msg;
    this._actualStatus.next({ value, msg } as ProcessStatus);
  }

  public pushProcessStatus(status: ProcessStatus): void {
    this._inProgress = status.value !== -1 || !!status.title || !!status.msg;
    this._actualStatus.next(status);
  }
}
