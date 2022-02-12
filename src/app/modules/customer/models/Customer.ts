export interface Customer {
    // available in GET
    "id": number;
    "customerName": string;
    "customerBankAccountNumber": string;
    "customerVatStatus": string;
    "privatePerson"?: boolean,
    "taxpayerId"?: string,
    "vatCode": string;
    "thirdStateTaxId": string;
    "countryCode": string;
    "countyCode": string;
    "region": string;
    "postalCode": string;
    "city": string;
    "additionalAddressDetail": string;
    // misc
    "comment"?: string;
    "createTime"?: string;
    "updateTime"?: string;
    "deleted"?: boolean;
}