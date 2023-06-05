import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom, catchError, of, throwError } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { IResponseSingleData } from 'src/assets/model/IResponse';
import { Constants } from 'src/assets/util/Constants';
import { environment } from 'src/environments/environment';
import { FinalizeWhsTransferRequest } from '../models/FinalizeWhsTransferRequest';
import { GetWhsTransfersResponse } from '../models/GetWhsTransfersResponse';
import { UpdateWarehouseDocumentResponse } from '../models/UpdateWarehouseDocumentResponse';
import { WhsTransferBase, WhsTransferFull, WhsTransferUpdate } from '../models/WhsTransfer';
import { WhsTransferQueryParams } from '../models/WhsTransferQueryParams';
import { WhsTransferStatus } from '../models/WhsTransferStatus';

export enum WhsStatus {
  /** Elkészült */
  READY = "READY",
  /** Feldolgozott */
  COMPLETED = "COMPLETED"
}

@Injectable({
  providedIn: 'root'
})
export class WhsService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'WhsTransfer';

  constructor(private http: HttpClient, private cs: CommonService) { }

  GetAll(params?: WhsTransferQueryParams): Observable<GetWhsTransfersResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    // TODO: organize into util / base class with generic T parameter
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

    return this.http.get<GetWhsTransfersResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
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
    return this.http.get<WhsTransferFull>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: WhsTransferBase): Observable<IResponseSingleData<WhsTransferFull>> {
    return this.http.post<IResponseSingleData<WhsTransferFull>>(this.BaseUrl, req);
  }

  Update(req: WhsTransferUpdate): Observable<IResponseSingleData<WhsTransferFull>> {
    return this.http.put<IResponseSingleData<WhsTransferFull>>(this.BaseUrl, req);
  }

  Delete(id: number): Observable<IResponseSingleData<WhsTransferFull>> {
    return this.http.delete<IResponseSingleData<WhsTransferFull>>(this.BaseUrl + '?ID=' + id);
  }

  GetTemporaryWhsTransferStatus(): WhsTransferStatus[] {
    return [{
      value: "-1",
      text: "Feltöltés alatt..."
    }] as WhsTransferStatus[];
  }

  GetPaymentWhsTransferStatuses(): Observable<WhsTransferStatus[]> {
    return this.http.get<WhsTransferStatus[]>(this.BaseUrl + '/whstransferstatus');
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
        `${this.BaseUrl}/print`,
        JSON.stringify(params),
        { responseType: 'blob', headers: options }
      );
    } catch (error) {
      return throwError(error);
    }
  }

  Finalize(params?: FinalizeWhsTransferRequest): Observable<UpdateWarehouseDocumentResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof FinalizeWhsTransferRequest] != undefined && params[key as keyof FinalizeWhsTransferRequest] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof FinalizeWhsTransferRequest];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof FinalizeWhsTransferRequest];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.patch<UpdateWarehouseDocumentResponse>(this.BaseUrl + '/process' + (!!params ? ('?' + queryParams) : ''), null);
  }
}
