import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/httpService';
import { RawLocation } from 'src/app/types';
import { formatFullDate } from 'src/app/utils';

@Component({
    selector: 'app-new-training',
    templateUrl: './new-training.component.html',
    styleUrls: ['./new-training.component.scss']
})
export class NewTrainingComponent implements OnInit {
    selectedLocationId: number = 0;
    locations: RawLocation[] = [];
    mode: string = "new";

    dateControl = new FormControl("", Validators.required);
    startTimeControl = new FormControl("", Validators.required);
    endTimeControl = new FormControl("", Validators.required);

    formatFullDate = formatFullDate;

    constructor(
        private http: HttpService,
        public dialogRef: MatDialogRef<NewTrainingComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }
    ngOnInit(): void {
        this.loadLocations();
        if( this.data ) {
            this.mode = "edit";
        }
        console.log(this.mode);
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
        this.dialogRef.close()
    } 
}
