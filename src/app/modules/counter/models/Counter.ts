export interface Counter {
    "id": number,
    "counterCode": string,
    "counterDescription": string,
    "warehouse": string,
    "prefix": string,
    "currentNumber": number,
    "numbepartLength": number,
    "suffix": string,

    "createTime"?: string,
    "updateTime"?: string,
    
    "deleted"?: boolean
}