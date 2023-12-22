import { Injectable } from '@angular/core';
import { catchError, lastValueFrom, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { CreateInvPaymentResponse } from '../models/CreateInvPaymentResponse';
import { GetInvPaymentsParamListModel } from '../models/GetInvPaymentsParamListModel';
import { GetInvPaymentsResponse } from '../models/GetInvPaymentsResponse';
import { InvPayment } from '../models/InvPayment';

@Injectable({
  providedIn: 'root'
})
export class EqualizationsService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'InvPayment';

  constructor(private http: HttpClient, private cs: CommonService) { }

  GetAll(params?: GetInvPaymentsParamListModel): Observable<GetInvPaymentsResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetInvPaymentsParamListModel] != undefined && params[key as keyof GetInvPaymentsParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetInvPaymentsParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetInvPaymentsParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetInvPaymentsResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  async GetAllPromise(params?: GetInvPaymentsParamListModel): Promise<GetInvPaymentsResponse> {
    return lastValueFrom(this.GetAll(params).pipe(
      catchError((err, c) => {
        this.cs.HandleError(err);
        return c;
      })
    ));
  }

  Create(req: InvPayment): Observable<CreateInvPaymentResponse> {
    let options = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set("charset", "utf8")
    return this.http.post<CreateInvPaymentResponse>(this.BaseUrl, req, { headers: options });
  }
}
