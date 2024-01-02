import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetStockCardsResponse } from '../models/GetStockCardsResponse';
import { GetStockCardsParamsModel } from '../models/GetStockCardsParamsModel';
import { GetStockCardParamsModel } from '../models/GetStockCardParamsModel';
import { GetStockCardResponse } from '../models/GetStockCardResponse';
import {HelperFunctions} from "../../../../assets/util/HelperFunctions";

@Injectable({
  providedIn: 'root'
})
export class StockCardService {
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'StockCard';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetStockCardsParamsModel): Observable<GetStockCardsResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetStockCardsResponse>(this.BaseUrl + '/query' + '?' + queryParams);
  }

  Get(params?: GetStockCardParamsModel): Observable<GetStockCardResponse> {
    const queryParams = '';

    return this.http.get<GetStockCardResponse>(this.BaseUrl + '?' + queryParams);
  }
}
