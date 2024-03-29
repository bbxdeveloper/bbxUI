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
    if (!this.shouldRun()) {
      return Promise.resolve({ succeeded: true })
    }

    const request = this.http.post(this.baseUrl + '/lock', { id: customerId })

    return firstValueFrom(request)
      .then(value => {
        this.customerId = customerId

        return value
      })
  }

  public unlockCustomer(): Promise<unknown> {
    if (!this.shouldRun()) {
      return Promise.resolve()
    }

    if (!this.customerId) {
      return Promise.resolve()
    }

    const request = this.http.post(this.baseUrl + '/unlock', { id: this.customerId })

    return firstValueFrom(request)
      .then(x => this.customerId = undefined)
  }

  public async switchCustomer(customerId: string|number): Promise<unknown> {
    await this.unlockCustomer()

    return this.lockCustomer(customerId)
  }

  private shouldRun(): boolean {
    if (environment.production) {
      return true
    }

    return (environment as any).partnerLock
  }
}
