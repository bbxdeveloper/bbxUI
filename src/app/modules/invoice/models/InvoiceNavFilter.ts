import { HelperFunctions } from "src/assets/util/HelperFunctions"

export const ChosenIssueFilterOptionValue: string = '1';
export const ChosenDeliveryFilterOptionValue: string = '2';
export const DefaultChosenDateFilter: string = '1';

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

    get chosenDateFilter(): string {
        return this.DateFilterChooser ?? DefaultChosenDateFilter;
    }

    get isIssueFilterSelected(): boolean { return this.chosenDateFilter === ChosenIssueFilterOptionValue; }
    get isDeliveryFilterSelected(): boolean { return this.chosenDateFilter === ChosenDeliveryFilterOptionValue; }

    // Radio 1
    get GetInvoiceIssueDateFrom(): string | null {
        return this.isIssueFilterSelected ? this.InvoiceIssueDateFrom : null
    }
    get GetInvoiceIssueDateTo(): string | null {
        return this.isIssueFilterSelected ? this.InvoiceIssueDateTo : null
    }

    // Radio 2
    get GetInvoiceDeliveryDateFrom(): string | null {
        return this.isDeliveryFilterSelected ? this.InvoiceDeliveryDateFrom : null
    }
    get GetInvoiceDeliveryDateTo(): string | null {
        return this.isDeliveryFilterSelected ? this.InvoiceDeliveryDateTo : null
    }

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
