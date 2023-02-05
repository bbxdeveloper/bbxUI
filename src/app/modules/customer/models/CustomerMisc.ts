export module CustomerMisc {
    export const CustomerNgxMaskPatterns: any = {
        'X': { pattern: new RegExp('\[A-Z0-9\]'), symbol: 'X' },
        'T': { pattern: new RegExp('\[a-zA-Z0-9\]'), symbol: '_' },
        'U': { pattern: new RegExp('\[0-9\]'), symbol: '_' },
        'Y': { pattern: new RegExp('\[A-Z\]'), symbol: 'Y' },
    };
    export const TaxNumberNgxMask: string = 'TTTUUUU-U-UU';
    export const IbanPattern: string = 'SS00 0000 0000 0000 0000 0000 0000';
    export const DefaultPattern: string = '00000000-00000000-00000000';
}