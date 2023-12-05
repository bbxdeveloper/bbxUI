export interface SendInvoiceToNavResponse {
    succeeded: boolean,
    message: string,
    errors: string[],
    data: unknown|null
}