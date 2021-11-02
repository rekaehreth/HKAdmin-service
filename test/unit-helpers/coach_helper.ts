import { Coach } from "src/coach/coach.entity";
import { createTestUser } from "./user_helper";

export const createTestCoach = ( partialCoach: Partial<Coach> = {} ) => {
    return {
        ...defaultCoach, 
        ...partialCoach
    }
};

const defaultCoach: Coach = {
    id: null, 
    user: createTestUser(),
    groups: [],
    trainings: [],
    wage: 0
};