import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import * as mapboxgl from 'mapbox-gl';
import OpenLocationCode, { CodeArea } from 'open-location-code-typescript';
import { AuthService } from 'src/app/auth.service';
import { HttpService } from 'src/app/httpService';
import { Application, RawCoach, RawGroup, RawTraining, RawUser } from 'src/app/types';
import { findUserInApplications, formatFullDate, formatHourDate } from 'src/app/utils';
import { environment } from 'src/environments/environment';
import { ManageTrainingFinancesDialogComponent } from './manage-training-finances-dialog/manage-training-finances-dialog.component';
import { RegisterGuestDialogComponent } from './register-guest-dialog/register-guest-dialog.component';

@Component({
    selector: 'app-training-details-dialog',
    templateUrl: './training-details-dialog.component.html',
    styleUrls: ['./training-details-dialog.component.scss']
})
export class TrainingDetailsDialogComponent implements OnInit {
    // MAP
    map!: mapboxgl.Map;
    googleMapsLink: string = "";
    style = 'mapbox://styles/mapbox/streets-v11';
    latitude = 37.75;
    longitude = -122.41;
    plus_code: string = "";

    // DATA
    groups: {rawGroup: RawGroup, numOfTrainees: number, numOfCoaches: number, userApplied: boolean}[] = [];
    applications: Application[] = [];
    roles: string[] = [];
    registeredGroupId = -1;

    // ACCORDION
    disableAnimation = true;

    // TABLE
    displayedTrainees: RawUser[] = [];
    traineeDataSource = new MatTableDataSource<RawUser>();
    displayedCoaches: RawUser[] = [];
    coachDataSource = new MatTableDataSource<RawUser>();
    displayedColumns: string[] = ['name', 'actions'];

    
    formatFullDate = formatFullDate;
    formatHourDate = formatHourDate;
    
    constructor(
        public dialogRef: MatDialogRef<TrainingDetailsDialogComponent>,
        private http: HttpService,
        public authService: AuthService,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data: RawTraining) { }

    ngOnInit(): void {
            (mapboxgl as any).accessToken = environment.mapbox.accessToken;
        this.setCoordinates();
        this.map = new mapboxgl.Map({
            container: 'map',
            style: this.style,
            zoom: 13,
            center: [this.longitude, this.latitude]
        });
        const marker = new mapboxgl.Marker().setLngLat([this.longitude, this.latitude]).addTo(this.map);
        this.initContainers();
    }

    ngAfterViewInit(): void {
      // timeout required to avoid the dreaded 'ExpressionChangedAfterItHasBeenCheckedError'
      setTimeout(() => this.disableAnimation = false);
    }
    async initContainers() {
        this.groups = [];
        this.applications = [];
        this.registeredGroupId = -1;

        const userId = this.authService.getLoggedInUserId();
        this.roles = this.authService.getLoggedInRoles();
        const user = await this.http.get<RawUser>(`user/${userId}`);
        const userGroups = this.data.groups.filter( group => {
            return this.roles.includes("admin") || user.groups.includes(group);
        } );
        this.applications = await this.http.get<Application[]>(`training/getApplications/${this.data.id}`);
        userGroups.map( group => {
            const numOfTrainees = this.applications.filter( application => application.role === "trainee").length;
            const numOfCoaches = this.applications.filter( application => application.role === "coach").length;
            const userApplied = this.applications.filter( application => application.userId  === userId).length > 0;
            this.groups.push({rawGroup: group, numOfTrainees, numOfCoaches, userApplied});
        })
        const userIdx = findUserInApplications(userId, this.applications);
        if( userIdx > -1 ) {
            this.registeredGroupId = this.applications[userIdx].groupId;
        }
    }
    setCoordinates(): void {
        this.plus_code = OpenLocationCode.recoverNearest( this.data.location.plus_code, 47.49622, 19.04588 );
        const location: CodeArea = OpenLocationCode.decode(this.plus_code);
        this.latitude = location.latitudeCenter;
        this.longitude = location.longitudeCenter;
        this.googleMapsLink = `https://www.google.com/maps/search/${this.latitude},${this.longitude}`;
    }
    navigateToGoogleMaps(): void {
        window.open(this.googleMapsLink, "_blank")?.focus();
    }
    updateDataSource( groupId: number) {
        this.applications.map( async application => {
            if( application.groupId === groupId ) {
                const user = await this.http.get<RawUser>(`user/${application.userId}`);
                if(application.role === "trainee" ) {
                    this.displayedTrainees.push(user);
                }
                if(application.role === "coach") {
                    this.displayedCoaches.push(user);
                }
            }
        });
        this.traineeDataSource = new MatTableDataSource(this.displayedTrainees);
        this.coachDataSource = new MatTableDataSource(this.displayedCoaches);
    }
    async registerTrainee(groupId: number) {
        if( this.roles.includes("guest")){
            this.addGuestToTraining(groupId);
        }
        else {
            this.addTraineeToTraining(groupId);
        }
        this.registeredGroupId = groupId;
        this.initContainers();
    }
    async addTraineeToTraining(groupId: number) {
        const userId = this.authService.getLoggedInUserId();
        const user = await this.http.get<RawUser>(`user/${userId}`);
        this.http.post<{}>('user/addTraineeToTraining', {
            userId: userId,
            groupId: groupId,
            trainingId: this.data.id
        });
        const amount: number = (-1) * 4000;
        this.http.post<{}>('finance/new', {
            userId : userId,
            trainingId: this.data.id,
            rawPaymentData : {
                amount : amount,
                time: new Date(), 
                status : "pending", 
                description: `Training ${user.name} ${user.email}, ${this.data.location.name} ${formatFullDate(this.data.startTime)} ${formatHourDate(this.data.startTime)}-${formatHourDate(this.data.endTime)}`
            }
        });
        this.snackBar.open("Registration successful", "OK", { duration: 3000});
        // **TODO** Handle time differences --> 50 mins - 4000, 110 min - 8000, 
        // **TODO** Handle fix wage / training vs. fix wage per capita
    }
    async addGuestToTraining(groupId: number) {
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
                    groupId: groupId,
                    trainingId: this.data.id
                });
                const amount: number = (-1) * 4000;
                this.http.post<{}>('finance/new', {
                    userId : user.id,
                    rawPaymentData : {
                        amount : amount,
                        time: this.data.startTime,
                        status : "pending", 
                        description: `Training ${user.name} ${user.email}, ${this.data.location.name} ${formatFullDate(this.data.startTime)} ${formatHourDate(this.data.startTime)}`
                    }
                });
                this.snackBar.open("Registration successful", "OK", { duration: 3000});
            }
            else {
                this.snackBar.open("Registration cancelled", "OK", { duration: 3000});
            }
        });
    }
    async registerCoach(groupId: number) {
        const userId = this.authService.getLoggedInUserId();
        this.http.post<{}>('user/addCoachToTraining', {
            userId: userId,
            groupId: groupId,
            trainingId: this.data.id
        });
        const coach = await this.http.get<RawCoach>(`user/getCoach/${userId}`);
        this.http.post<{}>('finance/new', {
            userId : userId,
            trainingId: this.data.id,
            rawPaymentData : {
                amount : coach.wage,
                time: new Date(),
                status : "pending",
                description: `Coaching ${coach.user.name} ${coach.user.email}, ${this.data.location.name} ${formatFullDate(this.data.startTime)} ${formatHourDate(this.data.startTime)}-${formatHourDate(this.data.endTime)}`
            }
        });
        this.registeredGroupId = groupId;
        this.snackBar.open("Registration successful", "OK", { duration: 3000});
        this.initContainers();
    }
    async deregisterUser() {
        const userId = this.authService.getLoggedInUserId();
        const userIndex = findUserInApplications(userId, this.applications);
        if(this.applications[userIndex].role === "trainee") {
            await this.http.post<{}>('user/removeTraineeFromTraining', {
                userId, 
                trainingId : this.data.id,
                groupId: this.applications[userIndex].groupId, 
            })
        }
        if(this.applications[userIndex].role === "coach") {
            await this.http.post<{}>('user/removeCoachFromTraining', {
                userId, 
                trainingId : this.data.id,
                groupId: this.applications[userIndex].groupId, 
            })
        }
        this.registeredGroupId = -1;
        // **TODO** remove payment
        this.data.payments.map( async payment => {
            if( payment.user.id === userId ) {
                await this.http.delete(`finance/${payment.id}`)
            }
        });
        this.snackBar.open("Application withdrawal successful", "OK", { duration: 3000});
        this.initContainers();
    }
    openAdministrateTrainingDialog(): void {
        this.dialog.open(ManageTrainingFinancesDialogComponent, {
            width: '50vw',
            data: this.data,
        });
    }
}
