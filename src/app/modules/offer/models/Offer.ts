import { OfferLineFullData } from "./OfferLine";

export interface Offer {
    "id": number,
    "offerNumber": string,
    "customerID": number,
    "customerName": string,
    "customerBankAccountNumber": string,
    "customerTaxpayerNumber": string,
    "customerCountryCode": string,
    "customerPostalCode": string,
    "customerCity": string,
    "customerAdditionalAddressDetail": string,
    "customerComment"?: string,
    "offerIssueDate": string,
    "offerVaidityDate": string,
    "copies": number,
    "notice": string,
    "deleted": boolean,
    "newOfferVersion"?: boolean,

    "offerNumberX": string,
    "CustomerComment"?: string,
    "offerVersion": number,
    "latestVersion": boolean,

    "offerLines": OfferLineFullData[],

    "offerNetAmount": number,
    "offerGrossAmount": number,

    "sumBrtAmount": number,
    "sumNetAmount": number,

    "currencyCode": string,
    "currencyCodeX": string,
    "exchangeRate": number,

    "isBrutto": boolean
}