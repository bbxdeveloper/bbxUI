import { Injectable } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { KeyboardNavigationService } from './keyboard-navigation.service';
import { LoggerService } from './logger.service';
import { BehaviorSubject } from 'rxjs';
import { BbxProductCodeInputModule } from '../modules/shared/custom-inputs/bbx-product-code-input/bbx-product-code-input.product-manager';
import { StatusService } from './status.service';

@Injectable({
  providedIn: 'root'
})
export class ProductCodeManagerServiceService {
  public chooseProductTrigger: BehaviorSubject<BbxProductCodeInputModule.ChooseProductRequest | undefined> = new BehaviorSubject<BbxProductCodeInputModule.ChooseProductRequest | undefined>(undefined)

  constructor(private dialogService: NbDialogService,
              private loggerService: LoggerService,
              private keyboardService: KeyboardNavigationService,
              private statusService: StatusService) {

  }

  CreateProductManager(type: BbxProductCodeInputModule.ProductManagerType): BbxProductCodeInputModule.ProductManager {
    return BbxProductCodeInputModule.ProductManagerFactory.Create(
      type,
      this.dialogService,
      this.loggerService,
      this.keyboardService,
      this,
      this.statusService
    )
  }
  
}
