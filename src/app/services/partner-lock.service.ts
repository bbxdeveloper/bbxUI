import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class PartnerLockService {
  private readonly baseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'Customer'

  private readonly http: HttpClient

  private customerId: string|number|undefined

  constructor(http: HttpClient) {
    this.http = http
  }

  public lockCustomer(customerId: number|string): Promise<unknown> {
    this.customerId = customerId

    const request = this.http.post(this.baseUrl + '/lock', { customerId })

    return firstValueFrom(request)
  }

  public unlockCustomer(asBeacon: boolean = false): Promise<unknown> {
    if (!this.customerId) {
      return Promise.resolve()
    }

    const request = this.http.post(this.baseUrl + '/unlock', { customerId: this.customerId })

    return firstValueFrom(request)
  }
}
