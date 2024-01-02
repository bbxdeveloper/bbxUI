import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CreateUserRequest } from '../models/CreateUserRequest';
import { DeleteUserRequest } from '../models/DeleteUserRequest';
import { GetUsersResponse as GetUsersResponse } from '../models/GetUsersResponse';
import { UpdateUserRequest } from '../models/UpdateUserRequest';
import { User } from '../models/User';
import { GetUsersParamListModel } from '../models/GetUsersParamListModel';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetUserParamListModel } from '../models/GetUserParamListModel';
import { CreateUserResponse } from '../models/CreateUserResponse';
import { UpdateUserResponse } from '../models/UpdateUserResponse';
import { DeleteUserResponse } from '../models/DeleteUserResponse';
import { LoginNameAndPwdRequest } from '../models/LoginNameAndPwdRequest';
import { LoginNameAndPwdResponse } from '../models/LoginNameAndPwdResponse';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'User';

  constructor(private http: HttpClient) { }

  CheckLoginNameAndPwd(params?: LoginNameAndPwdRequest): Observable<LoginNameAndPwdResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);

    return this.http.get<LoginNameAndPwdResponse>(this.BaseUrl + '/loginnameandpwd' + '?' + queryParams);
  }

  GetAll(params?: GetUsersParamListModel): Observable<GetUsersResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);

    return this.http.get<GetUsersResponse>(this.BaseUrl + '/query' + '?' + queryParams);
  }

  Get(params?: GetUserParamListModel): Observable<User> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params);

    return this.http.get<User>(this.BaseUrl + '?' + queryParams);
  }

  Create(req: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateUserRequest): Observable<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(this.BaseUrl, req);
  }

  Delete(req: DeleteUserRequest): Observable<DeleteUserResponse> {
    return this.http.delete<DeleteUserResponse>(this.BaseUrl, { body: req });
  }
}
