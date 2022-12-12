import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetLocationsParamListModel } from '../models/GetLocationsParamListModel';
import { GetLocationsResponse } from '../models/GetLocationsResponse';
import { GetLocationParamListModel } from '../models/GetLocationParamListModel';
import { Location } from '../models/Location';
import { CreateLocationRequest } from '../models/CreateLocationRequest';
import { CreateLocationResponse } from '../models/CreateLocationResponse';
import { UpdateLocationRequest } from '../models/UpdateLocationRequest';
import { UpdateLocationResponse } from '../models/UpdateLocationResponse';
import { DeleteLocationRequest } from '../models/DeleteLocationRequest';
import { DeleteLocationResponse } from '../models/DeleteLocationResponse';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'Location';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetLocationsParamListModel): Observable<GetLocationsResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetLocationsParamListModel] != undefined && params[key as keyof GetLocationsParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetLocationsParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetLocationsParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetLocationsResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetLocationParamListModel): Observable<Location> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetLocationParamListModel] != undefined && params[key as keyof GetLocationParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetLocationParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetLocationParamListModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<Location>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: CreateLocationRequest): Observable<CreateLocationResponse> {
    return this.http.post<CreateLocationResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateLocationRequest): Observable<UpdateLocationResponse> {
    return this.http.put<UpdateLocationResponse>(this.BaseUrl, req);
  }

  Delete(req: DeleteLocationRequest): Observable<DeleteLocationResponse> {
    return this.http.delete<DeleteLocationResponse>(this.BaseUrl + '?ID=' + req.id);
  }
}
