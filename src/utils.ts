export function parseTrainingApplications( applications: string ): Application[] {
    return applications.split(";").map(record => {
        const splitRecord = record.split(" ");
        return { userId: parseInt(splitRecord[0]), groupId: parseInt(splitRecord[1]), role: splitRecord[2] } 
    });
}

export function stringifyTrainingApplications( applications: Application[] ): string {
    return applications.map( application => {return Object.values(application).join(' '); }).join(';');
}

export function addApplicationToTraining( applicationToAdd: Application, applicationsString: string ): string {
    const applications = parseTrainingApplications(applicationsString);
    const index = findUserInApplications( applicationToAdd.userId, applications );
    if( index < 0 ) {
        applications.push(applicationToAdd);
    }
    return stringifyTrainingApplications(applications);
}

export function removeApplicationFromTraining( applicationToRemove: Application, applicationsString: string ): string {
    const applications = parseTrainingApplications(applicationsString);
    const index = findUserInApplications( applicationToRemove.userId, applications );
    if( index >= 0 ) {
        applications.splice(index, 1);
    }
    return stringifyTrainingApplications(applications);
}

function findUserInApplications(userId: number, applications: Application[]): number {
    let idx = -1;
    applications.map( (value, index) => {
        if ( value.userId === userId){ 
            idx = index;
        }
    })
    return idx;
}

export type Application = {userId: number, groupId: number, role: string};