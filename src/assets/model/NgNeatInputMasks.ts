import { createMask } from '@ngneat/input-mask';
import { onNegateKeepCaretPosition } from '../util/input/onNegateKeepCaretPosition';

export module NgNeatInputMasks {
    export const numberInputMask = createMask({
        alias: 'numeric',
        groupSeparator: ' ',
        digits: 2,
        digitsOptional: false,
        prefix: '',
        placeholder: '0.00',
        onBeforeWrite: onNegateKeepCaretPosition()
    });

    export const numberInputMaskSingle = createMask({
        alias: 'numeric',
        groupSeparator: ' ',
        digits: 1,
        digitsOptional: false,
        prefix: '',
        placeholder: '0.0',
    });

    export const offerDiscountInputMask = createMask({
        alias: 'numeric',
        groupSeparator: ' ',
        digits: 2,
        digitsOptional: false,
        prefix: '',
        placeholder: '0.00',
        max: 999.99,
        onBeforeWrite: onNegateKeepCaretPosition()
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