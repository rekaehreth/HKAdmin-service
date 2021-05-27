import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { RegistrationComponent } from './registration/registration.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'frontend';
    constructor(
        public dialog: MatDialog,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar,
    ) {
    }
    ngOnInit() {
        this.authService.logOutForced.subscribe( _ => {
            this.alertForcedLogout();
        })
    }
    openLoginDialog() {
        const dialogRef = this.dialog.open(RegistrationComponent, {
            width: '50vw',
            data: {},
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log("Login dialog closed ", result);
        })
    }
    get isUserLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }
    alertForcedLogout() {
        this.snackBar.open("Session expired. Please log in again", "OK", { duration: 3000});
    }
    logOut() {
        this.authService.logOutUser();
        this.router.navigate(['']);
    }
}
