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

// 'id', 'customerName', 'taxPayerNumber'
const MOCK_DATA: Customer[] = [
  { id: 0, customerName: "Mock 1", taxPayerNumber:  "1237567-8-90" } as Customer,
  { id: 1, customerName: "Mock 2", taxPayerNumber:  "1233567-8-90" } as Customer,
  { id: 2, customerName: "Mock 3", taxPayerNumber:  "1238567-8-90" } as Customer,
  { id: 3, customerName: "Mock 4", taxPayerNumber:  "1234234-8-90" } as Customer,
  { id: 4, customerName: "Mock 5", taxPayerNumber:  "1234867-8-90" } as Customer,
  { id: 5, customerName: "Mock 6", taxPayerNumber:  "9234567-8-90" } as Customer,
  { id: 6, customerName: "Mock 7", taxPayerNumber:  "1134567-8-90" } as Customer,
  { id: 7, customerName: "Mock 8", taxPayerNumber:  "1234567-8-93" } as Customer,
  { id: 8, customerName: "Mock 9", taxPayerNumber:  "1234567-8-67" } as Customer,
  { id: 9, customerName: "Mock 10", taxPayerNumber:  "1234567-8-97" } as Customer,
  { id: 10, customerName: "Mock 11", taxPayerNumber:  "1234567-8-30" } as Customer,
  { id: 11, customerName: "Mock 12", taxPayerNumber:  "1234567-8-91" } as Customer,
  { id: 12, customerName: "Mock 13", taxPayerNumber:  "1234567-8-70" } as Customer,
  { id: 13, customerName: "Mock 14", taxPayerNumber:  "1234567-4-90" } as Customer,
  { id: 14, customerName: "Mock 15", taxPayerNumber:  "1234567-6-90" } as Customer,
  { id: 15, customerName: "Mock 16", taxPayerNumber:  "1234567-2-90" } as Customer,
  { id: 16, customerName: "Mock 17", taxPayerNumber:  "1234567-1-90" } as Customer,
  { id: 17, customerName: "Mock 18", taxPayerNumber:  "1234567-0-90" } as Customer,
  { id: 18, customerName: "Mock 19", taxPayerNumber:  "1234567-9-90" } as Customer,
  { id: 19, customerName: "Mock 20", taxPayerNumber:  "1231510-0-01" } as Customer
];

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
    
    // return of({
    //   pageSize: 20,
    //   pageNumber: 1,
    //   succeeded: true,
    //   data: MOCK_DATA,
    //   recordsTotal: 20,
    //   recordsFiltered: 0
    // } as GetCustomersResponse);
    
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

  CreateCustomer(req: Customer): Observable<CreateCustomerResponse> {
    return this.http.post<CreateCustomerResponse>(this.BaseUrl, req);
  }

  UpdateCustomer(req: UpdateCustomerRequest): Observable<UpdateCustomerResponse> {
    return this.http.put<UpdateCustomerResponse>(this.BaseUrl, req);
  }

  DeleteCustomer(req: DeleteCustomerRequest): Observable<DeleteCustomerResponse> {
    return this.http.delete<DeleteCustomerResponse>(this.BaseUrl, { body: req });
  }
}
