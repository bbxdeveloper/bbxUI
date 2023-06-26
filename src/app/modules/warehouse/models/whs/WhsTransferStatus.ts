export interface WhsTransferStatus {
    value: string
    text: string
    icon?: any
    data?: any
}

export enum TransferStatus {
    Ready = 'READY',
    Completed = 'COMPLETED'
}

export const OfflineWhsTransferStatus = {
    Ready: {
        "value": "READY",
        "text": "Elkészült",
        "icon": null,
        "data": null
    },
    Completed: {
        "value": "COMPLETED",
        "text": "Feldolgozott",
        "icon": null,
        "data": null
    }
}