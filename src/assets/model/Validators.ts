import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { HelperFunctions } from '../util/HelperFunctions';

export function forbiddenValueValidator(valueRe: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const forbidden = valueRe.test(control.value);
        return forbidden ? { forbiddenValue: { value: control.value } } : null;
    };
}

export function todaysDate(control: AbstractControl) {
    const wrong = new Date(control.value) > new Date();
    if (control.value === null || control.value === undefined || (control.value + '').length === 0 || (control.value + '').trim().length === 0) {
        return null;
    }
    return wrong ? { todaysDate: { value: control.value } } : null;
}

export function minDate(minDate?: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (minDate === undefined) {
            return null;
        }
        const wrong = new Date(control.value) < minDate;
        return wrong ? { minDate: { value: control.value } } : null;
    };
}

export function maxDate(maxDate?: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (maxDate === undefined) {
            return null;
        }
        const wrong = new Date(control.value) > maxDate;
        return wrong ? { maxDate: { value: control.value } } : null;
    };
}

export function validDate(control: AbstractControl) {
    if (control.value === null || control.value === undefined || (control.value + '').length === 0 || (control.value + '').trim().length === 0) {
        return null;
    }
    const wrong = !HelperFunctions.IsDateStringValid(control.value + '');
    return wrong ? { validDate: { value: control.value } } : null;
}
