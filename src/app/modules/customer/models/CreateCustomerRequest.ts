export interface CreateCustomerRequest {
    "customerName": string,
    "customerBankAccountNumber": string,
    "privatePerson": boolean,
    "vatCode": string,
    "taxpayerNumber": string,
    "thirdStateTaxId": string,
    "countryCode": string,
    "countyCode": string,
    "region": string,
    "postalCode": string,
    "city": string,
    "additionalAddressDetail": string,
    "comment": string
    "isOwnData": boolean;
}
