import { Injectable } from '@angular/core';
import { KeyboardNavigationService } from './keyboard-navigation.service';
import { StatusService } from './status.service';

@Injectable({
  providedIn: 'root'
})
export class KeyboardHelperService {

  constructor(private kbs: KeyboardNavigationService, private status: StatusService) { }

  get IsKeyboardBlocked(): boolean {
    return  this.status.InProgress;
  }

  get IsDialogOpened(): boolean {
    return this.kbs.IsDialogOpen();
  }
}
