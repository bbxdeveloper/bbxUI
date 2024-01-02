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
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'InvCtrlPeriod';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetAllInvCtrlPeriodsParamListModel): Observable<GetAllInvCtrlPeriodsResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetAllInvCtrlPeriodsResponse>(this.BaseUrl + '/query' + '?' + queryParams);
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
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<InvCtrlPeriod>(this.BaseUrl + '?' + queryParams);
  }

  Create(req: CreateInvCtrlPeriodRequest): Observable<CreateInvCtrlPeriodResponse> {
    return this.http.post<CreateInvCtrlPeriodResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateInvCtrlPeriodRequest): Observable<UpdateInvCtrlPeriodResponse> {
    return this.http.put<UpdateInvCtrlPeriodResponse>(this.BaseUrl, req);
  }

  Delete(params: DeleteInvCtrlPeriodParamListModel): Observable<DeleteInvCtrlPeriodResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.delete<DeleteInvCtrlPeriodResponse>(this.BaseUrl + '?' + queryParams);
  }

  Close(params: CloseInvCtrlPeriodParamListModel): Observable<CloseInvCtrlPeriodResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.patch<CloseInvCtrlPeriodResponse>(this.BaseUrl + '/close' + '?' + queryParams, {}, {});
  }
}
