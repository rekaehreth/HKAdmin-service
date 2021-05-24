import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { format } from 'date-fns';
import { AuthService } from '../auth.service';
import { HttpService } from '../httpService';
import { RawTraining } from '../types';
import { formatFullDate, formatHourDate } from '../utils';
import { NewTrainingComponent } from './new-training/new-training.component';

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.scss']
})

export class TrainingComponent implements OnInit {
    colNum: number = 5;
    trainings: RawTraining[] = [];
    roles: string[] = [];

    formatFullDate = formatFullDate;
    formatHourDate = formatHourDate;
    constructor(
        private http: HttpService,
        public dialog: MatDialog,
        private authService: AuthService,
    ) {
        this.authService.loginStatusChange.subscribe( _ => { this.loadTrainings() });
    }
    ngOnInit(): void {
        this.loadTrainings();
        this.roles = this.authService.getLoggedInRoles();
    }
    async loadTrainings(): Promise<void> {
        this.trainings = await this.http.get<RawTraining[]>('training');
        if( this.trainings.length != 0 ){
            this.trainings.sort((a: RawTraining, b: RawTraining) => {
                if( a.startTime < b.startTime ) {
                    return -1;
                }
                if( a.startTime === b.startTime ) {
                    return 0;
                }
                if( a.startTime > b.startTime ) {
                    return 1;
                }
                return -1;
            });
        }
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
