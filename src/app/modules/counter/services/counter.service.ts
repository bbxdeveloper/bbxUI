import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetCountersParamListModel } from '../models/GetCountersParamListModel';
import { GetCountersResponse } from '../models/GetCountersResponse';
import { GetCounterParamListModel } from '../models/GetCounterParamListModel';
import { Counter } from '../models/Counter';
import { CreateCounterResponse } from '../models/CreateCounterResponse';
import { UpdateCounterResponse } from '../models/UpdateCounterResponse';
import { UpdateCounterRequest } from '../models/UpdateCounterRequest';
import { DeleteCounterRequest } from '../models/DeleteCounterRequest';
import { DeleteCounterResponse } from '../models/DeleteCounterResponse';
import { CreateCounterRequest } from '../models/CreateCounterRequest';
import {HelperFunctions} from "../../../../assets/util/HelperFunctions";

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'Counter';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetCountersParamListModel): Observable<GetCountersResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetCountersResponse>(this.BaseUrl + '/query' + '?' + queryParams);
  }

  Get(params?: GetCounterParamListModel): Observable<Counter> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<Counter>(this.BaseUrl + '?' + queryParams);
  }

  Create(req: CreateCounterRequest): Observable<CreateCounterResponse> {
    return this.http.post<CreateCounterResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateCounterRequest): Observable<UpdateCounterResponse> {
    return this.http.put<UpdateCounterResponse>(this.BaseUrl, req);
  }

  Delete(req: DeleteCounterRequest): Observable<DeleteCounterResponse> {
    return this.http.delete<DeleteCounterResponse>(this.BaseUrl + '?ID=' + req.id);
  }
}
