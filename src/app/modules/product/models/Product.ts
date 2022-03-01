export interface Product {
    "id": number,
    "ProductCode"?: any,
    "description"?: string,
    "productGroupID"?: number,
    "originID"?: number,
    "unitOfMeasure"?: string,
    "unitPrice1"?: number,
    "unitPrice2"?: number,
    "latestSupplyPrice"?: number,
    "isStock"?: boolean,
    "minStock"?: number,
    "ordUnit"?: number,
    "productFee"?: number,
    "active"?: boolean,
    "VTSZ"?: any,
    "EAN"?: any
}

export function BlankProduct(): Product {
    return {
        "id": 0,
        "ProductCode": null,
        "description": "",
        "productGroupID": 0,
        "originID": 0,
        "unitOfMeasure": "",
        "unitPrice1": 0,
        "unitPrice2": 0,
        "latestSupplyPrice": 0,
        "isStock": false,
        "minStock": 0,
        "ordUnit": 0,
        "productFee": 0,
        "active": true,
        "VTSZ": null,
        "EAN": null
    } as Product;
}