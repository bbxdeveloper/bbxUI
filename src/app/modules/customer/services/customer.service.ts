import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
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
import { CountryCode } from '../models/CountryCode';
import { GetCustomerByTaxNumberParams } from '../models/GetCustomerByTaxNumberParams';
import { GetCustomerByTaxNumberResponse } from '../models/GetCustomerByTaxNumberResponse';
import { UnitPriceType } from '../models/UnitPriceType';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

// 'id', 'customerName', 'taxpayerNumber'
const MOCK_DATA: Customer[] = [
  { id: 0, customerName: "Mock 1", taxpayerNumber:  "1237567-8-90" } as Customer,
  { id: 1, customerName: "Mock 2", taxpayerNumber:  "1233567-8-90" } as Customer,
  { id: 2, customerName: "Mock 3", taxpayerNumber:  "1238567-8-90" } as Customer,
  { id: 3, customerName: "Mock 4", taxpayerNumber:  "1234234-8-90" } as Customer,
  { id: 4, customerName: "Mock 5", taxpayerNumber:  "1234867-8-90" } as Customer,
  { id: 5, customerName: "Mock 6", taxpayerNumber:  "9234567-8-90" } as Customer,
  { id: 6, customerName: "Mock 7", taxpayerNumber:  "1134567-8-90" } as Customer,
  { id: 7, customerName: "Mock 8", taxpayerNumber:  "1234567-8-93" } as Customer,
  { id: 8, customerName: "Mock 9", taxpayerNumber:  "1234567-8-67" } as Customer,
  { id: 9, customerName: "Mock 10", taxpayerNumber:  "1234567-8-97" } as Customer,
  { id: 10, customerName: "Mock 11", taxpayerNumber:  "1234567-8-30" } as Customer,
  { id: 11, customerName: "Mock 12", taxpayerNumber:  "1234567-8-91" } as Customer,
  { id: 12, customerName: "Mock 13", taxpayerNumber:  "1234567-8-70" } as Customer,
  { id: 13, customerName: "Mock 14", taxpayerNumber:  "1234567-4-90" } as Customer,
  { id: 14, customerName: "Mock 15", taxpayerNumber:  "1234567-6-90" } as Customer,
  { id: 15, customerName: "Mock 16", taxpayerNumber:  "1234567-2-90" } as Customer,
  { id: 16, customerName: "Mock 17", taxpayerNumber:  "1234567-1-90" } as Customer,
  { id: 17, customerName: "Mock 18", taxpayerNumber:  "1234567-0-90" } as Customer,
  { id: 18, customerName: "Mock 19", taxpayerNumber:  "1234567-9-90" } as Customer,
  { id: 19, customerName: "Mock 20", taxpayerNumber:  "1231510-0-01" } as Customer
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
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'Customer';

  constructor(private http: HttpClient) { }

  public GetAllCountryCodes(): Observable<CountryCode[]> {
    return this.http.get<CountryCode[]>(this.BaseUrl + '/countrycode');
  }

  public GetAllCountryCodesAsync(): Promise<CountryCode[]> {
    return firstValueFrom(this.GetAllCountryCodes())
  }

  public GetAll(params?: GetCustomersParamListModel): Observable<GetCustomersResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);

    return this.http.get<GetCustomersResponse>(this.BaseUrl + '/query' + '?' + queryParams);
  }

  Get(params: GetCustomerParamListModel): Observable<Customer> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<Customer>(this.BaseUrl + '?' + queryParams);
  }

  GetByTaxNumber(params?: GetCustomerByTaxNumberParams): Observable<GetCustomerByTaxNumberResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);

    return this.http.get<GetCustomerByTaxNumberResponse>(this.BaseUrl + '/querytaxpayer' + '?' + queryParams);
  }

  Create(req: CreateCustomerRequest): Observable<CreateCustomerResponse> {
    return this.http.post<CreateCustomerResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateCustomerRequest): Observable<UpdateCustomerResponse> {
    return this.http.put<UpdateCustomerResponse>(this.BaseUrl, req);
  }

  Delete(req: DeleteCustomerRequest): Observable<DeleteCustomerResponse> {
    return this.http.delete<DeleteCustomerResponse>(this.BaseUrl + '?ID=' + req.id);
  }

  public getUnitPriceTypes(): Promise<UnitPriceType[]> {
    const request = this.http.get<UnitPriceType[]>(this.BaseUrl + '/unitpricetype')

    return firstValueFrom(request)
  }
}
