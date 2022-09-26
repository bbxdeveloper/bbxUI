import { Injectable } from '@angular/core';
import { User } from '../models/User';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  get isLoggedIn() { return this.token != null && this.user !== null; }

  get token(): string | null {
    //console.log("get token: ", window.sessionStorage.getItem(TOKEN_KEY));
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  set token(newToken: string | null) {
    console.log("set token: ", newToken);
    if (newToken !== undefined && newToken !== null) {
      window.sessionStorage.removeItem(TOKEN_KEY);
      window.sessionStorage.setItem(TOKEN_KEY, newToken);
    }
  }

  get user(): User | null {
    const userJson = window.sessionStorage.getItem(USER_KEY);
    //console.log("get user: ", userJson);
    if (userJson !== null && userJson !== undefined) {
      return JSON.parse(userJson) as User;
    }
    return userJson;
  }

  set user(newUser: User | null) {
    console.log("set user: ", newUser);
    if (newUser !== undefined && newUser !== null) {
      window.sessionStorage.removeItem(USER_KEY);
      window.sessionStorage.setItem(USER_KEY, newUser !== null && newUser !== undefined ? JSON.stringify(newUser) : newUser);
    }
  }

  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }
}
