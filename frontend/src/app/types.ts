export type RawTraining = {
    id: number,
    location: any,
    attendees: any[],
    coaches: any[],
    groups: any[],
    startTime: Date,
    endTime: Date,
    status: string, // Planned | Fixed | Past
}

export type RawUser = {
    id : number;
    trainings : any[];
    name : string;
    roles : string; // trainee | coach | guardian | guest | admin
    email : string;
    username : string;
    password : string;
    groups : any[];
    birth_date : Date;
    payments : any[];
    // children : any[];
}

export type RawCoach = {
    id: number, 
    user: RawUser,
    groups: RawGroup[],
    trainings: RawTraining[],
    wage: number
}

export type RawLocation = {
    id : number;
    name : string;
    capacity : number;
    min_attendees : number;
    trainings : any[];
}

export type RawGroup = {
    id : number;
    name : string;
    members : any[];
    coaches : any[];
    trainings : any[];
}

export type RawPayment = {
    id : number;
    amount : number;
    time : Date;
    status : string; // Paid | Pending
    description : string; // E.g. Edzés, Gyakorló Jégcsarnok 2021.04.18. 9:00
    notes : string; // E.g. Credentials of deleted user
    user : RawUser;
}