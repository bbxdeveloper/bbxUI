import { OfferLine } from "./OfferLine";

export interface CreateOfferRequest {
    "customerID": string,
    "offerIssueDate": string,
    "offerVaidityDate": string,
    "notice": string,
    "offerLines": OfferLine[]
}