import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetCustDiscountParamsModel } from '../models/GetCustDiscountParamsModel';
import { GetCustDiscountByCustomerParamsModel } from '../models/GetCustDiscountByCustomerParamsModel';
import { CreateCustDiscountRequest } from '../models/CreateCustDiscountRequest';
import { CreateCustDiscountResponse } from '../models/CreateCustDiscountResponse';
import { CustDiscountForGet } from '../models/CustDiscount';

@Injectable({
  providedIn: 'root'
})
export class CustomerDiscountService {
  // https://bbxbe.azurewebsites.net/api/v1/CustDiscount/discountforcustomer?CustomerID=1
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'CustDiscount';

  constructor(private http: HttpClient) { }

  Get(params?: GetCustDiscountParamsModel): Observable<CustDiscountForGet> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetCustDiscountParamsModel] != undefined && params[key as keyof GetCustDiscountParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetCustDiscountParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetCustDiscountParamsModel];
          }
          index++;
        }
      });
    }

    return this.http.get<CustDiscountForGet>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  public GetByCustomer(params?: GetCustDiscountByCustomerParamsModel): Observable<CustDiscountForGet[]> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetCustDiscountByCustomerParamsModel] != undefined && params[key as keyof GetCustDiscountByCustomerParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetCustDiscountByCustomerParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetCustDiscountByCustomerParamsModel];
          }
          index++;
        }
      });
    }

    return this.http.get<CustDiscountForGet[]>(this.BaseUrl + '/discountforcustomer' + (!!params ? ('?' + queryParams) : ''));
  }

  public getByCustomerAsync(params: GetCustDiscountByCustomerParamsModel): Promise<CustDiscountForGet[]> {
    return firstValueFrom(this.GetByCustomer(params))
  }

  Create(req: CreateCustDiscountRequest): Observable<CreateCustDiscountResponse> {
    return this.http.post<CreateCustDiscountResponse>(this.BaseUrl, req);
  }
}
