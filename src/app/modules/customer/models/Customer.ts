export interface Customer {
    // available in GET
    "id": number;
    /**
     * Not required!
     * 0000000-0-00
     */
    "taxpayerNumber"?: string;
    "customerName": string;
    /**
     * xxxxxxxx-yyyyyyyy-zzzzzzzz or XX99 9999 9999 9999 9999 9999 9999
     */
    "customerBankAccountNumber": string;
    "customerVatStatus": string;
    "privatePerson"?: boolean,
    "thirdStateTaxId": string;
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