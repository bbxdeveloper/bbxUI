import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetOriginsParamListModel } from '../models/GetOriginsParamListModel';
import { GetOriginsResponse } from '../models/GetOriginsResponse';
import { GetOriginParamListModel } from '../models/GetOriginParamListModel';
import { Origin } from '../models/Origin';
import { CreateOriginRequest } from '../models/CreateOriginRequest';
import { CreateOriginResponse } from '../models/CreateOriginResponse';
import { UpdateOriginRequest } from '../models/UpdateOriginRequest';
import { UpdateOriginResponse } from '../models/UpdateOriginResponse';
import { DeleteOriginRequest } from '../models/DeleteOriginRequest';
import { DeleteOriginResponse } from '../models/DeleteOriginResponse';

@Injectable({
  providedIn: 'root'
})
export class OriginService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + '/Origin';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetOriginsParamListModel): Observable<GetOriginsResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetOriginsParamListModel] != undefined && params[key as keyof GetOriginsParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetOriginsParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetOriginsParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetOriginsResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetOriginParamListModel): Observable<Origin> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetOriginParamListModel] != undefined && params[key as keyof GetOriginParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetOriginParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetOriginParamListModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<Origin>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: CreateOriginRequest): Observable<CreateOriginResponse> {
    return this.http.post<CreateOriginResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateOriginRequest): Observable<UpdateOriginResponse> {
    return this.http.put<UpdateOriginResponse>(this.BaseUrl, req);
  }

  Delete(req: DeleteOriginRequest): Observable<DeleteOriginResponse> {
    return this.http.delete<DeleteOriginResponse>(this.BaseUrl + '?ID=' + req.id);
  }
}
