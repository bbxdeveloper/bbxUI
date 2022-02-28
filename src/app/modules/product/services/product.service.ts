import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetProductsParamListModel } from '../models/GetProductsParamListModel';
import { GetProductsResponse } from '../models/GetProductsResponse';
import { GetProductParamListModel } from '../models/GetProductParamListModel';
import { Product } from '../models/Product';
import { CreateProductRequest } from '../models/CreateProductRequest';
import { CreateProductResponse } from '../models/CreateProductResponse';
import { UpdateProductResponse } from '../models/UpdateProductResponse';
import { UpdateProductRequest } from '../models/UpdateProductRequest';
import { DeleteProductRequest } from '../models/DeleteProductRequest';
import { DeleteProductResponse } from '../models/DeleteProductResponse';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'Product';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetProductsParamListModel): Observable<GetProductsResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetProductsParamListModel] != undefined && params[key as keyof GetProductsParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetProductsParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetProductsParamListModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetProductsResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetProductParamListModel): Observable<Product> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetProductParamListModel] != undefined && params[key as keyof GetProductParamListModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetProductParamListModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetProductParamListModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<Product>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: Product): Observable<CreateProductResponse> {
    return this.http.post<CreateProductResponse>(this.BaseUrl, req);
  }

  Update(req: UpdateProductRequest): Observable<UpdateProductResponse> {
    return this.http.put<UpdateProductResponse>(this.BaseUrl, req);
  }

  Delete(req: DeleteProductRequest): Observable<DeleteProductResponse> {
    return this.http.delete<DeleteProductResponse>(this.BaseUrl, { body: req });
  }
}
