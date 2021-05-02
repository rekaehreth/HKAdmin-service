import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/httpService';
import { RawLocation } from 'src/app/types';
import { formatFullDate, formatHourDate } from 'src/app/utils';

@Component({
    selector: 'app-new-training',
    templateUrl: './new-training.component.html',
    styleUrls: ['./new-training.component.scss']
})
export class NewTrainingComponent implements OnInit {
    selectedLocationId: number = 0;
    locations: RawLocation[] = [];
    mode: string = "new";
    displayDate: Date = new Date();
    startHour: Date = new Date();
    endHour: Date = new Date();

    dateControl = new FormControl();
    startTimeControl = new FormControl();
    endTimeControl = new FormControl();

    formatFullDate = formatFullDate;
    formatHourDate = formatHourDate;

    constructor(
        private http: HttpService,
        public dialogRef: MatDialogRef<NewTrainingComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }
    ngOnInit(): void {
        this.loadLocations();
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
        console.log(this.locations);
    }
    async saveTraining(): Promise<void> {
        const newTraining = await this.http.post<{}>('training/new', {
            locationId: this.selectedLocationId, 
            rawTrainingData: { 
                startTime: formatFullDate(this.dateControl.value) + " " + this.startTimeControl.value, 
                endTime: formatFullDate(this.dateControl.value) + " " + this.endTimeControl.value
            }});
        console.log(newTraining);
        this.dialogRef.close({refreshNeeded: true});
    } 
    cancel() {
        this.dialogRef.close({refreshNeeded: false});
    }
}
