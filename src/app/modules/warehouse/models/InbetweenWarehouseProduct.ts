import { IEditable } from "src/assets/model/IEditable"

export class InbetweenWarehouseProduct implements IEditable {
    productCode: string = ''
    productDescription: string = ''
    quantity: number = 0
    unitOfMeasureX: string = ''
    currAvgCost: number = 0

    public get value() {
        return this.quantity * this.currAvgCost
    }

    IsUnfinished(): boolean {
        return false
    }
}
