import { Training } from "src/training/training.entity";
import { createTestLocation } from "./location_helper";

export const createTestTraining = ( partialTraining: Partial<Training> = {} ) => {
    return {
        ...defaultTraining, 
        ...partialTraining
    }
};

const defaultTraining: Training = {
    id: null, 
    location: createTestLocation(), 
    attendees : [],
    coaches : [],
    groups : [],
    payments: [],
    startTime : new Date('2021.11.01 13:00'), // fucking timezones
    endTime : new Date('2021.11.01 13:50'), // fucking timezones
    status : 'test_status', // Planned | Fixed | Past
    type: 'test_type', // Száraz | Jeges | Balett 
    applications: ''
};