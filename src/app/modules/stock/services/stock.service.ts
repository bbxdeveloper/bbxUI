import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetStocksResponse } from '../models/GetStocksResponse';
import { GetStocksParamsModel } from '../models/GetStocksParamsModel';
import { GetStockParamsModel } from '../models/GetStockParamsModel';
import { GetStockResponse } from '../models/GetStockResponse';
import { GetStockRecordParamsModel } from '../models/GetStockRecordParamsModel';
import { Stock } from '../models/Stock';
import { StockRecord } from '../models/StockRecord';
import { GetAllInvCtrlAbsentParamsModel } from '../models/GetAllInvCtrlAbsentParamsModel';
import { GetAllInvCtrlAbsentResponse } from '../models/GetAllInvCtrlAbsentResponse';
import { UpdateStockLocationRequest } from '../models/UpdateStockLocationRequest';
import { UpdateStockLocationResponse } from '../models/UpdateStockLocationResponse';
import { ProductStock } from '../models/ProductStock';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly StockBaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'Stock';

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

    return this.http.get<GetStocksResponse>(this.StockBaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Record(params?: GetStockRecordParamsModel): Observable<StockRecord> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetStockRecordParamsModel] != undefined && params[key as keyof GetStockRecordParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetStockRecordParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetStockRecordParamsModel];
          }
          index++;
        }
      });
    }

    return this.http.get<StockRecord>(this.StockBaseUrl + '/record' + (!!params ? ('?' + queryParams) : ''));
  }

  public getProductStock(productId: string|number): Promise<ProductStock[]> {
    return firstValueFrom(this.http.get<ProductStock[]>(this.StockBaseUrl + '/productstocks' + '?ProductID=' + productId))
  }

  Get(params?: GetStockParamsModel): Observable<Stock> {
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
    return this.http.get<Stock>(this.StockBaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  GetAllAbsent(params?: GetAllInvCtrlAbsentParamsModel): Observable<GetAllInvCtrlAbsentResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetAllInvCtrlAbsentParamsModel] != undefined && params[key as keyof GetAllInvCtrlAbsentParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetAllInvCtrlAbsentParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetAllInvCtrlAbsentParamsModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetAllInvCtrlAbsentResponse>(this.StockBaseUrl + "/queryinvctrlabsent" + (!!params ? ('?' + queryParams) : ''));
  }

  UpdateLocation(request: UpdateStockLocationRequest): Observable<UpdateStockLocationResponse> {
    return this.http.put<UpdateStockLocationResponse>(this.StockBaseUrl + "/updatelocation", request);
  }
}
