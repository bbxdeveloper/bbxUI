export interface UpdateProductRequest {
    "id": number,
    "productCode": string,
    "description": string,
    "productGroupID": number,
    "originID": number,
    "unitOfMeasure": string,
    "unitPrice1": number,
    "unitPrice2": number,
    "latestSupplyPrice": number,
    "isStock": true,
    "minStock": number,
    "ordUnit": number,
    "productFee": number,
    "active": boolean,
    "vtsz": string,
    "ean": string
}