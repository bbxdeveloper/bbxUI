export interface UpdateCounterRequest {
    "id": number,
    "counterCode": string,
    "counterDescription": string,
    "warehouse": string,
    "prefix": string,
    "currentNumber": number,
    "numbepartLength": number,
    "suffix": string
}