import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginResponse } from '../models/LoginResponse';
import { User } from '../models/User';
import { TokenStorageService } from './token-storage.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'Auth';

  constructor(private http: HttpClient, private tokenService: TokenStorageService) { }

  login(nm: string, pswd: string): Observable<LoginResponse> {
    let loginData = { loginName: nm, password: pswd };
    return this.http.post<LoginResponse>(this.BaseUrl + '/auth/' + environment.apiVersion + '/login', loginData, httpOptions);
  }

  logout(): Observable<any> {
    return this.http.post(this.BaseUrl + '/auth/' + environment.apiVersion + '/logout', {}, httpOptions);
  }

  getLoggedUser(): Observable<User | null> {
    return of(this.tokenService.user);
  }
}
