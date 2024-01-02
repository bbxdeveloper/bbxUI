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
import {HelperFunctions} from "../../../../assets/util/HelperFunctions";

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly StockBaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'Stock';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetStocksParamsModel): Observable<GetStocksResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetStocksResponse>(this.StockBaseUrl + '/query' + '?' + queryParams);
  }

  Record(params?: GetStockRecordParamsModel): Observable<StockRecord> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<StockRecord>(this.StockBaseUrl + '/record' + '?' + queryParams);
  }

  public getProductStock(productId: string|number): Promise<ProductStock[]> {
    return firstValueFrom(this.http.get<ProductStock[]>(this.StockBaseUrl + '/productstocks' + '?ProductID=' + productId))
  }

  Get(params?: GetStockParamsModel): Observable<Stock> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<Stock>(this.StockBaseUrl + '?' + queryParams);
  }

  GetAllAbsent(params?: GetAllInvCtrlAbsentParamsModel): Observable<GetAllInvCtrlAbsentResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetAllInvCtrlAbsentResponse>(this.StockBaseUrl + "/queryinvctrlabsent" + '?' + queryParams);
  }

  UpdateLocation(request: UpdateStockLocationRequest): Observable<UpdateStockLocationResponse> {
    return this.http.put<UpdateStockLocationResponse>(this.StockBaseUrl + "/updatelocation", request);
  }
}
