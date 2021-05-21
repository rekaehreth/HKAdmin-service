import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth.service';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
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
    roles: string[] = [];

    formatFullDate = formatFullDate;
    formatHourDate = formatHourDate;

    @Output()
    refreshTrainings: EventEmitter<string> = new EventEmitter();

    constructor(
        private http: HttpService,
        public dialog: MatDialog,
        private authService: AuthService,
    ) { }
    ngOnInit(): void { 
        this.roles = this.authService.getLoggedInRoles();
    }
    openRegisterDialog() { }
    openEditTrainingDialog() {
        const dialogRef = this.dialog.open(NewTrainingComponent, {
            width: '50vw',
            data: this.trainingData,
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
        })
    }
    deleteTraining() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '50vw',
            data: "Do you really want to delete this training?",
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(async result => {
            console.log(result);
            if (result.result === "confirm") {
                this.http.delete(`training/${this.trainingData.id}`);
                this.refreshTrainings.emit("update");
            }
        });
    }
}
