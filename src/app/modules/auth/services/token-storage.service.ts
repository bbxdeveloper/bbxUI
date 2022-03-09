import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  get isLoggedIn() { return this.token != null; }

  get token(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  set token(token: string | null) {
    if (token !== undefined && token !== null) {
      window.sessionStorage.removeItem(TOKEN_KEY);
      window.sessionStorage.setItem(TOKEN_KEY, token);
    }
  }

  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }
}
