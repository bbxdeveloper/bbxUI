import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CurrencyCode } from '../models/CurrencyCode';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'System';

  constructor(private http: HttpClient) { }

  GetAllCurrencyCodes(): Observable<CurrencyCode[]> {
    return this.http.get<CurrencyCode[]>(this.BaseUrl + '/currencycodes');
  }
}
