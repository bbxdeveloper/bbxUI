import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthModule } from '../auth.module';
import { User } from '../models/User';

const MOCK_USERS = [
  { Id: "001", UserName: "Asd" } as User,
  { Id: "002", UserName: "Asd" } as User,
  { Id: "003", UserName: "Asd" } as User,
  // { Id: "004", UserName: "Asd" } as User,
  // { Id: "005", UserName: "Asd" } as User,
  // { Id: "006", UserName: "Asd" } as User,
  // { Id: "007", UserName: "Asd" } as User,
  // { Id: "007", UserName: "Asd" } as User
];

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  GetUsers(): Observable<any> {
    return of(MOCK_USERS);
  }

  CreateUser(newUser: User): Observable<any> {
    return of(true);
  }

  UpdateUser(updatedUser: User): Observable<any> {
    return of(true);
  }

  DeleteUser(userId: User): Observable<any> {
    return of(true);
  }
}
