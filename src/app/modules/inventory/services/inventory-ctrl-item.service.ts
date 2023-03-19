import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
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
import { GetLatestIccRequest } from '../models/GetLatestIccRequest';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { CreateIccRequest } from '../models/CreateIccRequest';

@Injectable({
  providedIn: 'root'
})
export class InventoryCtrlItemService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'InvCtrl';

  constructor(private http: HttpClient) { }

  GetAbsentReport(params: Constants.Dct): Observable<any> {
    try {
      let options = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set("charset", "utf8")
        .set("accept", "application/pdf");
      return this.http.post(
        `${this.BaseUrl}/report`,
        JSON.stringify(params),
        { responseType: 'blob', headers: options }
      );
    } catch (error) {
      return throwError(error);
    }
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
    return this.http.post<CreateInvCtrlItemResponse>(this.BaseUrl + '/creicp', req);
  }

  public getLatestIcc(params: GetLatestIccRequest): Promise<unknown> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)
    const response = this.http.get(this.BaseUrl + '/getlatesticc?' + queryParams)

    return firstValueFrom(response)
  }

  public createIcc(params: CreateIccRequest[]): Promise<unknown> {
    const json = JSON.stringify(params)
    const headers = new HttpHeaders()
     .set('Content-Type', 'application/json')
     .set('charset', 'utf8')

    const response = this.http.post<unknown>(this.BaseUrl + '/creicc', json, { headers })

    return firstValueFrom(response)
  }
}
