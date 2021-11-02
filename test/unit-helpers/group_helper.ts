import { Group } from "src/group/group.entity";

export const createTestGroup = ( partialGroup: Partial<Group> = {} ) => {
    return {
        ...defaultGroup, 
        ...partialGroup
    }
};

const defaultGroup: Group = {
    id: null, 
    name: 'testGroup',
    members: [],
    coaches: [],
    trainings: []
};