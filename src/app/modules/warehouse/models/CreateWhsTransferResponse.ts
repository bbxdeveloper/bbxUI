// Part of the response
// Contains properties for the print
export interface CreateWhsTransferResponse {
    data: WhsTransfer|null|undefined
    errors: string[],
    message: string,
    succeeded: boolean
}

interface WhsTransfer {
    id: number,
    whsTransferNumber: string,
    copies: number,
}
