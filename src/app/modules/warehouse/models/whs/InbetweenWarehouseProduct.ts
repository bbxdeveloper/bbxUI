import { IEditable } from "src/assets/model/IEditable"
import { HelperFunctions } from "src/assets/util/HelperFunctions"
import { MementoObject } from "src/assets/model/MementoObject"
import { Product } from "src/app/modules/product/models/Product"
import { ProductStock } from "src/app/modules/stock/models/ProductStock"

export class InbetweenWarehouseProduct extends MementoObject implements IEditable {
    private _productID: number|undefined
    public get productID(): number|undefined {
        return this._productID
    }

    public productCode: string = ''

    private _productDescription: string = ''
    public get productDescription(): string {
        return this._productDescription
    }

    private _unitOfMeasure: string = ''
    public get unitOfMeasure(): string {
        return this._unitOfMeasure
    }

    private _unitOfMeasureX: string = ''
    public get unitOfMeasureX(): string {
        return this._unitOfMeasureX
    }

    private _currAvgCost: number = 0
    public get currAvgCost(): number {
        return this._currAvgCost
    }

    private _quantity: number = 0
    public get quantity(): number {
        return this._quantity
    }
    public set quantity(value: any) {
        if (typeof value === 'string') {
            value = value.replace(/\s/, '')
        }
        this._quantity = Number(value)
    }

    private _realQty: number = 0
    public get realQty(): number {
        return this._realQty
    }

    public get linePrice() {
        return HelperFunctions.Round2(this.quantity * this.currAvgCost, 1)
    }

    private constructor() {
        super()
    }

    public static makeEmpty(): InbetweenWarehouseProduct {
        return new InbetweenWarehouseProduct()
    }

    public static fromProductAndStock(product: Product, stock: ProductStock|undefined): InbetweenWarehouseProduct {
        const obj = new InbetweenWarehouseProduct()

        obj.productCode = product.productCode

        obj._productID = product.id
        obj._productDescription = product.description ?? ''
        obj._unitOfMeasure = product.unitOfMeasure
        obj._unitOfMeasureX = product.unitOfMeasureX
        obj._realQty = stock?.realQty ?? 0
        obj._currAvgCost = stock?.avgCost ?? product.latestSupplyPrice!

        obj.Save()

        return obj
    }

    public IsUnfinished(): boolean {
        return false
    }

    public isSaveable(): boolean {
        return this.quantity > 0
    }
}
