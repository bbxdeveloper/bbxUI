import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function forbiddenValueValidator(valueRe: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const forbidden = valueRe.test(control.value);
        return forbidden ? { forbiddenValue: { value: control.value } } : null;
    };
}

export function todaysDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const wrong = new Date(control.value) > new Date();
        return wrong ? { dateIsBiggerThanToday: { value: control.value } } : null;
    };
}

export function minDate(minDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const wrong = new Date(control.value) < minDate;
        return wrong ? { dateIsSmallerThanMin: { value: control.value } } : null;
    };
}

export function maxDate(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const wrong = new Date(control.value) > maxDate;
        return wrong ? { dateIsBiggerThanMax: { value: control.value } } : null;
    };
}