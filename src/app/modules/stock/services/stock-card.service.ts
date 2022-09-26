import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetStockCardsResponse } from '../models/GetStockCardsResponse';
import { GetStockCardsParamsModel } from '../models/GetStockCardsParamsModel';
import { GetStockCardParamsModel } from '../models/GetStockCardParamsModel';
import { GetStockCardResponse } from '../models/GetStockCardResponse';

@Injectable({
  providedIn: 'root'
})
export class StockCardService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'StockCard';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetStockCardsParamsModel): Observable<GetStockCardsResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetStockCardsParamsModel] != undefined && params[key as keyof GetStockCardsParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetStockCardsParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetStockCardsParamsModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetStockCardsResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetStockCardParamsModel): Observable<GetStockCardResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetStockCardParamsModel] != undefined && params[key as keyof GetStockCardParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetStockCardParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetStockCardParamsModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<GetStockCardResponse>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }
}
