import { IEditable } from "src/assets/model/IEditable"
import { HelperFunctions } from "src/assets/util/HelperFunctions"
import { Product } from "../../product/models/Product"
import { ProductStock } from "../../stock/models/ProductStock"
import { MementoObject } from "src/assets/model/MementoObject"

export class InbetweenWarehouseProduct extends MementoObject implements IEditable {
    productID: number|undefined
    productCode: string = ''
    productDescription: string = ''

    unitOfMeasureX: string = ''
    currAvgCost: number = 0

    private _quantity: number = 0
    public get quantity(): number {
        return this._quantity
    }
    public set quantity(value: any) {
        this._quantity = Number(value)
    }

    private _realQty: number = 0
    public get realQty(): number {
        return this._realQty
    }

    public get value() {
        return HelperFunctions.Round2(this.quantity * this.currAvgCost, 1)
    }

    private constructor() {
        super()
    }

    public static makeEmpty(): InbetweenWarehouseProduct {
        return new InbetweenWarehouseProduct()
    }

    public static fromProductAndStock(product: Product, stock: ProductStock|undefined): InbetweenWarehouseProduct {
        const obj = new InbetweenWarehouseProduct

        obj.productID = product.id
        obj.productCode = product.productCode
        obj.productDescription = product.description ?? ''
        obj.unitOfMeasureX = product.unitOfMeasureX
        obj._realQty = stock?.realQty ?? 0
        obj.currAvgCost = stock?.avgCost ?? product.latestSupplyPrice!

        obj.Save()

        return obj
    }

    IsUnfinished(): boolean {
        return false
    }
}
