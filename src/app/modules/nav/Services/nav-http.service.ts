import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { IQueryExchangeResponse } from '../Models/QueryExchangeResponse';
import { IQueryExchangeRequest } from '../Models/QueryExchangeRequest';
import { Constants } from 'src/assets/util/Constants';

@Injectable({
  providedIn: 'root'
})
export class NavHttpService {
  private readonly baseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'NAV/'

  constructor(private readonly http: HttpClient) { }

  public exchange(params: IQueryExchangeRequest): Observable<IQueryExchangeResponse> {
    const query = HelperFunctions.ParseObjectAsQueryString(params)
    return this.http.get<IQueryExchangeResponse>(this.baseUrl + 'queryxchange?' + query)
  }

  public exchangeAsXml(params: Constants.Dct): Observable<unknown> {
    return this.http.get(this.baseUrl + 'getxchangexml?ID=' + (params as any).id, { observe: 'response', responseType: 'text' })
  }
}
