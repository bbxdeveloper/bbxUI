import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GetPocsParamListModel } from '../models/GetPocsParamListModel';
import { GetPocsResponse } from '../models/GetPocsResponse';
import { GetPocParamListModel } from '../models/GetPocParamListModel';
import { Poc } from '../models/Poc';
import { CreatePocRequest } from '../models/CreatePocRequest';
import { CreatePocResponse } from '../models/CreatePocResponse';
import { UpdatePocResponse } from '../models/UpdatePocResponse';
import { UpdatePocRequest } from '../models/UpdatePocRequest';
import { DeletePocRequest } from '../models/DeletePocRequest';
import { DeletePocResponse } from '../models/DeletePocResponse';
import { PocType } from '../models/PocType';
import { GetPocTypesResponse } from '../models/GetPocTypesResponse';

const POC_TYPES: PocType[] = [
  { id: '0', code: "Mock1", description: "Description 1" } as PocType,
  { id: '1', code: "Mock2", description: "Description 2" } as PocType,
  { id: '2', code: "Mock3", description: "Description 3" } as PocType,
  { id: '3', code: "Mock4", description: "Description 4" } as PocType,
  { id: '4', code: "Mock5", description: "Description 5" } as PocType,
  { id: '5', code: "Mock6", description: "Description 6" } as PocType,
];

const MOCK_DATA: Poc[] = [
  { id: 0, pocName: "Data 1", pocType: "Mock4", comment: 'Asd: 1.' } as Poc,
  { id: 1, pocName: "Data 2", pocType: "Mock1", comment: 'Asd: 2.' } as Poc,
  { id: 2, pocName: "Data 3", pocType: "Mock3", comment: 'Asd: 3.', active: true } as Poc,
  { id: 3, pocName: "Data 4", pocType: "Mock3", comment: 'Asd: 4.' } as Poc,
  { id: 4, pocName: "Data 5", pocType: "Mock2", comment: 'Asd: 5.' } as Poc,
];

const MOCK_Pocs = {
  "pageNumber": 1,
  "pageSize": 10,
  "recordsFiltered": 1,
  "recordsTotal": 1,
  "succeeded": true,
  "data": MOCK_DATA
} as GetPocsResponse;

const MOCK_PocTypes = {
  "pageNumber": 1,
  "pageSize": 10,
  "recordsFiltered": 1,
  "recordsTotal": 1,
  "succeeded": true,
  "data": POC_TYPES
} as GetPocTypesResponse;

@Injectable({
  providedIn: 'root'
})
export class PocService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'poc';

  constructor(private http: HttpClient) { }

  GetPocTypes(): Observable<GetPocTypesResponse> {
    return of(MOCK_PocTypes);
  }

  GetPocs(params?: GetPocsParamListModel): Observable<GetPocsResponse> {
    return of(MOCK_Pocs);

    // // Process params
    // var queryParams = '';
    // var index = 0;

    // if (!!params) {
    //   Object.keys(params).forEach((key: string) => {
    //     if (params[key as keyof GetPocsParamListModel] != undefined && params[key as keyof GetPocsParamListModel] != null) {
    //       if (index == 0) {
    //         queryParams += key + '=' + params[key as keyof GetPocsParamListModel];
    //       } else {
    //         queryParams += '&' + key + '=' + params[key as keyof GetPocsParamListModel];
    //       }
    //       index++;
    //     }
    //   });
    // }

    // return this.http.get<GetPocsResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  GetPoc(params?: GetPocParamListModel): Observable<Poc> {
    return of(MOCK_DATA[0]);

    // // Process params
    // var queryParams = '';
    // var index = 0;

    // if (!!params) {
    //   Object.keys(params).forEach((key: string) => {
    //     if (params[key as keyof GetPocParamListModel] != undefined && params[key as keyof GetPocParamListModel] != null) {
    //       if (index == 0) {
    //         queryParams += key + '=' + params[key as keyof GetPocParamListModel];
    //       } else {
    //         queryParams += '&' + key + '=' + params[key as keyof GetPocParamListModel];
    //       }
    //       index++;
    //     }
    //   });
    // }

    // // Get
    // return this.http.get<Poc>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  CreatePoc(req: Poc): Observable<CreatePocResponse> {
    return of({} as CreatePocResponse);
  }

  UpdatePoc(req: UpdatePocRequest): Observable<UpdatePocResponse> {
    return of({} as UpdatePocResponse);
  }

  DeletePoc(req: DeletePocRequest): Observable<DeletePocResponse> {
    return of({} as DeletePocResponse);
  }
}
