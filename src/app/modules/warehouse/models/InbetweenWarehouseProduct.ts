import { IEditable } from "src/assets/model/IEditable"
import { HelperFunctions } from "src/assets/util/HelperFunctions"
import { Product } from "../../product/models/Product"
import { ProductStock } from "../../stock/models/ProductStock"

export class InbetweenWarehouseProduct implements IEditable {
    productID: number|undefined
    productCode: string = ''
    productDescription: string = ''
    quantity: number = 0
    unitOfMeasureX: string = ''
    currAvgCost: number = 0

    private constructor() {}

    public static makeEmpty(): InbetweenWarehouseProduct {
        return new InbetweenWarehouseProduct()
    }

    public static fromProductAndStock(product: Product, stock: ProductStock|undefined): InbetweenWarehouseProduct {
        const obj = new InbetweenWarehouseProduct

        obj.productID = product.id
        obj.productCode = product.productCode
        obj.productDescription = product.description ?? ''
        obj.unitOfMeasureX = product.unitOfMeasureX
        obj.currAvgCost = stock?.avgCost ?? product.latestSupplyPrice!

        return obj
    }

    public get value() {
        return HelperFunctions.Round2(this.quantity * this.currAvgCost, 1)
    }

    IsUnfinished(): boolean {
        return false
    }
}
