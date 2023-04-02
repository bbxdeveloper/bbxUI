import { HelperFunctions } from "src/assets/util/HelperFunctions"

export class InvoiceNavFilter {
    public warehouseCode: string = ''
    public invoiceIssueDateFrom: string = ''
    public invoiceIssueDateTo: string = ''
    public invoiceDeliveryDateFrom: string = ''
    public invoiceDeliveryDateTo: string = ''
    public dateFilterChooser: string = ''

    public static create(): InvoiceNavFilter {
        return {
            warehouseCode: '',
            invoiceIssueDateFrom: HelperFunctions.GetDateString(0, 0, -1),
            invoiceIssueDateTo: HelperFunctions.GetDateString(),
            invoiceDeliveryDateFrom: HelperFunctions.GetDateString(),
            invoiceDeliveryDateTo: HelperFunctions.GetDateString(),
            dateFilterChooser: '1'
        } as InvoiceNavFilter
    }

    private constructor() { }
}
