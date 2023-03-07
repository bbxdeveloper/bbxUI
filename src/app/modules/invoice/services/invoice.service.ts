import { Injectable } from '@angular/core';
import { lastValueFrom, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetInvoicesParamListModel } from '../models/GetInvoicesParamListModel';
import { GetInvoicesResponse } from '../models/GetInvoicesResponse';
import { GetInvoiceParamListModel } from '../models/GetInvoiceParamListModel';
import { Invoice } from '../models/Invoice';
import { CreateOutgoingInvoiceRequest } from '../models/CreateOutgoingInvoiceRequest';
import { CreateOutgoingInvoiceResponse } from '../models/CreateOutgoingInvoiceResponse';
import { UpdateInvoiceResponse } from '../models/UpdateInvoiceResponse';
import { UpdateInvoiceRequest } from '../models/UpdateInvoiceRequest';
import { DeleteInvoiceRequest } from '../models/DeleteInvoiceRequest';
import { DeleteInvoiceResponse } from '../models/DeleteInvoiceResponse';
import { PaymentMethod } from '../models/PaymentMethod';
import { Constants } from 'src/assets/util/Constants';
import { InvoiceLineForPost } from '../models/InvoiceLine';
import { PendingDeliveryInvoiceSummary } from '../models/PendingDeliveriInvoiceSummary';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { GetPendingDeliveryInvoiceSummariesRequest } from '../models/GetPendingDeliveriInvoiceSummary';
import { PendingDeliveryNote } from '../models/PendingDeliveryNote';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'Invoice';

  constructor(private http: HttpClient) { }

  GetTemporaryPaymentMethod(): Observable<PaymentMethod[]> {
    return of([{
      value: "-1",
      text: "Feltöltés alatt..."
    }] as PaymentMethod[]);
  }

  GetPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(this.BaseUrl + '/paymentmethod');
  }

  GetAll(params?: GetInvoicesParamListModel): Observable<GetInvoicesResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);

    return this.http.get<GetInvoicesResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetInvoiceParamListModel): Observable<Invoice> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);

    return this.http.get<Invoice>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  CreateOutgoing(req: CreateOutgoingInvoiceRequest<InvoiceLineForPost>): Observable<CreateOutgoingInvoiceResponse> {
    return this.http.post<CreateOutgoingInvoiceResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateInvoiceRequest): Observable<UpdateInvoiceResponse> {
    return this.http.put<UpdateInvoiceResponse>(this.BaseUrl, req);
  }

  Delete(req: DeleteInvoiceRequest): Observable<DeleteInvoiceResponse> {
    return this.http.delete<DeleteInvoiceResponse>(this.BaseUrl + '?ID=' + req.id);
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

  GetGradesReport(params: Constants.Dct): Observable<any> {
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

  GetAggregateReport(params: Constants.Dct): Observable<any> {
    try {
      let options = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set("charset", "utf8")
        .set("accept", "application/pdf");
      return this.http.post(
        `${this.BaseUrl}/printaggregate`,
        JSON.stringify(params),
        { responseType: 'blob', headers: options }
      );
    } catch (error) {
      return throwError(error);
    }
  }

  public async GetPendingDeliveryInvoices(params?: GetPendingDeliveryInvoiceSummariesRequest): Promise<PendingDeliveryInvoiceSummary[]> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);
    const request = this.http.get<PendingDeliveryInvoiceSummary[]>(this.BaseUrl + '/pendigdeliverynotessummary?' + queryParams)

    return await lastValueFrom(request)
  }

  public async GetPendingDeliveryNotesItems(params: GetPendingDeliveryInvoiceSummariesRequest): Promise<PendingDeliveryNote[]> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)
    const request = this.http.get<PendingDeliveryNote[]>(this.BaseUrl + '/pendigdeliverynotesitems?' + queryParams)

    return await lastValueFrom(request)
  }
}
