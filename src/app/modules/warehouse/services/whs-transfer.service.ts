import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, firstValueFrom, lastValueFrom, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateWhsTransferRequest } from '../models/whs/CreateWhsTransferRequest';
import { CreateWhsTransferResponse } from '../models/whs/CreateWhsTransferResponse';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { IResponseSingleData } from 'src/assets/model/IResponse';
import { GetWhsTransfersResponse } from '../models/whs/GetWhsTransfersResponse';
import { WhsTransferFull, WhsTransferBase, WhsTransferUpdate } from '../models/whs/WhsTransfer';
import { WhsTransferQueryParams } from '../models/whs/WhsTransferQueryParams';
import { WhsTransferStatus } from '../models/whs/WhsTransferStatus';

export enum WhsStatus {
  /** Elkészült */
  READY = "READY",
  /** Feldolgozott */
  COMPLETED = "COMPLETED"
}

@Injectable()
export class WhsTransferService {

  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}/WhsTransfer`

  constructor(private http: HttpClient, private cs: CommonService) { }

  public async create(params: CreateWhsTransferRequest): Promise<CreateWhsTransferResponse> {
    const request = this.http.post<CreateWhsTransferResponse>(this.baseUrl, params)

    return firstValueFrom(request)
  }

  public async update(req: WhsTransferUpdate): Promise<IResponseSingleData<WhsTransferFull>> {
    const request = this.http.put<IResponseSingleData<WhsTransferFull>>(this.baseUrl, req);

    return firstValueFrom(request)
  }

  public getReport(params: Constants.Dct): Observable<any> {
    try {
      let options = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set("charset", "utf8")
        .set("accept", "application/pdf");
      return this.http.post(
        `${this.baseUrl}/print`,
        JSON.stringify(params),
        { responseType: 'blob', headers: options }
      );
    } catch (error) {
      return throwError(error);
    }
  }

  GetAll(params?: WhsTransferQueryParams): Observable<GetWhsTransfersResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof WhsTransferQueryParams] != undefined && params[key as keyof WhsTransferQueryParams] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof WhsTransferQueryParams];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof WhsTransferQueryParams];
          }
          index++;
        }
      });
    }

    return this.http.get<GetWhsTransfersResponse>(this.baseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  async GetAllPromise(params?: WhsTransferQueryParams): Promise<GetWhsTransfersResponse> {
    return lastValueFrom(this.GetAll(params).pipe(
      catchError((err, c) => {
        this.cs.HandleError(err);
        return c;
      })
    ));
  }

  Get(params?: WhsTransferQueryParams): Observable<WhsTransferFull> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof WhsTransferQueryParams] != undefined && params[key as keyof WhsTransferQueryParams] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof WhsTransferQueryParams];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof WhsTransferQueryParams];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<WhsTransferFull>(this.baseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Delete(id: number): Observable<IResponseSingleData<WhsTransferFull>> {
    return this.http.delete<IResponseSingleData<WhsTransferFull>>(this.baseUrl + '?ID=' + id);
  }

  GetTemporaryWhsTransferStatus(): WhsTransferStatus[] {
    return [{
      value: "-1",
      text: "Feltöltés alatt..."
    }] as WhsTransferStatus[];
  }

  GetPaymentWhsTransferStatuses(): Observable<WhsTransferStatus[]> {
    return this.http.get<WhsTransferStatus[]>(this.baseUrl + '/whstransferstatus');
  }

  async GetAllWhsTransferStatusPromise(): Promise<WhsTransferStatus[]> {
    return lastValueFrom(this.GetPaymentWhsTransferStatuses().pipe(
      catchError((err, c) => {
        this.cs.HandleError(err);
        return c;
      })
    ));
  }

  GetReport(params: Constants.Dct): Observable<any> {
    try {
      let options = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set("charset", "utf8")
        .set("accept", "application/pdf");
      return this.http.post(
        `${this.baseUrl}/print`,
        JSON.stringify(params),
        { responseType: 'blob', headers: options }
      );
    } catch (error) {
      return throwError(error);
    }
  }
}
