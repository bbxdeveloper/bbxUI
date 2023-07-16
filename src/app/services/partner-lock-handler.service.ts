import { Injectable } from '@angular/core';
import { PartnerLockService } from './partner-lock.service';
import { BbxToastrService } from './bbx-toastr-service.service';
import { CommonService } from './common.service';
import { Constants } from 'src/assets/util/Constants';
import { IPartnerLock } from './IPartnerLock';

@Injectable()
export class PartnerLockHandlerService implements IPartnerLock {
  constructor(
    private readonly partnerLock: PartnerLockService,
    private readonly bbxToastrService: BbxToastrService,
    private readonly commonService: CommonService,
  ) { }

  public lockCustomer(customerId: string|number): Promise<unknown> {
    return this.partnerLock.lockCustomer(customerId)
      .catch(this.lockErrorHandler.bind(this))
  }

  private lockErrorHandler(error: any): void {
    if (error.status === 423) {
      this.bbxToastrService.showError(Constants.MSG_ERROR_CUSTOMER_LOCKED)
    }
    else {
      this.commonService.HandleError(error)
    }
  }

  public unlockCustomer(): Promise<unknown> {
    return this.partnerLock.unlockCustomer()
      .catch(this.commonService.HandleError.bind(this))
  }
}
