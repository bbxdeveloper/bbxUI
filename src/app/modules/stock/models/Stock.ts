export class Stock {
    "warehouseID": number;
    "warehouse": string;
    "productID": number;
    "productCode": string;
    "product": string;
    "calcQty": number;
    "realQty": number;
    "outQty": number;
    "avgCost": number;
    "latestIn"?: string;
    "latestOut"?: string;
}