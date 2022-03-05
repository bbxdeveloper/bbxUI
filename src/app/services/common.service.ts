import { Injectable } from '@angular/core';
import { Constants } from 'src/assets/util/Constants';
import { BbxToastrService } from './bbx-toastr-service.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private toastrService: BbxToastrService) { }

  HandleError(err: any): void {
    const errors: string =
      !!err?.error?.Errors ? err.error.Errors.join('\n') : '';
    const msg: string =
      !!err?.error?.Message ? `${err.error.Message}${(errors.length > 0 ? ': ' : '')}\n` : '';
    if (msg.length > 0 || errors.length > 0) {
      this.toastrService.show(msg + errors, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
    } else {
      this.toastrService.show(err, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
    }
  }
}
