import { ComponentFactoryResolver, Inject, Injectable, Injector, TemplateRef, Type } from '@angular/core';
import { NB_DIALOG_CONFIG, NB_DOCUMENT, NbDialogConfig, NbDialogRef, NbDialogService, NbOverlayService, NbPositionBuilderService } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class BbxDialogServiceService extends NbDialogService {
  private refCache: NbDialogRef<any>[] = []

  constructor(@Inject(NB_DOCUMENT) document: any,
    @Inject(NB_DIALOG_CONFIG) globalConfig: any,
    positionBuilder: NbPositionBuilderService,
    overlay: NbOverlayService,
    injector: Injector,
    cfr: ComponentFactoryResolver) {
    super(document, globalConfig, positionBuilder, overlay, injector, cfr)
  }

  override open<T>(content: Type<T> | TemplateRef<T>, userConfig: Partial<NbDialogConfig<Partial<T> | string>> = {}): NbDialogRef<T> {
    
    console.trace('BbxDialogServiceService open')
    const dialogRef = super.open<T>(content, userConfig)
    this.refCache.push(dialogRef)
    return dialogRef
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
