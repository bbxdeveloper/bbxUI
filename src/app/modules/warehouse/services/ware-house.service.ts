import { Injectable } from '@angular/core';
import { catchError, EMPTY, lastValueFrom, Observable } from 'rxjs';
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
import { CommonService } from 'src/app/services/common.service';
import {HelperFunctions} from "../../../../assets/util/HelperFunctions";

@Injectable({
  providedIn: 'root'
})
export class WareHouseService {
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'WareHouse';

  constructor(private http: HttpClient, private cs: CommonService) { }

  GetTemporaryWarehouses(): WareHouse[] {
    return [{
      id: -1,
      warehouseCode: '0',
      warehouseDescription: "Feltöltés alatt...",
    }] as WareHouse[];
  }

  GetAll(params?: GetWareHousesParamListModel): Observable<GetWareHousesResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetWareHousesResponse>(this.BaseUrl + '/query' + '?' + queryParams);
  }

  async GetAllPromise(params?: GetWareHousesParamListModel): Promise<GetWareHousesResponse> {
    return lastValueFrom(this.GetAll(params).pipe(
      catchError(err => {
        this.cs.HandleError(err);
        return EMPTY
      })
    ));
  }

  Get(params?: GetWareHouseParamListModel): Observable<WareHouse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<WareHouse>(this.BaseUrl + '?' + queryParams);
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
