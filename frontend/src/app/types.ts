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