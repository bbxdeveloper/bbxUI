import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Constants } from 'src/assets/util/Constants';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private toastrService: NbToastrService) { }

  HandleError(err: any): void {
    if (!!err.error.Errors) {
      this.toastrService.show(err.error.Errors.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
    } else {
      this.toastrService.show(err, Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
    }
  }
}
