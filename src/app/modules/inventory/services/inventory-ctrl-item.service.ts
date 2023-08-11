import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetInvCtrlItemParamListModel } from '../models/GetInvCtrlItemParamListModel';
import { InvCtrlItemForGet } from '../models/InvCtrlItem';
import { CreateInvCtrlItemRequest } from '../models/CreateInvCtrlItemRequest';
import { CreateInvCtrlItemResponse } from '../models/CreateInvCtrlItemResponse';
import { GetAllInvCtrlItemsParamListModel } from '../models/GetAllInvCtrlItemsParamListModel';
import { GetAllInvCtrlItemsResponse } from '../models/GetAllInvCtrlItemsResponse';
import { InvCtrl } from '../models/InvCtrl';
import { GetAllInvCtrlItemRecordsParamListModel } from '../models/GetAllInvCtrlItemRecordsParamListModel';
import { Constants } from 'src/assets/util/Constants';
import { GetLatestIccRequest } from '../models/GetLatestIccRequest';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { CreateIccRequest } from '../models/CreateIccRequest';
import { GetLatestIccResponse } from '../models/GetLatestIccResponse';

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
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetAllInvCtrlItemsResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  GetAllRecords(params?: GetAllInvCtrlItemRecordsParamListModel): Observable<InvCtrl> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<InvCtrl>(this.BaseUrl + '/record' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetInvCtrlItemParamListModel): Observable<InvCtrlItemForGet> {
    var queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<InvCtrlItemForGet>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: CreateInvCtrlItemRequest): Observable<CreateInvCtrlItemResponse> {
    return this.http.post<CreateInvCtrlItemResponse>(this.BaseUrl + '/creicp', req);
  }

  public getLatestIcc(params: GetLatestIccRequest): Promise<GetLatestIccResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)
    const response = this.http.get<GetLatestIccResponse>(this.BaseUrl + '/getlatesticc?' + queryParams)

    return firstValueFrom(response)
  }

  public createIcc(params: CreateIccRequest[]): Promise<unknown> {
    const items = {
      items: params
    }
    const json = JSON.stringify(items)

    const headers = new HttpHeaders()
     .set('Content-Type', 'application/json')
     .set('charset', 'utf8')

    const response = this.http.post<unknown>(this.BaseUrl + '/creicc', json, { headers })

    return firstValueFrom(response)
  }
}
