export interface CreateCounterRequest {
    "counterCode": string,
    "counterDescription": string,
    "warehouseCode": string,
    "prefix": string,
    "currentNumber": number,
    "numbepartLength": number,
    "suffix": string
}