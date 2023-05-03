import { FormGroup } from "@angular/forms";
import { HelperFunctions } from "./HelperFunctions";

export module FormHelper {
    export function GetNumber(form?: FormGroup, controlName?: string): number | undefined {
        if (!(form && controlName && Object.keys(form.controls).includes(controlName))) {
            return undefined
        }

        return HelperFunctions.ToInt(form.controls[controlName].value)
    }
}