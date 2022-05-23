import { OfferLine } from "./OfferLine";

export interface CreateOfferRequest {
    "customerID": number,
    "offerIssueDate": string,
    "offerVaidityDate": string,
    "notice": string,
    "offerLines": OfferLine[]
}