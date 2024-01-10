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
import {HelperFunctions} from "../../../../assets/util/HelperFunctions";

@Injectable({
  providedIn: 'root'
})
export class ProductGroupService {
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'ProductGroup';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetProductGroupsParamListModel): Observable<GetProductGroupsResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetProductGroupsResponse>(this.BaseUrl + '/query' + '?' + queryParams);
  }

  Get(params?: GetProductGroupParamListModel): Observable<ProductGroup> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<ProductGroup>(this.BaseUrl + '?' + queryParams);
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
