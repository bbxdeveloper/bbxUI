import moment from "moment"

export class NavInvoice {
    public constructor(
        public readonly invoiceNumber: string,
        public readonly invoiceIssueDate: string,
        public readonly invoiceDeliveryDate: string,
        public readonly customerName: string,
        public readonly customerTaxpayerNumber: string,
        public readonly customerThirdStateTaxId: string,
        public readonly currencyCodeX: string,
        public readonly invoiceNetAmount: number,
        public readonly invoiceVatAmount: number,
        public readonly invoiceGrossAmount: number,
    ){
    }

    public static create(): NavInvoice
    public static create(obj: NavInvoice): NavInvoice
    public static create(obj?: NavInvoice): NavInvoice {
        if (!obj) {
            return new NavInvoice('', '', '', '', '', '', '', 0, 0, 0)
        }

        const invoice = new NavInvoice(
            obj.invoiceNumber,
            moment(obj.invoiceIssueDate).format('YYYY-MM-DD'),
            moment(obj.invoiceDeliveryDate).format('YYYY-MM-DD'),
            obj.customerName,
            obj.customerTaxpayerNumber,
            obj.customerThirdStateTaxId,
            obj.currencyCodeX,
            obj.invoiceNetAmount,
            obj.invoiceVatAmount,
            obj.invoiceGrossAmount
        )

        return invoice
    }
}
