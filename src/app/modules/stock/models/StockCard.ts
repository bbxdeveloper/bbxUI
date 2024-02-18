import { ICellStatusProvider } from "../../shared/ICellStatusProvider";
import { Status } from "../../shared/Status";

type PickAsFunction<T, U extends keyof T> =  { [P in U]: (input: T) => Status}

type StockCardIntersectionForCellStatusProvider = Required<PickAsFunction<StockCard, 'xRealQty'>>

export class StockCard implements ICellStatusProvider {
    id: number = 0
    stockID: number = 0
    warehouseID: number = 0
    warehouse: string = ''
    userID: number = 0
    userName?: string = undefined
    invoiceLineID: number = 0
    productID: number = 0
    productCode: string = ''
    product: string = ''
    customerID: number = 0
    customer?: string = undefined
    customerCity?: string = undefined
    customerAdditionalAddressDetail?: string = undefined
    stockCardDate: string = ''
    scType: string = ''
    scTypeX: string = ''
    oRealQty: number = 0
    xRealQty: number = 0
    nRealQty: number = 0
    oAvgCost: number = 0
    nAvgCost: number = 0
    xRel: string = ''

    private static statuses: StockCardIntersectionForCellStatusProvider = {
        xRealQty: (stockCard: StockCard): Status => stockCard.xRealQty <= 0 ? Status.Success : Status.Warning,
    }

    public getCellStatus(cell: string): Status {
        if (cell in StockCard.statuses) {
            return (StockCard.statuses as any)[cell](this)
        }

        return Status.None
    }
}