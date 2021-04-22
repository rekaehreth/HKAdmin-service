import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './auth.service';
import { RegistrationComponent } from './registration/registration.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'frontend';
    constructor(
        public dialog: MatDialog,
    ) {
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
        return AuthService.getLoggedInUser() == undefined;
    }
    logOut() {
        AuthService.logOutUser();
    }
}
