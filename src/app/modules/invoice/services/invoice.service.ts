import { Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetInvoicesParamListModel } from '../models/GetInvoicesParamListModel';
import { GetInvoicesResponse } from '../models/GetInvoicesResponse';
import { GetInvoiceRequest } from '../models/GetInvoiceRequest';
import { Invoice } from '../models/Invoice';
import { CreateOutgoingInvoiceRequest } from '../models/CreateOutgoingInvoiceRequest';
import { CreateOutgoingInvoiceResponse } from '../models/CreateOutgoingInvoiceResponse';
import { UpdateInvoiceResponse } from '../models/UpdateInvoiceResponse';
import { UpdateInvoiceRequest } from '../models/UpdateInvoiceRequest';
import { DeleteInvoiceRequest } from '../models/DeleteInvoiceRequest';
import { DeleteInvoiceResponse } from '../models/DeleteInvoiceResponse';
import { PaymentMethod } from '../models/PaymentMethod';
import { Constants } from 'src/assets/util/Constants';
import { InvoiceLine } from '../models/InvoiceLine';
import { PendingDeliveryInvoiceSummary } from '../models/PendingDeliveriInvoiceSummary';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { GetPendingDeliveryInvoiceSummariesRequest } from '../models/GetPendingDeliveriInvoiceSummary';
import { PendingDeliveryNoteItem } from '../models/PendingDeliveryNoteItem';
import { PendingDeliveryNote } from '../models/PendingDeliveryNote';
import { PricePreviewRequest } from '../models/PricePreviewRequest';
import { TokenStorageService } from '../../auth/services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'Invoice';

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenStorageService) { }

  GetTemporaryPaymentMethod(): Observable<PaymentMethod[]> {
    return of([{
      value: "-1",
      text: "Feltöltés alatt..."
    }] as PaymentMethod[]);
  }

  GetPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(this.BaseUrl + '/paymentmethod');
  }

  public GetAll(params?: GetInvoicesParamListModel): Observable<GetInvoicesResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);

    return this.http.get<GetInvoicesResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  public getAllAsync(params: GetInvoicesParamListModel): Promise<GetInvoicesResponse> {
    return firstValueFrom(this.GetAll(params))
  }

  public Get(params: GetInvoiceRequest): Promise<Invoice> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);
    const response = this.http.get<Invoice>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));

    return firstValueFrom(response)
  }

  public CreateOutgoing(req: CreateOutgoingInvoiceRequest<InvoiceLine>): Observable<CreateOutgoingInvoiceResponse> {
    let options = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set("charset", "utf8")
    return this.http.post<CreateOutgoingInvoiceResponse>(this.BaseUrl, req.JsonStringify(), { headers: options });
  }

  public createOutgoingAsync(request: CreateOutgoingInvoiceRequest<InvoiceLine>): Promise<CreateOutgoingInvoiceResponse> {
    return firstValueFrom(this.CreateOutgoing(request))
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

  public async GetPendingDeliveryInvoices(params?: GetPendingDeliveryInvoiceSummariesRequest): Promise<PendingDeliveryInvoiceSummary[]> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);
    const request = this.http.get<PendingDeliveryInvoiceSummary[]>(this.BaseUrl + '/pendigdeliverynotessummary?' + queryParams)

    return await lastValueFrom(request)
  }

  public async GetPendingDeliveryNotesItems(params: GetPendingDeliveryInvoiceSummariesRequest): Promise<PendingDeliveryNoteItem[]> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)
    const request = this.http.get<PendingDeliveryNoteItem[]>(this.BaseUrl + '/pendigdeliverynotesitems?' + queryParams)

    return await lastValueFrom(request)
  }

  public GetPendingDeliveryNotes(): Promise<PendingDeliveryNote[]> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString({
      incoming: false,
      warehouseCode: this.tokenService.wareHouse?.id.toString() ?? '',
      currencyCode: 'HUF'
    })
    const request = this.http.get<PendingDeliveryNote[]>(this.BaseUrl + '/pendigdeliverynotes?' + queryParams)

    return lastValueFrom(request)
  }

  public pricePreview(pricePreview: PricePreviewRequest): Promise<CreateOutgoingInvoiceResponse> {
    const body = JSON.stringify(pricePreview)
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('charset', 'utf')
    const request = this.http.patch<CreateOutgoingInvoiceResponse>(this.BaseUrl + '/pricepreview', body, { headers })

    return firstValueFrom(request)
  }

  public getCsv(params: GetInvoicesParamListModel | Constants.Dct): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('charset', 'utf8')
      .set('accept', 'text/csv')

    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get(this.BaseUrl + '/csv?' + queryParams, {
      responseType: 'blob',
      headers: headers,
      observe: 'response'
    })
  }

  public GetCustomerUnpaidAmount(params?: { CustomerID: number }): Promise<number> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);
    const request = this.http.get<number>(this.BaseUrl + '/customerunpaidamount' + (!!params ? ('?' + queryParams) : ''));
    return firstValueFrom(request)
  }
}
