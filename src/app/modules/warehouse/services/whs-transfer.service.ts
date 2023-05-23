import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateWhsTransferRequest } from '../models/CreateWhsTransferRequest';
import { CreateWhsTransferResponse } from '../models/CreateWhsTransferResponse';
import { Constants } from 'src/assets/util/Constants';

@Injectable()
export class WhsTransferService {

  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}/WhsTransfer`

  constructor(
    private readonly http: HttpClient
  ) { }

  public async create(params: CreateWhsTransferRequest): Promise<CreateWhsTransferResponse> {
    const request = this.http.post<CreateWhsTransferResponse>(this.baseUrl, params)

    return firstValueFrom(request)
  }

  public getReport(params: Constants.Dct): Observable<any> {
    try {
      let options = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set("charset", "utf8")
        .set("accept", "application/pdf");
      return this.http.post(
        `${this.baseUrl}/print`,
        JSON.stringify(params),
        { responseType: 'blob', headers: options }
      );
    } catch (error) {
      return throwError(error);
    }
  }
}
