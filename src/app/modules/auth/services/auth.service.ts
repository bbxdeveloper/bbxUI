import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
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
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + '/Auth';

  constructor(private http: HttpClient, private tokenService: TokenStorageService) { }

  public login(nm: string, pswd: string): Promise<LoginResponse> {
    const loginData = { loginName: nm, password: pswd };
    const response = this.http.post<LoginResponse>(this.BaseUrl + '/auth/' + environment.apiVersion + '/login', loginData, httpOptions);

    return firstValueFrom(response)
  }

  public logout(): Observable<any> {
    return this.http.post(this.BaseUrl + '/auth/' + environment.apiVersion + '/logout', {}, httpOptions);
  }

  public getLoggedUser(): Observable<User | null> {
    return of(this.tokenService.user);
  }
}
