import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function forbiddenValueValidator(valueRe: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const forbidden = valueRe.test(control.value);
        return forbidden ? { forbiddenValue: { value: control.value } } : null;
    };
}

export function todaysDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        
        const forbidden = valueRe.test(control.value);
        return forbidden ? { forbiddenValue: { value: control.value } } : null;
    };
}