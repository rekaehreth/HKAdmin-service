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