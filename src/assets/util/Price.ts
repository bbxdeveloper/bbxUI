import { CurrencyCodes } from "src/app/modules/system/models/CurrencyCode"
import { HelperFunctions } from "./HelperFunctions"

export class Price {
    public static all(quantity: number, singlePrice: number): number {
        if (quantity <= 0)
            throw new Error('quantity must be bigger than 0')

        return quantity * singlePrice
    }

    public static vatRate(price: number, vatRate: number): number {
        if (vatRate < 0)
            throw new Error('vatRate can not be smaller than 0')

        if (vatRate > 1)
            throw new Error('vatRate can not be bigger than 1')

        return price * vatRate
    }

    public static gross(netPrice: number, vatRate: number): number {
        return netPrice + Price.vatRate(netPrice, vatRate)
    }

    public static currencyGrossRound(grossPrice: number, currency: CurrencyCodes): number {
        return HelperFunctions.Round2(grossPrice, currency === CurrencyCodes.HUF ? 1 : 2)
    }
}
