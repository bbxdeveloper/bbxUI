import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function forbiddenValueValidator(valueRe: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const forbidden = valueRe.test(control.value);
        return forbidden ? { forbiddenValue: { value: control.value } } : null;
    };
}

export function todaysDate(control: AbstractControl) {
    const wrong = new Date(control.value) > new Date();
    // console.log(new Date(control.value), new Date(), wrong);
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