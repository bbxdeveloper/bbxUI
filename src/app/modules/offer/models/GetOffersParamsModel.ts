export interface GetOffersParamsModel {
    OrderBy?: string;
    PageSize?: number;
    PageNumber?: number;
    
    OfferNumber?: string;
    CustomerID?: number;
    OfferIssueDateFrom?: string;
    OfferIssueDateTo?: string;
    OfferVaidityDateForm?: string;
    OfferVaidityDateTo?: string;
}