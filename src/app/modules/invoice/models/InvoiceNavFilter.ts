import { HelperFunctions } from "src/assets/util/HelperFunctions"

export class InvoiceNavFilter {
    public InvoiceType: string = ''
    public WarehouseCode: string = ''
    public InvoiceIssueDateFrom: string = ''
    public InvoiceIssueDateTo: string = ''
    public InvoiceDeliveryDateFrom: string = ''
    public InvoiceDeliveryDateTo: string = ''
    public DateFilterChooser: string = ''
    public CustomerSearch?: string = undefined
    public CustomerID?: number

    public static create(): InvoiceNavFilter {
        return {
            InvoiceType: '',
            WarehouseCode: '',
            InvoiceIssueDateFrom: HelperFunctions.GetDateString(0, 0, -1),
            InvoiceIssueDateTo: HelperFunctions.GetDateString(),
            InvoiceDeliveryDateFrom: HelperFunctions.GetDateString(),
            InvoiceDeliveryDateTo: HelperFunctions.GetDateString(),
            DateFilterChooser: '1',
            CustomerSearch: undefined,
            CustomerID: undefined
        } as InvoiceNavFilter
    }

    private constructor() { }
}
