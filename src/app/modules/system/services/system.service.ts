import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CurrencyCode } from '../models/CurrencyCode';
import { GetExchangeRateParamsModel } from '../models/GetExchangeRateParamsModel';
import { ZipInfo } from '../models/ZipInfo';
import { InvoiceType } from '../models/InvoiceType';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + '/System';

  constructor(private http: HttpClient) { }

  public GetAllCurrencyCodes(): Observable<CurrencyCode[]> {
    return this.http.get<CurrencyCode[]>(this.BaseUrl + '/currencycodes');
  }

  public GetExchangeRate(params: GetExchangeRateParamsModel): Observable<number> {
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

  public CityByZip(zip: number | string): Observable<ZipInfo> {
    return this.http.get<ZipInfo>(this.BaseUrl + '/citybyzip?ZipCode=' + zip);
  }

  public ZipByCity(city: string): Observable<ZipInfo> {
    return this.http.get<ZipInfo>(this.BaseUrl + '/zipbycity?ZipCity=' + city);
  }

  public getInvoiceTypes(): Promise<InvoiceType[]> {
    const request = this.http.get<InvoiceType[]>(this.BaseUrl + '/invoicetypes')
    return firstValueFrom(request)
  }

  public releaseLockedCustomers(): Observable<unknown> {
    return this.http.post(this.BaseUrl + '/unlockallcustomers', {})
  }
}
