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