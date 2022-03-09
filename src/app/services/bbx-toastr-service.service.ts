import { Injectable } from '@angular/core';
import { NbToastrConfig, NbToastRef, NbToastrService } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class BbxToastrService {

  private _toastrRef?: NbToastRef;
  private _toastrOpened: boolean = false;

  private toastrRefStack: NbToastRef[] = [];

  get IsToastrOpened() { return this.toastrRefStack.length > 0; }

  constructor(private toastrService: NbToastrService) { }

  show(message: any, title?: any, userConfig?: Partial<NbToastrConfig>): NbToastRef {
    this._toastrRef = this.toastrService.show(message, title, userConfig);
    this.toastrRefStack.push(this._toastrRef);
    this._toastrRef.onClose().subscribe({
      next: () => { this._toastrOpened = false; this.toastrRefStack.pop(); }
    });
    this._toastrOpened = true;
    return this._toastrRef;
  }

  close(): void {
    if (this.IsToastrOpened) {
      const tmp = this.toastrRefStack[this.toastrRefStack.length - 1] ?? undefined;
      tmp?.close();
    }
  }
}
