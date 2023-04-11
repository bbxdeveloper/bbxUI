import { Injectable } from '@angular/core';
import { Constants } from 'src/assets/util/Constants';
import { BbxToastrService } from './bbx-toastr-service.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private bbxToastrService: BbxToastrService, private loggerService: LoggerService) { }

  HandleError(err: any, preMessage: string = ""): void {
    console.log(err);
    if (!!err?.error?.Errors && Array.isArray(err?.error?.Errors) && err?.error?.Errors.length > 0) {
      let errorMsgs = '';
      for (let i = 0; i < err?.error?.Errors.length; i++) {
        errorMsgs += err?.error?.Errors[i] + '\n';
      }
      this.loggerService.error(preMessage + errorMsgs)
      this.bbxToastrService.show(preMessage + errorMsgs, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
    }
    else if (!!err?.Errors && Array.isArray(err.Errors) && err.Errors.length > 0) {
      let errorMsgs = '';
      for (let i = 0; i < err.Errors.length; i++) {
        errorMsgs += err.Errors[i] + '\n';
      }
      this.loggerService.error(preMessage + errorMsgs)
      this.bbxToastrService.show(preMessage + errorMsgs, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
    } else if (!!err?.error?.errors && err.error.errors.constructor === Object) {
      let errors = err?.error?.errors;
      let errorMsgs = '';
      Object.keys(errors).forEach((x: string) => {
        errorMsgs += (errors[x as keyof Object] as any)[0] + '\n';
      });
      this.loggerService.error(preMessage + errorMsgs)
      this.bbxToastrService.show(preMessage + errorMsgs, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
    } else {
      const errors: string =
        !!err?.error?.Errors ? err.error.Errors.join('\n') : '';
      const msg: string =
        !!err?.error?.Message ? `${err.error.Message}${(errors.length > 0 ? ': ' : '')}\n` : '';
      if (msg.length > 0 || errors.length > 0) {
        this.loggerService.error(preMessage + msg)
        this.bbxToastrService.show(preMessage + msg + errors, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
      } else {
        this.loggerService.error(preMessage + err.message)
        this.bbxToastrService.show(preMessage + err.message, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
      }
    }
  }
}
