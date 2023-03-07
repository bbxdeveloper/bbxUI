import { HelperFunctions } from "src/assets/util/HelperFunctions"

export class OfferFilter {
    public offerNumber: string = ''
    public customerSearch: string = ''
    public customerName: string = ''
    public customerAddress: string = ''
    public customerTaxNumber: string = ''
    public offerIssueDateFrom: string = ''
    public offerIssueDateTo: string = ''
    public offerValidityDateFrom: string = ''
    public offerValidityDateTo: string = ''

    public static create(): OfferFilter {
        return {
            offerIssueDateFrom: HelperFunctions.GetDateString(0, -4),
            offerIssueDateTo: HelperFunctions.GetDateString(),
        } as OfferFilter
    }

    protected constructor() {}
}
