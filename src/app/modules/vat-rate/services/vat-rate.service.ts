import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetVatRatesParamListModel } from '../models/GetVatRatesParamListModel';
import { GetVatRateParamListModel } from '../models/GetVatRateParamListModel';
import { VatRate } from '../models/VatRate';
import { GetVatRatesResponse } from '../models/GetVatRatesResponse';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

@Injectable({
  providedIn: 'root'
})
export class VatRateService {
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'VatRate';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetVatRatesParamListModel): Observable<GetVatRatesResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetVatRatesResponse>(this.BaseUrl + '/query' + '?' + queryParams);
  }

  Get(params?: GetVatRateParamListModel): Observable<VatRate> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<VatRate>(this.BaseUrl + '?' + queryParams);
  }
}
