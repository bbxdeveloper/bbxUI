import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Constants } from 'src/assets/util/Constants';
import { GetOffersResponse } from '../models/GetOffersResponse';
import { GetOffersParamsModel } from '../models/GetOffersParamsModel';
import { GetOfferParamsModel } from '../models/GetOfferParamsModel';
import { Offer } from '../models/Offer';
import { CreateOfferRequest } from '../models/CreateOfferRequest';
import { CreateOfferResponse } from '../models/CreateOfferResponse';
import { DeleteOfferRequest } from '../models/DeleteOfferRequest';
import { DeleteOfferResponse } from '../models/DeleteOfferResponse';
import {HelperFunctions} from "../../../../assets/util/HelperFunctions";

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private readonly BaseUrl = environment.apiUrl + 'api' + environment.apiVersion + 'Offer';

  constructor(private http: HttpClient) { }

  GetAll(params?: GetOffersParamsModel): Observable<GetOffersResponse> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<GetOffersResponse>(this.BaseUrl + '/query' + '?' + queryParams);
  }

  Get(params?: GetOfferParamsModel): Observable<Offer> {
    const queryParams = HelperFunctions.ParseObjectAsQueryString(params)

    return this.http.get<Offer>(this.BaseUrl + '?' + queryParams);
  }

  Create(req: CreateOfferRequest): Observable<CreateOfferResponse> {
    return this.http.post<CreateOfferResponse>(this.BaseUrl, req);
  }

  Update(req: Offer): Observable<CreateOfferResponse> {
    return this.http.put<CreateOfferResponse>(this.BaseUrl, req);
  }

  Delete(req: DeleteOfferRequest): Observable<DeleteOfferResponse> {
    return this.http.delete<DeleteOfferResponse>(this.BaseUrl + `?ID=${req.ID}`);
  }

  GetReport(params: Constants.Dct): Observable<any> {
    try {
      let options = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set("charset", "utf8")
        .set("accept", "application/pdf");
      return this.http.post(
        `${this.BaseUrl}/print`,
        JSON.stringify(params),
        { responseType: 'blob', headers: options }
      );
    } catch (error) {
      return throwError(error);
    }
  }

  GetCsv(params: Constants.Dct): Observable<any> {
    try {
      let options = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set("charset", "utf8")
        .set("accept", "text/csv");
      return this.http.get(
        `${this.BaseUrl}/csv` + `?ID=${params['ID']}`,
        { responseType: 'blob', headers: options, observe: 'response' }
      );
    } catch (error) {
      return throwError(error);
    }
  }
}
