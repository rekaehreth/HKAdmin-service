import { format } from "date-fns";

export const formatFullDate = (date: Date): string => {
        return format(new Date(date), "yyyy.MM.dd.");
    }
export const formatHourDate = (date: Date): string => {
        return format(new Date(date), "HH:mm");
    }
