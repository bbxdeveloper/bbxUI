import { ComponentFactoryResolver, Inject, Injectable, Injector, TemplateRef, Type } from '@angular/core';
import { NB_DIALOG_CONFIG, NB_DOCUMENT, NbDialogConfig, NbDialogRef, NbDialogService, NbOverlayService, NbPositionBuilderService } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class BbxDialogServiceService extends NbDialogService {
  private refCache: NbDialogRef<any>[] = []

  private _isDialogOpened = false

  public get isDialogOpened(): boolean {
    return this._isDialogOpened
  }

  constructor(@Inject(NB_DOCUMENT) document: any,
    @Inject(NB_DIALOG_CONFIG) globalConfig: any,
    positionBuilder: NbPositionBuilderService,
    overlay: NbOverlayService,
    injector: Injector,
    cfr: ComponentFactoryResolver) {
    super(document, globalConfig, positionBuilder, overlay, injector, cfr)
  }

  override open<T>(content: Type<T> | TemplateRef<T>, userConfig: Partial<NbDialogConfig<Partial<T> | string>> = {}): NbDialogRef<T> {
    const dialogRef = super.open<T>(content, userConfig)
    this._isDialogOpened = true

    const index = this.refCache.push(dialogRef)

    dialogRef.onClose.subscribe(this.onDialogClose(index))

    return dialogRef
  }

  private onDialogClose(index: number): () => void {
    return () => {
      this.refCache.splice(index, 1)
      this._isDialogOpened = false
    }
  }

  closeAll(): void {
    this.refCache.forEach(dialogRef => {
      if (dialogRef) {
        dialogRef.close()
      }
    })
    this.refCache = []
  }
}
