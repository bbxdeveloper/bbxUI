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
import {HelperFunctions} from "../../../../assets/util/HelperFunctions";

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'Location';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetLocationsParamListModel): Observable<GetLocationsResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetLocationsResponse>(this.BaseUrl + '/query' + '?' + queryParams);
  }

  Get(params?: GetLocationParamListModel): Observable<Location> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<Location>(this.BaseUrl + '?' + queryParams);
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
