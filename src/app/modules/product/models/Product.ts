export interface Product {
    id: number,
    productCode?: any,
    description?: string,
    productGroup?: any,
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
}
