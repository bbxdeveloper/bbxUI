import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CurrencyCode } from '../models/CurrencyCode';
import { GetExchangeRateParamsModel } from '../models/GetExchangeRateParamsModel';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'System';

  constructor(private http: HttpClient) { }

  GetAllCurrencyCodes(): Observable<CurrencyCode[]> {
    return this.http.get<CurrencyCode[]>(this.BaseUrl + '/currencycodes');
  }

  GetExchangeRate(params: GetExchangeRateParamsModel): Observable<number> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetExchangeRateParamsModel] != undefined && params[key as keyof GetExchangeRateParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetExchangeRateParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetExchangeRateParamsModel];
          }
          index++;
        }
      });
    }

    return this.http.get<number>(this.BaseUrl + '/exchangerate' + (!!params ? ('?' + queryParams) : ''));
  }
}
