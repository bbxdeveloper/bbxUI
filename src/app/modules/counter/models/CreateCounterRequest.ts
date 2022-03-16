export interface CreateCounterRequest {
    "counterCode": string,
    "counterDescription": string,
    "warehouse": string,
    "prefix": string,
    "currentNumber": number,
    "numbepartLength": number,
    "suffix": string
}