import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { format } from 'date-fns';
import { HttpService } from '../httpService';
import { RawTraining } from '../types';
import { NewTrainingComponent } from './new-training/new-training.component';

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.scss']
})

export class TrainingComponent implements OnInit {
    colNum: number = 5;
    trainings: any[] = [];
    
    constructor(
        private http: HttpService,
        public dialog: MatDialog,
        ) { }
    ngOnInit(): void {
        this.loadTrainings();
    }
    async loadTrainings(): Promise<void> {
        this.trainings = await this.http.get<RawTraining[]>('training');
        console.log(this.trainings);
    }
    formatFullDate(date: Date): string {
        return format(new Date(date), "yyyy.MM.dd HH:mm");
    }
    formatHourDate(date: Date): string {
        return format(new Date(date), "HH:mm");
    }
    setColNum(): boolean {
            const screenWidth = window.innerWidth;
            this.colNum = screenWidth / 360 >= 1 ? screenWidth / 360 : 1;

            return true;
    }
    openNewTrainingDialog() {
        const dialogRef = this.dialog.open(NewTrainingComponent, {
            width: '50vw',
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log("New training dialog closed ", result);
            if(result.refreshNeeded) {
                this.loadTrainings();
            }
        })
    }
}
