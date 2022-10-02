import { Injectable } from '@angular/core';
import { catchError, lastValueFrom, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetWareHousesParamListModel } from '../models/GetWareHousesParamListModel';
import { GetWareHousesResponse } from '../models/GetWareHousesResponse';
import { GetWareHouseParamListModel } from '../models/GetWareHouseParamListModel';
import { WareHouse } from '../models/WareHouse';
import { CreateWareHouseRequest } from '../models/CreateWareHouseRequest';
import { CreateWareHouseResponse } from '../models/CreateWareHouseResponse';
import { UpdateWareHouseRequest } from '../models/UpdateWareHouseRequest';
import { UpdateWareHouseResponse } from '../models/UpdateWareHouseResponse';
import { DeleteWareHouseRequest } from '../models/DeleteWareHouseRequest';
import { DeleteWareHouseResponse } from '../models/DeleteWareHouseResponse';
import { map } from 'jquery';
import { CommonService } from 'src/app/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class WareHouseService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'WareHouse';

  constructor(private http: HttpClient, private cs: CommonService) { }

  GetAll(params?: GetWareHousesParamListModel): Observable<GetWareHousesResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    // TODO: organize into util / base class with generic T parameter
    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetWareHousesParamListModel] != undefined && params[key as keyof GetWareHousesParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetWareHousesParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetWareHousesParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetWareHousesResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  async GetAllPromise(params?: GetWareHousesParamListModel): Promise<GetWareHousesResponse> {
    return lastValueFrom(this.GetAll(params).pipe(
      catchError((err, c) => {
        this.cs.HandleError(err);
        return c;
      })
    ));
  }

  Get(params?: GetWareHouseParamListModel): Observable<WareHouse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetWareHouseParamListModel] != undefined && params[key as keyof GetWareHouseParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetWareHouseParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetWareHouseParamListModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<WareHouse>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: CreateWareHouseRequest): Observable<CreateWareHouseResponse> {
    return this.http.post<CreateWareHouseResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateWareHouseRequest): Observable<UpdateWareHouseResponse> {
    return this.http.put<UpdateWareHouseResponse>(this.BaseUrl, req);
  }

  Delete(req: DeleteWareHouseRequest): Observable<DeleteWareHouseResponse> {
    return this.http.delete<DeleteWareHouseResponse>(this.BaseUrl + '?ID=' + req.id);
  }
}
