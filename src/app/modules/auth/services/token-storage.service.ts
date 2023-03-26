import { Injectable } from '@angular/core';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { User } from '../models/User';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const WAREHOUSE_KEY = 'auth-warehouse';

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

  get wareHouse(): WareHouse | null {
    const wareHouseJson = window.sessionStorage.getItem(WAREHOUSE_KEY);
    if (wareHouseJson) {
      return JSON.parse(wareHouseJson) as WareHouse;
    }
    return null;
  }

  set wareHouse(newWareHouse: WareHouse | null) {
    console.log("set warehouse: ", newWareHouse);
    if (newWareHouse) {
      window.sessionStorage.removeItem(WAREHOUSE_KEY);
      window.sessionStorage.setItem(WAREHOUSE_KEY, newWareHouse ? JSON.stringify(newWareHouse) : newWareHouse);
    }
  }

  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }
}
