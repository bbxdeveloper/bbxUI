export interface CurrencyCode {
    value: string;
    text: string;
    icon?: any;
    data?: any;
}

export enum CurrencyCodes {
    HUF = 'HUF',
    EUR = 'EUR',
    USD = 'USD',
    FONT = 'Font'
}