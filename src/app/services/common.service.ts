import { Injectable } from '@angular/core';
import { Constants } from 'src/assets/util/Constants';
import { BbxToastrService } from './bbx-toastr-service.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private toastrService: BbxToastrService) { }

  HandleError(err: any): void {
    console.log(err);
    if (!!err?.error?.errors && err.error.errors.constructor === Object) {
      let errors = err?.error?.errors;
      let errorMsgs = '';
      Object.keys(errors).forEach((x: string) => {
        errorMsgs += (errors[x as keyof Object] as any)[0] + '\n';
      });
      this.toastrService.show(errorMsgs, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
    } else if (!!err?.Errors && Array.isArray(err.Errors) && err.Errors.length > 0) {
      let errorMsgs = '';
      for (let i = 0; i < err.Errors.length; i++) {
        errorMsgs += err.Errors[i] + '\n';
      }
      this.toastrService.show(errorMsgs, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
    } else {
      const errors: string =
        !!err?.error?.Errors ? err.error.Errors.join('\n') : '';
      const msg: string =
        !!err?.error?.Message ? `${err.error.Message}${(errors.length > 0 ? ': ' : '')}\n` : '';
      if (msg.length > 0 || errors.length > 0) {
        this.toastrService.show(msg + errors, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
      } else {
        this.toastrService.show(err.message, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
      }
    }
  }
}
