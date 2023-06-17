export interface PaymentMethod {
    value: string;
    text: string;
    icon?: any,
    data?: any
}

export enum PaymentMethods {
    Transfer = 'TRANSFER',
    Cash = 'CASH',
    Card = 'CARD'
}

export const OfflinePaymentMethods = {
    Transfer: {
        "value": "TRANSFER",
        "text": "Átutalás",
        "icon": null,
        "data": null
    },
    Cash: {
        "value": "CASH",
        "text": "Kp",
        "icon": null,
        "data": null
    },
    Card: {
        "value": "CARD",
        "text": "Kártya",
        "icon": null,
        "data": null
    }
}