export interface UpdateCounterRequest {
    "id": number,
    "counterCode": string,
    "counterDescription": string,
    "warehouseCode": string,
    "prefix": string,
    "currentNumber": number,
    "numbepartLength": number,
    "suffix": string
}