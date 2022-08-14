import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetInvCtrlItemParamListModel } from '../models/GetInvCtrlItemParamListModel';
import { InvCtrlItemForGet, InvCtrlItemLine } from '../models/InvCtrlItem';
import { CreateInvCtrlItemRequest } from '../models/CreateInvCtrlItemRequest';
import { CreateInvCtrlItemResponse } from '../models/CreateInvCtrlItemResponse';
import { GetAllInvCtrlItemsParamListModel } from '../models/GetAllInvCtrlItemsParamListModel';
import { GetAllInvCtrlItemsResponse } from '../models/GetAllInvCtrlItemsResponse';
import { GetAllInvCtrlPeriodsParamListModel } from '../models/GetAllInvCtrlPeriodsParamListModel';
import { GetAllInvCtrlPeriodsResponse } from '../models/GetAllInvCtrlPeriodsResponse';
import { InvCtrl } from '../models/InvCtrl';
import { GetAllInvCtrlItemRecordsParamListModel } from '../models/GetAllInvCtrlItemRecordsParamListModel';
import { Constants } from 'src/assets/util/Constants';

@Injectable({
  providedIn: 'root'
})
export class InventoryCtrlItemService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'InvCtrlICP';

  constructor(private http: HttpClient) { }

  GetReport(params: Constants.Dct): Observable<any> {
    let options = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set("charset", "utf8")
      .set("accept", "application/pdf");
    return this.http.post(
      `${this.BaseUrl}/print`,
      JSON.stringify(params['report_params']),
      { responseType: 'blob', headers: options }
    );
  }

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

  GetAllRecords(params?: GetAllInvCtrlItemRecordsParamListModel): Observable<InvCtrl> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetAllInvCtrlItemRecordsParamListModel] != undefined && params[key as keyof GetAllInvCtrlItemRecordsParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetAllInvCtrlItemRecordsParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetAllInvCtrlItemRecordsParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.get<InvCtrl>(this.BaseUrl + '/record' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetInvCtrlItemParamListModel): Observable<InvCtrlItemForGet> {
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
    return this.http.get<InvCtrlItemForGet>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: CreateInvCtrlItemRequest): Observable<CreateInvCtrlItemResponse> {
    return this.http.post<CreateInvCtrlItemResponse>(this.BaseUrl, req);
  }
}
