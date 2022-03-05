import { Injectable } from '@angular/core';
import { NbToastrConfig, NbToastRef, NbToastrService } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class BbxToastrService {

  private _toastrRef?: NbToastRef;
  private _toastrOpened: boolean = false;

  get IsToastrOpened() { return this._toastrOpened; }

  constructor(private toastrService: NbToastrService) { }

  show(message: any, title?: any, userConfig?: Partial<NbToastrConfig>): NbToastRef {
    this._toastrRef = this.toastrService.show(message, title, userConfig);
    this._toastrRef.onClose().subscribe({
      next: () => { this._toastrOpened = false; }
    });
    this._toastrOpened = true;
    return this._toastrRef;
  }

  close(): void {
    if (this._toastrOpened) {
      this._toastrRef?.close();
    }
  }
}
