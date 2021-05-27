import { AbstractControl, ValidatorFn } from "@angular/forms";
import { format, parse } from 'date-fns';
import { Application } from "./types";

export const formatFullDate = (date: Date): string => {
    // let dateString: string = "";
    // parse(dateString, "yyyy.MM.dd", date, { weekStartsOn: 1});
    // return dateString;
    return format(new Date(date), "yyyy.MM.dd.");
    // return formatToTimeZone(new Date(date), "yyyy.MM.dd.", {timeZone: "Europe/Budapest"});
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

export function findUserInApplications(userId: number, applications: Application[]): number {
    let idx = -1;
    applications.map( (value, index) => {
        if ( value.userId === userId){ 
            idx = index;
        }
    })
    return idx;
}
