import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouteConfigLoadStart } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { HttpService } from 'src/app/httpService';
import { RawGroup, RawLocation } from 'src/app/types';
import { formatFullDate, formatHourDate } from 'src/app/utils';

@Component({
    selector: 'app-new-training',
    templateUrl: './new-training.component.html',
    styleUrls: ['./new-training.component.scss']
})
export class NewTrainingComponent implements OnInit {
    locations: RawLocation[] = [];
    selectedLocationId: number = 0;
    groups: RawGroup[]= [];
    selectedGroups: number[] = [];
    mode: string = "new";
    displayDate: Date = new Date();
    startHour: Date = new Date();
    endHour: Date = new Date();

    dateControl = new FormControl();
    startTimeControl = new FormControl();
    endTimeControl = new FormControl();
    groupControl = new FormControl();

    formatFullDate = formatFullDate;
    formatHourDate = formatHourDate;

    constructor(
        private http: HttpService,
        public dialogRef: MatDialogRef<NewTrainingComponent>,
        private authService: AuthService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }
    ngOnInit(): void {
        this.loadLocations();
        this.loadGroups();
        if( this.data ) {
            this.mode = "edit";
            this.selectedLocationId = this.data.location.id;
            this.displayDate = new Date(this.data.startTime);
            this.startHour = this.data.startTime;
            this.endHour = this.data.endTime;
        }
        this.initControls();
        console.log(this.data);
    }
    initControls() {
        this.dateControl = new FormControl(this.displayDate, Validators.required);
        this.startTimeControl = new FormControl(formatHourDate(this.startHour), Validators.required);
        this.endTimeControl = new FormControl(formatHourDate(this.endHour), Validators.required);
    }
    async loadLocations(): Promise<void> {
        this.locations = await this.http.get<RawLocation[]>('location');
        // console.log(this.locations);
    }
    async loadGroups(): Promise<void> {
        this.groups = await this.http.get<RawGroup[]>('group');
        console.log(this.groups);
    }
    async saveTraining(): Promise<void> {
        // if( this.mode === "new") {
        //     this.saveNewTraining();
        // }
        // else 
        // {
        //     this.updateTraining();
        // }
        const newTraining = await this.http.post<{}>('training/new', {
            locationId: this.selectedLocationId, 
            rawTrainingData: { 
                startTime: formatFullDate(this.dateControl.value) + " " + this.startTimeControl.value, 
                endTime: formatFullDate(this.dateControl.value) + " " + this.endTimeControl.value
            }});
        for( const groupId of this.selectedGroups ){
            await this.http.post<{}>('training/addGroupToTraining', {
                "groupId" : this.data.id,
                "trainingId" : groupId
            });
        }
        console.log(newTraining);
        this.dialogRef.close({refreshNeeded: true});
    } 
    // async saveNewTraining(): Promise<void> {

    // }
    // async updateTraining(): Promise<void> {

    // }
    async addTraineeToTraining() {
        const roles = this.authService.getLoggedInRoles();
        if ( roles.includes("admin") )
        {
            const adminIndex = roles.indexOf("admin");
            roles.splice(adminIndex);
        }
        if( roles.length === 1 && !roles.includes("guest")){
            const user = this.authService.getLoggedInUser();
            if( roles[0] === "trainee") {
                this.http.post<{}>('user/addToTraining', {
                    "userId" : user.id, 
                    "trainingId" : this.data.id
                });
            }
            else if( roles[0] === "coach") {
                const coachId = this.http.get<{}>(`user/getCoachId/${user.id}`);
                this.http.post<{}>('coach/addToTraining', {
                    "coachId" : coachId, 
                    "trainingId" : this.data.id
                });
            }
        }
        else {
            // dialog to choose from trainee / coach | guardian / child
        }
        // **TODO** change icon from person_add to person_remove
    }
    cancel() {
        this.dialogRef.close({refreshNeeded: false});
    }
}
