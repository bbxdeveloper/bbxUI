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
    "newOffer": boolean,

    "offerNumberX": string,
    "CustomerComment"?: string,
    "offerVersion": number,
    "latestVersion": boolean,

    "offerLines": OfferLineFullData[]
}