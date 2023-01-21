import { Product } from "../../product/models/Product";

export class Stock {
    "warehouseID": number;
    "warehouse": string;
    "productID": number;
    "productCode": string;
    "product": string;
    "realQty": number;
    "avgCost": number;
    "latestIn"?: string;
    "latestOut"?: string;
}

export class ExtendedStockData implements Stock, Product {
    // Stock
    "warehouseID": number;
    "warehouse": string;
    "productID": number;
    "productCode": string;
    "product": string;
    "realQty": number;
    "avgCost": number;
    "latestIn"?: string;
    "latestOut"?: string;
    // Product
    "id": number = -1;
    "description"?: string;
    "productGroup"?: any = '';
    "origin"?: string;
    "unitOfMeasure"?: any;
    "unitOfMeasureX"?: any;
    "unitPrice1"?: number;
    "unitPrice2"?: number;
    "latestSupplyPrice"?: number;
    "isStock"?: boolean;
    "minStock"?: number;
    "ordUnit"?: number;
    "productFee"?: number;
    "active"?: boolean;
    "vtsz"?: string;
    "ean"?: string;
    "vatRateCode": string = '';
    "vatPercentage"?: number;
    "noDiscount": boolean = false;
    "exhangedUnitPrice1"?: number;
    "exhangedUnitPrice2"?: number;

    constructor(s: Stock) {
        const stock = s as any;
        Object.keys(stock).forEach((key: string) => {
            (this as any)[key] = stock[key];
        });
    }

    public FillProductFields(p: Product): void {
        const product = p as any;
        Object.keys(product).forEach((key: string) => {
            (this as any)[key] = product[key];
        });
    }
}