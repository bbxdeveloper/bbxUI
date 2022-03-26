import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetVatRatesParamListModel } from '../models/GetVatRatesParamListModel';
import { GetVatRateParamListModel } from '../models/GetVatRateParamListModel';
import { VatRate } from '../models/VatRate';
import { GetVatRatesResponse } from '../models/GetVatRatesResponse';

@Injectable({
  providedIn: 'root'
})
export class VatRateService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'VatRate';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetVatRatesParamListModel): Observable<GetVatRatesResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetVatRatesParamListModel] != undefined && params[key as keyof GetVatRatesParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetVatRatesParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetVatRatesParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetVatRatesResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetVatRateParamListModel): Observable<VatRate> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetVatRateParamListModel] != undefined && params[key as keyof GetVatRateParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetVatRateParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetVatRateParamListModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<VatRate>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }
}
