export interface VatRate {
    "id": number,
    "vatRateCode": string,
    "vatPercentage": number,
    "vatRateDescription": string;
}

export const OfflineVatRate = {
    VatRate27: {
        id: 0,
        vatRateCode: '27%',
        vatPercentage: 0.27,
        vatRateDescription: '27% (áfa%:27)'
    },
    KBAET: {
        id: 0,
        vatRateCode: 'KBAET',
        vatPercentage: 0,
        vatRateDescription: 'KBAET (áfa%:0)'
    },
    FA: {
        id: 0,
        vatRateCode: 'FA',
        vatPercentage: 0,
        vatRateDescription: 'FA (áfa%:0)'
    },
    TAM: {
        id: 0,
        vatRateCode: 'TAM',
        vatPercentage: 0,
        vatRateDescription: 'TAM (áfa%:0)'
    }
}