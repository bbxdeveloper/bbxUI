import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IPartnerLock } from './IPartnerLock';

@Injectable()
export class PartnerLockService implements IPartnerLock {
  private readonly baseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'Customer'

  private customerId: string|number|undefined

  constructor(private readonly http: HttpClient) {}

  public lockCustomer(customerId: number|string): Promise<unknown> {
    const request = this.http.post(this.baseUrl + '/lock', { customerId })

    return firstValueFrom(request)
      .then(value => {
        this.customerId = customerId

        return value
      })
  }

  public unlockCustomer(): Promise<unknown> {
    if (!this.customerId) {
      return Promise.resolve()
    }

    this.customerId = undefined

    const request = this.http.post(this.baseUrl + '/unlock', { customerId: this.customerId })

    return firstValueFrom(request)
  }
}
