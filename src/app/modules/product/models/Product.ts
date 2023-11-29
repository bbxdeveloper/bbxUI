import { UnitPriceTypes } from "../../customer/models/UnitPriceType"

export interface Product {
    id: number,
    productCode?: any,
    description?: string,
    productGroup?: any,
    productGroupCode?: string
    origin?: string,
    unitOfMeasure?: any,
    unitOfMeasureX?: any,
    unitPrice1?: number,
    unitPrice2?: number,
    latestSupplyPrice?: number,
    isStock?: boolean,
    minStock?: number,
    ordUnit?: number,
    productFee?: number,
    active?: boolean,
    vtsz?: string,
    ean?: string,
    vatRateCode: string,
    vatPercentage?: number,
    noDiscount: boolean,
    exhangedUnitPrice1?: number,
    exhangedUnitPrice2?: number,
    minMargin: number,
    unitWeight?: number,
}

export function getPriceByPriceType(product: Product, priceType: UnitPriceTypes|string): number {
    return priceType === UnitPriceTypes.List ? product.unitPrice1! : product.unitPrice2!
}
