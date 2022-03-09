import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginResponse } from '../models/LoginResponse';
import { User } from '../models/User';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly BaseUrl = environment.apiUrl + 'auth' + environment.apiVersion;

  constructor(private http: HttpClient) { }

  login(nm: string, pswd: string): Observable<LoginResponse> {
    let loginData: { email?: string; password: string; phone?: string; };

    // Email
    if (nm.indexOf("@") != -1) {
      loginData = { email: nm, password: pswd };
    } else {
      loginData = { phone: nm, password: pswd };
    }

    // return this.http.post(this.BaseUrl + 'login', loginData, httpOptions);
    return of({ token: 'token' } as LoginResponse)
  }

  logout(): Observable<any> {
    // return this.http.post(this.BaseUrl + 'logout', {}, httpOptions);
    return of(true);
  }

  getLoggedUser(): Observable<User> {
    return of({name: 'Admin', loginName: 'Admin'} as User);
  }
}
