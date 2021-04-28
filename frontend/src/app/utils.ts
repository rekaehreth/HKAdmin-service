import { AbstractControl, ValidatorFn } from "@angular/forms";
import { format } from "date-fns";

export const formatFullDate = (date: Date): string => {
    return format(new Date(date), "yyyy.MM.dd.");
}
export const formatHourDate = (date: Date): string => {
    return format(new Date(date), "HH:mm");
}
export function nameValidator(): ValidatorFn {
    const nameRegEx: RegExp = new RegExp('^([A-Z]|[ÁÉÍÓÖŐÚÜŰ])(([a-z]|[áéíóöőúüű])*)( ([A-Z]|[ÁÉÍÓÖŐÚÜŰ])(([a-z]|[áéíóöőúüű])*))+$');
    return (control: AbstractControl): { [key: string]: any } | null => {
        const correct = nameRegEx.test(control.value);
        return correct ? null : { nameRegEx: { value: control.value } };
    };
}
