import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetInvCtrlPeriodParamListModel } from '../models/GetInvCtrlPeriodParamListModel';
import { InvCtrlPeriod } from '../models/InvCtrlPeriod';
import { CreateInvCtrlPeriodRequest } from '../models/CreateInvCtrlPeriodRequest';
import { CreateInvCtrlPeriodResponse } from '../models/CreateInvCtrlPeriodResponse';
import { UpdateInvCtrlPeriodResponse } from '../models/UpdateInvCtrlPeriodResponse';
import { UpdateInvCtrlPeriodRequest } from '../models/UpdateInvCtrlPeriodRequest';
import { DeleteInvCtrlPeriodResponse } from '../models/DeleteInvCtrlPeriodResponse';
import { DeleteInvCtrlPeriodParamListModel } from '../models/DeleteInvCtrlPeriodParamListModel';
import { GetAllInvCtrlPeriodsParamListModel } from '../models/GetAllInvCtrlPeriodsParamListModel';
import { GetAllInvCtrlPeriodsResponse } from '../models/GetAllInvCtrlPeriodsResponse';
import { CloseInvCtrlPeriodParamListModel } from '../models/CloseInvCtrlPeriodParamListModel';
import { CloseInvCtrlPeriodResponse } from '../models/CloseInvCtrlPeriodResponse';
import { Constants } from 'src/assets/util/Constants';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'InvCtrlPeriod';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetAllInvCtrlPeriodsParamListModel): Observable<GetAllInvCtrlPeriodsResponse> {
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

  GetReport(params: Constants.Dct): Observable<any> {
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

  Get(params?: GetInvCtrlPeriodParamListModel): Observable<InvCtrlPeriod> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetInvCtrlPeriodParamListModel] != undefined && params[key as keyof GetInvCtrlPeriodParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetInvCtrlPeriodParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetInvCtrlPeriodParamListModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<InvCtrlPeriod>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: CreateInvCtrlPeriodRequest): Observable<CreateInvCtrlPeriodResponse> {
    return this.http.post<CreateInvCtrlPeriodResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateInvCtrlPeriodRequest): Observable<UpdateInvCtrlPeriodResponse> {
    return this.http.put<UpdateInvCtrlPeriodResponse>(this.BaseUrl, req);
  }

  Delete(params: DeleteInvCtrlPeriodParamListModel): Observable<DeleteInvCtrlPeriodResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof DeleteInvCtrlPeriodParamListModel] != undefined && params[key as keyof DeleteInvCtrlPeriodParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof DeleteInvCtrlPeriodParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof DeleteInvCtrlPeriodParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.delete<DeleteInvCtrlPeriodResponse>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Close(params: CloseInvCtrlPeriodParamListModel): Observable<CloseInvCtrlPeriodResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof DeleteInvCtrlPeriodParamListModel] != undefined && params[key as keyof DeleteInvCtrlPeriodParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof DeleteInvCtrlPeriodParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof DeleteInvCtrlPeriodParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.patch<CloseInvCtrlPeriodResponse>(this.BaseUrl + '/close' + (!!params ? ('?' + queryParams) : ''), {}, {});
  }
}
