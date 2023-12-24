import { HelperFunctions } from "src/assets/util/HelperFunctions"
import { UnitPriceTypes } from "../../customer/models/UnitPriceType"
import { OfflineUnitOfMeasures } from "./UnitOfMeasure"

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
    stocks?: ProductStockInfo[]
}

export class ProductRow implements Product {
    id: number = 0

    productCode?: any
    description?: string
    productGroup?: any
    productGroupCode?: string
    origin?: string

    unitOfMeasure?: any = OfflineUnitOfMeasures.PIECE.value
    unitOfMeasureX?: any = OfflineUnitOfMeasures.PIECE.text
    
    unitPrice1?: number = 0
    unitPrice2?: number = 0
    
    latestSupplyPrice?: number = 0
    
    isStock?: boolean
    minStock?: number = 0
    
    ordUnit?: number = 0
    
    productFee?: number = 0
    
    active?: boolean

    vtsz?: string = ''
    ean?: string = ''
    
    vatRateCode: string = '27%'
    vatPercentage?: number = 0.27
    
    noDiscount: boolean = false
    
    exhangedUnitPrice1?: number
    exhangedUnitPrice2?: number
    
    minMargin: number = 0
    
    unitWeight?: number

    stocks?: ProductStockInfo[] = []

    activeWareHouseId: number = -1
    get activeStockRealQty(): number {
        if (this.activeWareHouseId === -1
            || !this.stocks
            || this.stocks?.length === 0
            || this.stocks?.findIndex(x => x.warehouseID === this.activeWareHouseId) === -1) {
            return 0
        } else {
            return this.stocks.find(x => x.warehouseID === this.activeWareHouseId)!.realQty
        }
    }
}

export interface ProductStockInfo {
    id: number
    warehouseID: number
    realQty: number
    avgCost: number
    latestIn: string
    latestOut: string
}

export function getPriceByPriceType(product: Product, priceType: UnitPriceTypes|string): number {
    return priceType === UnitPriceTypes.List ? product.unitPrice1! : product.unitPrice2!
}

export function isProduct(val: any): boolean {
    return val && Object.keys(val).includes('productCode') && !HelperFunctions.isEmptyOrSpaces(val.productCode)
}

export function ProductToProductRow(p: Product, activeWareHouseId?: number): ProductRow {
    let result = new ProductRow()
    
    Object.keys(p).forEach(key => {
        (result as any)[key as keyof ProductRow] = p[key as keyof Product]
    })

    result.activeWareHouseId = activeWareHouseId ?? -1

    return result
}