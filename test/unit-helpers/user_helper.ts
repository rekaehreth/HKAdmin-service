import { User } from "src/user/user.entity";

export const createTestUser = ( partialUser: Partial<User> = {} ) => {
    return {
        ...defaultUser, 
        ...partialUser
    }
};

export const createPartialTestUser = ( partialUser: Partial<User> = {} ) => {
    return {
        ...defaultCreateUser, 
        ...partialUser
    }
};

const defaultCreateUser = {
    name: "test_name",
    roles: "",
    email: "test@test.com",
    password: "testpassword",
    birth_date: new Date('2021.11.01'), // fucking timezones
};

const defaultUser: User = {
    id: null, 
    trainings: [],
    name: "test_name",
    roles: "",
    email: "test@test.com",
    password: "testpassword",
    groups: [],
    birth_date: new Date('2021.11.01'), // fucking timezones
    payments : []
};
