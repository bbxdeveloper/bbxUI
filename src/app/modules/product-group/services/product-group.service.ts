import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetProductGroupsParamListModel } from '../models/GetProductGroupsParamListModel';
import { GetProductGroupsResponse } from '../models/GetProductGroupsResponse';
import { GetProductGroupParamListModel } from '../models/GetProductGroupParamListModel';
import { ProductGroup } from '../models/ProductGroup';
import { CreateProductGroupRequest } from '../models/CreateProductGroupRequest';
import { CreateProductGroupResponse } from '../models/CreateProductGroupResponse';
import { UpdateProductGroupRequest } from '../models/UpdateProductGroupRequest';
import { UpdateProductGroupResponse } from '../models/UpdateProductGroupResponse';
import { DeleteProductGroupRequest } from '../models/DeleteProductGroupRequest';
import { DeleteProductGroupResponse } from '../models/DeleteProductGroupResponse';

@Injectable({
  providedIn: 'root'
})
export class ProductGroupService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'ProductGroup';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetProductGroupsParamListModel): Observable<GetProductGroupsResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    // TODO: organize into util / base class with generic T parameter
    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetProductGroupsParamListModel] != undefined && params[key as keyof GetProductGroupsParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetProductGroupsParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetProductGroupsParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetProductGroupsResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetProductGroupParamListModel): Observable<ProductGroup> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetProductGroupParamListModel] != undefined && params[key as keyof GetProductGroupParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetProductGroupParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetProductGroupParamListModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<ProductGroup>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: CreateProductGroupRequest): Observable<CreateProductGroupResponse> {
    return this.http.post<CreateProductGroupResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateProductGroupRequest): Observable<UpdateProductGroupResponse> {
    return this.http.put<UpdateProductGroupResponse>(this.BaseUrl, req);
  }

  Delete(req: DeleteProductGroupRequest): Observable<DeleteProductGroupResponse> {
    return this.http.delete<DeleteProductGroupResponse>(this.BaseUrl + '?ID=' + req.id);
  }
}
