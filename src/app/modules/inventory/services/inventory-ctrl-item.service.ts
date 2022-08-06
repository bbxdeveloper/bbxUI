import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetInvCtrlItemParamListModel } from '../models/GetInvCtrlItemParamListModel';
import { InvCtrlItem } from '../models/InvCtrlItem';
import { CreateInvCtrlItemRequest } from '../models/CreateInvCtrlItemRequest';
import { CreateInvCtrlItemResponse } from '../models/CreateInvCtrlItemResponse';
import { GetAllInvCtrlItemsParamListModel } from '../models/GetAllInvCtrlItemsParamListModel';
import { GetAllInvCtrlItemsResponse } from '../models/GetAllInvCtrlItemsResponse';
import { GetAllInvCtrlPeriodsParamListModel } from '../models/GetAllInvCtrlPeriodsParamListModel';
import { GetAllInvCtrlPeriodsResponse } from '../models/GetAllInvCtrlPeriodsResponse';

@Injectable({
  providedIn: 'root'
})
export class InventoryCtrlItemService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'InvCtrlItem';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetAllInvCtrlItemsParamListModel): Observable<GetAllInvCtrlItemsResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetAllInvCtrlItemsParamListModel] != undefined && params[key as keyof GetAllInvCtrlItemsParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetAllInvCtrlItemsParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetAllInvCtrlItemsParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetAllInvCtrlItemsResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  GetAllRecords(params?: GetAllInvCtrlPeriodsParamListModel): Observable<GetAllInvCtrlPeriodsResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetAllInvCtrlPeriodsParamListModel] != undefined && params[key as keyof GetAllInvCtrlPeriodsParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetAllInvCtrlPeriodsParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetAllInvCtrlPeriodsParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetAllInvCtrlPeriodsResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetInvCtrlItemParamListModel): Observable<InvCtrlItem> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetInvCtrlItemParamListModel] != undefined && params[key as keyof GetInvCtrlItemParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetInvCtrlItemParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetInvCtrlItemParamListModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<InvCtrlItem>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: CreateInvCtrlItemRequest): Observable<CreateInvCtrlItemResponse> {
    return this.http.post<CreateInvCtrlItemResponse>(this.BaseUrl, req);
  }
}
