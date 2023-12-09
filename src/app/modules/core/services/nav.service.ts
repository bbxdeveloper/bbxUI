import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SendInvoiceToNavResponse } from '../models/SendInvoiceToNavResponse';

@Injectable({
  providedIn: 'root'
})
export class NavService {
  private readonly baseUrl = environment.apiUrl + 'api/' + environment.apiVersion + '/NAV';

  constructor(private readonly http: HttpClient) { }

  public sendInvoice(invoiceNumber: string): Observable<SendInvoiceToNavResponse> {
    return this.http.post<SendInvoiceToNavResponse>(`${this.baseUrl}/sendinvoicetonav?InvoiceNumber=${invoiceNumber}`, {})
  }
}
