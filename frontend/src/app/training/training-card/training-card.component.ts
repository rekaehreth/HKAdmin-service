import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth.service';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
import { HttpService } from 'src/app/httpService';
import { RawCoach, RawTraining, RawUser } from 'src/app/types';
import { formatFullDate, formatHourDate } from 'src/app/utils';
import { NewTrainingComponent } from '../new-training/new-training.component';
import { ManageTrainingFinancesDialogComponent } from './manage-training-finances-dialog/manage-training-finances-dialog.component';
import { RegisterGuestDialogComponent } from './register-guest-dialog/register-guest-dialog.component';
import { RegistrationRoleDialogComponent } from './registration-role-dialog/registration-role-dialog.component';

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
    openEditTrainingDialog() {
        this.dialog.open(NewTrainingComponent, {
            width: '50vw',
            data: this.trainingData,
            disableClose: true,
        });
    }
    deleteTraining() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '50vw',
            data: "Do you really want to delete this training?",
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(async result => {
            if (result.result === "confirm") {
                this.http.delete(`training/${this.trainingData.id}`);
                this.refreshTrainings.emit("update");
            }
        });
    }
    async addUserToTraining() {
        const roles = this.authService.getLoggedInRoles();
        if (roles.includes("admin")) {
            const adminIndex = roles.indexOf("admin");
            roles.splice(adminIndex, 1);
        }
        if( roles.length === 0) {
            this.addGuestToTraining();
        }
        if (roles.length === 1) {
            if (roles[0] === "guest") {
                this.addGuestToTraining();
            }
            else if (roles[0] === "trainee") {
                await this.addTraineeToTraining();
            }
            else if (roles[0] === "coach") {
                await this.addCoachToTraining();
            }
        }
        else {
            const dialogRef = this.dialog.open(RegistrationRoleDialogComponent, {
                width: '50vw',
                data: roles,
                disableClose: true,
            });
            dialogRef.afterClosed().subscribe(result => {
                if(result.action === "save") {
                    if (result.role === "coach") {
                        this.addCoachToTraining();
                    }
                    else if (result.role === "trainee") {
                        this.addTraineeToTraining();
                    }
                }
                else {
                    window.alert("Registration cancelled");
                }
            });
        }
        // **TODO** successfull registration popup
        // **TODO** a payment should always contain the name and email address of the linked user
        // **TODO** change icon from person_add to person_remove
    }
    async addTraineeToTraining() {
        const userId = this.authService.getLoggedInUserId();
        const user = await this.http.get<RawUser>(`user/${userId}`);
        this.http.post<{}>('user/addToTraining', {
            userId: userId,
            trainingId: this.trainingData.id
        });
        const amount: number = (-1) * 4000;
        this.http.post<{}>('finance/new', {
            userId : userId,
            trainingId: this.trainingData.id,
            rawPaymentData : {
                amount : amount,
                time: new Date(), 
                status : "pending", 
                description: `Training ${user.name} ${user.email}, ${this.trainingData.location.name} ${formatFullDate(this.trainingData.startTime)} ${formatHourDate(this.trainingData.startTime)}-${formatHourDate(this.trainingData.endTime)}`
            }
        });
        window.alert("Registration successful");
        // **TODO** Handle time differences --> 50 mins - 4000, 110 min - 8000, 
        // **TODO** Handle fix wage / training vs. fix wage per capita
    }
    async addCoachToTraining() {
        const userId = this.authService.getLoggedInUserId();
        this.http.post<{}>('user/addCoachToTraining', {
            userId: userId,
            trainingId: this.trainingData.id
        });
        const coach = await this.http.get<RawCoach>(`user/getCoach/${userId}`);
        this.http.post<{}>('finance/new', {
            userId : userId,
            trainingId: this.trainingData.id,
            rawPaymentData : {
                amount : coach.wage,
                time: new Date(),
                status : "pending",
                description: `Coaching ${coach.user.name} ${coach.user.email}, ${this.trainingData.location.name} ${formatFullDate(this.trainingData.startTime)} ${formatHourDate(this.trainingData.startTime)}-${formatHourDate(this.trainingData.endTime)}`
            }
        });
        window.alert("Registration successful");
    }
    async addGuestToTraining() {
        let user!: RawUser;
        const dialogRef = this.dialog.open(RegisterGuestDialogComponent, {
            width: '50vw',
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(async result => {
            console.log("Register guest dialog closed.", result);
            if(result.action === "save") {
                user = result.user;
                this.http.post<{}>('user/addTraineeToTraining', {
                    userId: user.id,
                    trainingId: this.trainingData.id
                });
                const amount: number = (-1) * 4000;
                this.http.post<{}>('finance/new', {
                    userId : user.id,
                    rawPaymentData : {
                        amount : amount,
                        time: this.trainingData.startTime,
                        status : "pending", 
                        description: `Training ${user.name} ${user.email}, ${this.trainingData.location.name} ${formatFullDate(this.trainingData.startTime)} ${formatHourDate(this.trainingData.startTime)}`
                    }
                });
                window.alert("Registration successful");
            }
            else {
                window.alert("Registration cancelled");
            }
        });
    }
    openAdministrateTrainingDialog(): void {
        this.dialog.open(ManageTrainingFinancesDialogComponent, {
            width: '50vw',
            data: this.trainingData,
            disableClose: true,
        });
    }
}
