export interface CreateOfferResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: any[],
    "data"?: {
        "offerNumber": string,
        "offerNumberX": string,
        "offerIssueDate": string,
        "offerVaidityDate": string,
        "customerID": number,
        "copies": number,
        "notice": string,
        "currencyCode": string,
        "exchangeRate": number,
        "customer"?: any,
        "offerLines": CreateOfferResponseOfferLine[],
        "id": number,
        "createTime": string,
        "updateTime": string,
        "deleted": boolean
    }
}

export interface CreateOfferResponseOfferLine {
    "offerID": number,
    "lineNumber": number,
    "productID": number,
    "productCode": string,
    "lineDescription": string,
    "vatRateID": number,
    "vatPercentage": number,
    "unitPrice": number,
    "unitPriceHUF": number,
    "unitVat": number,
    "unitVatHUF": number,
    "unitGross": number,
    "unitGrossHUF": number,
    "product"?: any,
    "vatRate"?: any,
    "id": number,
    "createTime": string,
    "updateTime": string,
    "deleted": boolean
}