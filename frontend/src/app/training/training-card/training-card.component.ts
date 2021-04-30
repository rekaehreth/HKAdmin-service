import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpService } from 'src/app/httpService';
import { RawTraining } from 'src/app/types';
import { formatFullDate, formatHourDate } from 'src/app/utils';
import { NewTrainingComponent } from '../new-training/new-training.component';

@Component({
    selector: 'app-training-card',
    templateUrl: './training-card.component.html',
    styleUrls: ['./training-card.component.scss']
})
export class TrainingCardComponent implements OnInit {
    @Input()
    trainingData!: RawTraining;

    formatFullDate = formatFullDate;
    formatHourDate = formatHourDate;

    constructor(
        private http: HttpService,
        public dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        
    }
    openRegisterDialog() {

    }
    openEditTrainingDialog() {
        const dialogRef = this.dialog.open(NewTrainingComponent, {
            width: '50vw',
            data: this.trainingData,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(result => {
            
        })
    }
    deleteTraining() {
        this.http.delete(`training/${this.trainingData.id}`);
    }
}
