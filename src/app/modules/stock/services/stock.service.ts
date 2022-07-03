import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetStocksResponse } from '../models/GetStocksResponse';
import { GetStocksParamsModel } from '../models/GetStocksParamsModel';
import { GetStockParamsModel } from '../models/GetStockParamsModel';
import { GetStockResponse } from '../models/GetStockResponse';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'Stock';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetStocksParamsModel): Observable<GetStocksResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetStocksParamsModel] != undefined && params[key as keyof GetStocksParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetStocksParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetStocksParamsModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetStocksResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetStockParamsModel): Observable<GetStockResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetStockParamsModel] != undefined && params[key as keyof GetStockParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetStockParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetStockParamsModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<GetStockResponse>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }
}
