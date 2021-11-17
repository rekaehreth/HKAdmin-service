import { Location } from "src/location/location.entity";

export const createTestLocation = ( partialLocation: Partial<Location> = {} ) => {
    return {
        ...defaultLocation,
        ...partialLocation
    }
}

const defaultLocation: Location = {
    id : null,
    name: 'Test Location',
    capacity: 0,
    min_attendees: 0,
    trainings: [],
    plus_code: ''
}