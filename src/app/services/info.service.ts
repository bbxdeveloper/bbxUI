import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  private readonly BaseUrl = environment.apiUrl + 'info';

  constructor(private http: HttpClient) { }

  Get(apiVersion: string = environment.apiVersion): Observable<string> {
    return this.http.get<string>(this.BaseUrl + (apiVersion != undefined ? `?api-version=${apiVersion}` : ''));
  }
}
