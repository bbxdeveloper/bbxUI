import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SendEmailRequest, SendEmailResponse } from '../models/Email';

@Injectable({
  providedIn: 'root'
})
export class InfrastructureService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'Infrastructure';

  constructor(private http: HttpClient) { }

  SendEmail(req: SendEmailRequest): Observable<SendEmailResponse> {
    return this.http.post<SendEmailResponse>(this.BaseUrl + "/SendEmail", req);
  }
}
