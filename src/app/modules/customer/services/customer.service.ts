import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetCustomersParamListModel } from '../models/GetCustomersParamListModel';
import { GetCustomersResponse } from '../models/GetCustomersResponse';
import { GetCustomerParamListModel } from '../models/GetCustomerParamListModel';
import { Customer } from '../models/Customer';
import { CreateCustomerRequest } from '../models/CreateCustomerRequest';
import { CreateCustomerResponse } from '../models/CreateCustomerResponse';
import { UpdateCustomerResponse } from '../models/UpdateCustomerResponse';
import { UpdateCustomerRequest } from '../models/UpdateCustomerRequest';
import { DeleteCustomerRequest } from '../models/DeleteCustomerRequest';
import { DeleteCustomerResponse } from '../models/DeleteCustomerResponse';

const MOCK_CUSTOMERS = {
  "pageNumber": 1,
  "pageSize": 10,
  "recordsFiltered": 1,
  "recordsTotal": 1,
  "succeeded": true,
  "data": [
    {} as Customer
  ]
} as GetCustomersResponse;

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'Customer';

  constructor(private http: HttpClient) { }

  GetCustomers(params?: GetCustomersParamListModel): Observable<GetCustomersResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetCustomersParamListModel] != undefined && params[key as keyof GetCustomersParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetCustomersParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetCustomersParamListModel];
          }
          index++;
        }
      });
    }

    // console.log(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : '')); // TODO: only for debug

    // Get
    return this.http.get<GetCustomersResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  GetCustomer(params?: GetCustomerParamListModel): Observable<Customer> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetCustomerParamListModel] != undefined && params[key as keyof GetCustomerParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetCustomerParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetCustomerParamListModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<Customer>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  CreateCustomer(req: CreateCustomerRequest): Observable<CreateCustomerResponse> {
    return this.http.post<CreateCustomerResponse>(this.BaseUrl, req);
  }

  UpdateCustomer(req: UpdateCustomerRequest): Observable<UpdateCustomerResponse> {
    return this.http.put<UpdateCustomerResponse>(this.BaseUrl, req);
  }

  DeleteCustomer(req: DeleteCustomerRequest): Observable<DeleteCustomerResponse> {
    return this.http.delete<DeleteCustomerResponse>(this.BaseUrl, { body: req });
  }
}
