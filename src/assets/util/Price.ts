export class Price {
    public static all(quantity: number, singlePrice: number): number {
        if (quantity <= 0)
            throw new Error('quantity must be bigger than 0')

        return quantity * singlePrice
    }

    public static gross(netPrice: number, vatRate: number): number {
        if (vatRate < 0)
            throw new Error('vatRate can not be smaller than 0')

        if (vatRate > 1)
            throw new Error('vatRate can not be bigger than 1')

        return netPrice * (1 + vatRate)
    }
}
