import { Injectable } from '@angular/core';
import { BbxToastrService } from './bbx-toastr-service.service';
import { KeyboardNavigationService } from './keyboard-navigation.service';
import { StatusService } from './status.service';

@Injectable({
  providedIn: 'root'
})
export class KeyboardHelperService {

  constructor(private kbs: KeyboardNavigationService, private status: StatusService,
    private bbxToastrService: BbxToastrService) { }

  get IsKeyboardBlocked(): boolean {
    return  this.status.InProgress;
  }

  get IsDialogOpened(): boolean {
    return this.kbs.IsDialogOpen();
  }

  ShouldContinueWithEvent(event: any): boolean {
    if (this.IsDialogOpened || this.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return false;
    }
    if (!!event && this.bbxToastrService.IsToastrOpened) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      this.bbxToastrService.close();

      return false;
    }
    return true;
  }
}
