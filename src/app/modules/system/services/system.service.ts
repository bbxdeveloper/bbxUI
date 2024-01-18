import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CurrencyCode } from '../models/CurrencyCode';
import { GetExchangeRateParamsModel } from '../models/GetExchangeRateParamsModel';
import { ZipInfo } from '../models/ZipInfo';
import { InvoiceType } from '../models/InvoiceType';
import {HelperFunctions} from "../../../../assets/util/HelperFunctions";
import {UserLevel} from "../models/UserLevel";

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'System';

  constructor(private http: HttpClient) { }

  public GetAllCurrencyCodes(): Observable<CurrencyCode[]> {
    return this.http.get<CurrencyCode[]>(this.BaseUrl + '/currencycodes');
  }

  public GetExchangeRate(params: GetExchangeRateParamsModel): Observable<number> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<number>(this.BaseUrl + '/exchangerate' + '?' + queryParams);
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

  public userLevels(): Observable<UserLevel[]> {
    return this.http.get<UserLevel[]>(this.BaseUrl + '/userlevels')
  }
}
