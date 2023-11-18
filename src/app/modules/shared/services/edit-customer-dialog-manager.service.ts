import { Injectable } from '@angular/core';
import { EditCustomerDialogComponent } from '../edit-customer-dialog/edit-customer-dialog.component';
import { Customer } from '../../customer/models/Customer';
import { CustomerService } from '../../customer/services/customer.service';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CommonService } from 'src/app/services/common.service';
import { StatusService } from 'src/app/services/status.service';
import { Constants } from 'src/assets/util/Constants';
import { Subject } from 'rxjs';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

@Injectable({
  providedIn: 'root'
})
export class EditCustomerDialogManagerService {
  public refreshedCustomer = new Subject<Customer>()

  constructor(
    private readonly dialogService: BbxDialogServiceService,
    private readonly customerService: CustomerService,
    private readonly commonService: CommonService,
    private readonly statusService: StatusService,
  ) { }

  public open(customerId: number|undefined) {
    const canOpen = !EditCustomerDialogComponent.opened && customerId
    if (!canOpen) {
      return
    }

    const userConfig = {
      context: {
        customerId
      }
    }

    this.dialogService.open(EditCustomerDialogComponent, userConfig)
      .onClose.subscribe(refresh => {
        if (refresh) {
          this.refreshCustomer(customerId!)
        }
      })
  }

  private refreshCustomer(customerId: number) {
    const request = {
      ID: customerId,
      PageSize: '1',
      OrderBy: 'customerName'
    } as GetCustomersParamListModel

    this.statusService.pushProcessStatus(Constants.LoadDataStatuses[Constants.LoadDataPhases.LOADING]);
    this.customerService.GetAll(request)
      .subscribe({
        next: res => {
          if (!res.succeeded) {
            this.commonService.HandleError(res.errors)
          }

          if (res.data && res.data.length > 0) {
            this.refreshedCustomer.next(res.data[0])
          }
        },
        error: error => {
          this.commonService.HandleError(error)
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
        },
        complete: () => {
          this.statusService.pushProcessStatus(Constants.BlankProcessStatus);
        }
      })
  }
}
