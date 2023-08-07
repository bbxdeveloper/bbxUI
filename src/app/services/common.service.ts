import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Constants } from 'src/assets/util/Constants';
import { BbxToastrService } from './bbx-toastr-service.service';
import { LoggerService } from './logger.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  CloseAllHeaderMenuTrigger: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  constructor(private bbxToastrService: BbxToastrService, private loggerService: LoggerService, private simpleToastrService: NbToastrService,) { }

  ShowErrorMessage(err: string): void {
    setTimeout(() => {
      this.bbxToastrService.show(
        err,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      )
    }, 0)
  }

  HandleError(err: any, preMessage: string = "", toastrWaitForKey: boolean = true): void {
    console.log(err);

    let toastrMessage = ''

    if (!!err?.error?.Errors && Array.isArray(err?.error?.Errors) && err?.error?.Errors.length > 0) {
      let errorMsgs = '';
      for (let i = 0; i < err?.error?.Errors.length; i++) {
        errorMsgs += err?.error?.Errors[i] + '\n';
      }
      this.loggerService.error(preMessage + errorMsgs)
      toastrMessage = preMessage + errorMsgs
    }
    else if (!!err?.Errors && Array.isArray(err.Errors) && err.Errors.length > 0) {
      let errorMsgs = '';
      for (let i = 0; i < err.Errors.length; i++) {
        errorMsgs += err.Errors[i] + '\n';
      }
      this.loggerService.error(preMessage + errorMsgs)
      toastrMessage = preMessage + errorMsgs
    } else if (!!err?.error?.errors && err.error.errors.constructor === Object) {
      let errors = err?.error?.errors;
      let errorMsgs = '';
      Object.keys(errors).forEach((x: string) => {
        errorMsgs += (errors[x as keyof Object] as any)[0] + '\n';
      });
      this.loggerService.error(preMessage + errorMsgs)
      toastrMessage = preMessage + errorMsgs
    } else {
      const errors: string =
        !!err?.error?.Errors ? err.error.Errors.join('\n') : '';
      const msg: string =
        !!err?.error?.Message ? `${err.error.Message}${(errors.length > 0 ? ': ' : '')}\n` : '';
      if (msg.length > 0 || errors.length > 0) {
        this.loggerService.error(preMessage + msg)
        toastrMessage = preMessage + msg + errors
      } else {
        this.loggerService.error(preMessage + err.message)
        toastrMessage = preMessage + err.message
      }
    }

    if (toastrMessage.length > 0) {
      if (toastrWaitForKey) {
        this.bbxToastrService.show(
          toastrMessage,
          Constants.TITLE_ERROR,
          Constants.TOASTR_ERROR
        );
      } else {
        this.simpleToastrService.show(
          toastrMessage,
          Constants.TITLE_ERROR,
          Constants.TOASTR_ERROR_5_SEC
        );
      }
    }
  }
}
