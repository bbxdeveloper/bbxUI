export interface Product {
    "id": number,
    "productCode"?: any,
    "description"?: string,
    "productGroup"?: any,
    "origin"?: any,
    "unitOfMeasure"?: any,
    "unitOfMeasureX"?: any,
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
        "productCode": null,
        "description": "",
        "productGroup": 0,
        "origin": 0,
        "unitOfMeasure": "",
        "unitOfMeasureX": "",
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