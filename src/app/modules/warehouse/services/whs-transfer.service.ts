import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateWhsTransferRequest } from '../models/CreateWhsTransferRequest';

@Injectable()
export class WhsTransferService {

  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}/WhsTransfer`

  constructor(
    private readonly http: HttpClient
  ) { }

  public async create(params: CreateWhsTransferRequest): Promise<unknown> {
    const request = this.http.post(this.baseUrl, params)

    return firstValueFrom(request)
  }
}
