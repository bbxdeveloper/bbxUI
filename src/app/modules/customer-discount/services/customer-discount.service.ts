import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetCustDiscountParamsModel } from '../models/GetCustDiscountParamsModel';
import { GetCustDiscountByCustomerParamsModel } from '../models/GetCustDiscountByCustomerParamsModel';
import { CreateCustDiscountRequest } from '../models/CreateCustDiscountRequest';
import { CreateCustDiscountResponse } from '../models/CreateCustDiscountResponse';
import { CustDiscountForGet } from '../models/CustDiscount';
import {HelperFunctions} from "../../../../assets/util/HelperFunctions";

@Injectable({
  providedIn: 'root'
})
export class CustomerDiscountService {
  // https://bbxbe.azurewebsites.net/api/v1/CustDiscount/discountforcustomer?CustomerID=1
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'CustDiscount';

  constructor(private http: HttpClient) { }

  Get(params?: GetCustDiscountParamsModel): Observable<CustDiscountForGet> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<CustDiscountForGet>(this.BaseUrl + '?' + queryParams);
  }

  public GetByCustomer(params?: GetCustDiscountByCustomerParamsModel): Observable<CustDiscountForGet[]> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<CustDiscountForGet[]>(this.BaseUrl + '/discountforcustomer' + '?' + queryParams);
  }

  public getByCustomerAsync(params: GetCustDiscountByCustomerParamsModel): Promise<CustDiscountForGet[]> {
    return firstValueFrom(this.GetByCustomer(params))
  }

  Create(req: CreateCustDiscountRequest): Observable<CreateCustDiscountResponse> {
    return this.http.post<CreateCustDiscountResponse>(this.BaseUrl, req);
  }
}
