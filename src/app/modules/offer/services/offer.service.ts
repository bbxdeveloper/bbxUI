import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Constants } from 'src/assets/util/Constants';
import { GetOffersResponse } from '../models/GetOffersResponse';
import { GetOffersParamsModel } from '../models/GetOffersParamsModel';
import { GetOfferParamsModel } from '../models/GetOfferParamsModel';
import { Offer } from '../models/Offer';
import { CreateOfferRequest } from '../models/CreateOfferRequest';
import { CreateOfferResponse } from '../models/CreateOfferResponse';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private readonly BaseUrl = environment.apiUrl + 'api/' + environment.apiVersion + 'Offer';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetOffersParamsModel): Observable<GetOffersResponse> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetOffersParamsModel] != undefined && params[key as keyof GetOffersParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetOffersParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetOffersParamsModel];
          }
          index++;
        }
      });
    }

    return this.http.get<GetOffersResponse>(this.BaseUrl + '/query' + (!!params ? ('?' + queryParams) : ''));
  }

  Get(params?: GetOfferParamsModel): Observable<Offer> {
    // Process params
    var queryParams = '';
    var index = 0;

    if (!!params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key as keyof GetOfferParamsModel] != undefined && params[key as keyof GetOfferParamsModel] != null) {
          if (index == 0) {
            queryParams += key + '=' + params[key as keyof GetOfferParamsModel];
          } else {
            queryParams += '&' + key + '=' + params[key as keyof GetOfferParamsModel];
          }
          index++;
        }
      });
    }

    // Get
    return this.http.get<Offer>(this.BaseUrl + (!!params ? ('?' + queryParams) : ''));
  }

  Create(req: CreateOfferRequest): Observable<CreateOfferResponse> {
    return this.http.post<CreateOfferResponse>(this.BaseUrl, req);
  }

  GetReport(params: Constants.Dct): Observable<any> {
    let options = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set("charset", "utf8")
      .set("accept", "application/pdf");
    return this.http.post(
      `${this.BaseUrl}/print`,
      JSON.stringify(params['report_params']),
      { responseType: 'blob', headers: options }
    );
  }
}
