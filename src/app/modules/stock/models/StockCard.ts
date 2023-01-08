export class StockCard {
    "id": number;
    "stockID": number;
    "warehouseID": number;
    "warehouse": string;
    "userID": number;
    "userName"?: string;
    "invoiceLineID": number;
    "productID": number;
    "productCode": string;
    "product": string;
    "customerID": number;
    "customer"?: string;
    "customerCity"?: string;
    "customerAdditionalAddressDetail"?: string;
    "stockCardDate": string;
    "scType": string;
    "scTypeX": string;
    "oRealQty": number;
    "xRealQty": number;
    "nRealQty": number;
    "oAvgCost": number;
    "nAvgCost": number;
    "xRel": string;
}