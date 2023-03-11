export interface PendingDeliveryNote {
    additionalAddressDetail: string
    city: string
    comment: string
    countryCode: string
    countyCode: string
    customerBankAccountNumber: string | null
    customerName: string
    customerVatStatus: string
    email: string | null
    fullAddress: string
    id: number
    isOwnData: boolean
    postalCode: string
    region: string | null
    taxpayerId: string
    taxpayerNumber: string
    thirdStateTaxId: string | null
    vatCode: string
}
