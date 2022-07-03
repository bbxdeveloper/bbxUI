import { createMask } from '@ngneat/input-mask';

export module NgNeatInputMasks {
    export const numberInputMask = createMask({
        alias: 'numeric',
        groupSeparator: ' ',
        digits: 2,
        digitsOptional: false,
        prefix: '',
        placeholder: '0.00',
    });

    export const offerDiscountInputMask = createMask({
        alias: 'numeric',
        groupSeparator: ' ',
        digits: 2,
        digitsOptional: false,
        prefix: '',
        placeholder: '0.00',
        max: 999.99,
    });

    export const numberInputMaskInteger = createMask({
        alias: 'numeric',
        groupSeparator: ' ',
        digits: 0,
        digitsOptional: true,
        prefix: '',
        placeholder: '',
    });
}