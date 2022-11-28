import { Injectable } from '@angular/core';

// import path from 'path';
// import { createClientAsync, TnsgetCurrentExchangeRatesRequestBody, TnsgetExchangeRatesRequestBody, TnsgetExchangeRatesResponseBody } from 'src/assets/generated/arfolyamok';
// import { HelperFunctions } from 'src/assets/util/HelperFunctions';

import { lastValueFrom, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Constants } from 'src/assets/util/Constants';
import { CurrencyCodes } from '../modules/system/models/CurrencyCode';
import { CommonService } from './common.service';

export module ExchangeRate {

  export interface Motd {
    msg: string;
    url: string;
  }

  export interface Rates {
    AED: number;
    AFN: number;
    ALL: number;
    AMD: number;
    ANG: number;
    AOA: number;
    ARS: number;
    AUD: number;
    AWG: number;
    AZN: number;
    BAM: number;
    BBD: number;
    BDT: number;
    BGN: number;
    BHD: number;
    BIF: number;
    BMD: number;
    BND: number;
    BOB: number;
    BRL: number;
    BSD: number;
    BTC: number;
    BTN: number;
    BWP: number;
    BYN: number;
    BZD: number;
    CAD: number;
    CDF: number;
    CHF: number;
    CLF: number;
    CLP: number;
    CNH: number;
    CNY: number;
    COP: number;
    CRC: number;
    CUC: number;
    CUP: number;
    CVE: number;
    CZK: number;
    DJF: number;
    DKK: number;
    DOP: number;
    DZD: number;
    EGP: number;
    ERN: number;
    ETB: number;
    EUR: number;
    FJD: number;
    FKP: number;
    GBP: number;
    GEL: number;
    GGP: number;
    GHS: number;
    GIP: number;
    GMD: number;
    GNF: number;
    GTQ: number;
    GYD: number;
    HKD: number;
    HNL: number;
    HRK: number;
    HTG: number;
    HUF: number;
    IDR: number;
    ILS: number;
    IMP: number;
    INR: number;
    IQD: number;
    IRR: number;
    ISK: number;
    JEP: number;
    JMD: number;
    JOD: number;
    JPY: number;
    KES: number;
    KGS: number;
    KHR: number;
    KMF: number;
    KPW: number;
    KRW: number;
    KWD: number;
    KYD: number;
    KZT: number;
    LAK: number;
    LBP: number;
    LKR: number;
    LRD: number;
    LSL: number;
    LYD: number;
    MAD: number;
    MDL: number;
    MGA: number;
    MKD: number;
    MMK: number;
    MNT: number;
    MOP: number;
    MRU: number;
    MUR: number;
    MVR: number;
    MWK: number;
    MXN: number;
    MYR: number;
    MZN: number;
    NAD: number;
    NGN: number;
    NIO: number;
    NOK: number;
    NPR: number;
    NZD: number;
    OMR: number;
    PAB: number;
    PEN: number;
    PGK: number;
    PHP: number;
    PKR: number;
    PLN: number;
    PYG: number;
    QAR: number;
    RON: number;
    RSD: number;
    RUB: number;
    RWF: number;
    SAR: number;
    SBD: number;
    SCR: number;
    SDG: number;
    SEK: number;
    SGD: number;
    SHP: number;
    SLL: number;
    SOS: number;
    SRD: number;
    SSP: number;
    STD: number;
    STN: number;
    SVC: number;
    SYP: number;
    SZL: number;
    THB: number;
    TJS: number;
    TMT: number;
    TND: number;
    TOP: number;
    TRY: number;
    TTD: number;
    TWD: number;
    TZS: number;
    UAH: number;
    UGX: number;
    USD: number;
    UYU: number;
    UZS: number;
    VES: number;
    VND: number;
    VUV: number;
    WST: number;
    XAF: number;
    XAG: number;
    XAU: number;
    XCD: number;
    XDR: number;
    XOF: number;
    XPD: number;
    XPF: number;
    XPT: number;
    YER: number;
    ZAR: number;
    ZMW: number;
    ZWL: number;
  }

  export interface GetResponse {
    motd: Motd;
    success: boolean;
    base: string;
    date: string;
    rates: Constants.Dct; // Rates
  }

}

@Injectable({
  providedIn: 'root'
})
export class CurrencyAndExchangeService {

  constructor(private http: HttpClient, private cs: CommonService) { }

  //public async GetExchangeRateFor(names: string): Promise<[result: TnsgetExchangeRatesResponseBody, rawResponse: any, soapHeader: any, rawRequest: any]> {
  public GetExchangeRates(): Observable<ExchangeRate.GetResponse> {
    return this.http.get<ExchangeRate.GetResponse>("https://api.exchangerate.host/latest?base=HUF", { responseType: 'json' });
  }

  public GetExchangeRatesSync(): ExchangeRate.GetResponse {
    try{
      var requestURL = 'https://api.exchangerate.host/latest?base=HUF';
      var request = new XMLHttpRequest();
      request.open('GET', requestURL, false);

      //request.responseType = 'json';
      request.onload = (e) => {
        if (request.readyState === 4) {
          if (request.status === 200) {
            console.log(request.responseText);
          } else {
            console.error(request.statusText);
          }
        }
      };
      request.onerror = (e) => {
        this.cs.HandleError(request.statusText);
      };

      request.send();

      return JSON.parse(request.response) as ExchangeRate.GetResponse;
    } catch (ex) {
      this.cs.HandleError(ex);
      return {} as ExchangeRate.GetResponse;
    }
  }
}
