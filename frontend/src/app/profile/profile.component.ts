import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { HttpService } from '../httpService';
import { RawUser } from '../types';
import { formatFullDate, nameValidator } from '../utils';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    user!: RawUser;
    inputChanged: boolean = false;
    changePassword: boolean = false;
    passwordVerified: boolean = false;

    dateControl = new FormControl();
    nameControl = new FormControl();
    emailControl = new FormControl();
    passwordControl = new FormControl();
    newPasswordControl = new FormControl();
    rePasswordControl = new FormControl();

    formatFullDate = formatFullDate;
    
    constructor(
        private http: HttpService,
        private authService: AuthService,
        private snackBar: MatSnackBar,
    ) { }
    ngOnInit(): void {
        this.getUser();
    }
    async getUser(): Promise<void> {
        const userId = this.authService.getLoggedInUserId();
        this.user = await this.http.get<RawUser>(`user/${userId}`);
        this.initControls();
    }
    initControls(): void {
        this.nameControl = new FormControl(this.user.name, [Validators.required, nameValidator()]);
        this.nameControl.valueChanges.subscribe( () => { this.inputChanged = true } );
        this.emailControl = new FormControl(this.user.email, [Validators.required, Validators.email]);
        this.emailControl.valueChanges.subscribe( () => { this.inputChanged = true } );
        this.dateControl = new FormControl(this.user.birth_date, Validators.required);
        this.dateControl.valueChanges.subscribe( () => { this.inputChanged = true } );
        this.passwordControl.valueChanges.subscribe( () => { 

        } );
        this.newPasswordControl = new FormControl("", [Validators.required, Validators.minLength(6)]);
        this.rePasswordControl = new FormControl("", [Validators.required, Validators.minLength(6)]);
    }
    async editUserData(): Promise<void> {
        if( this.changePassword && 
            !this.newPasswordControl.errors && 
            !this.rePasswordControl.errors &&
            this.newPasswordControl.value === this.rePasswordControl.value ) {
            await this.http.post<{success: boolean, user: RawUser }>(`user/modify`, {            
                userId : this.user.id, 
                rawUserData : {
                    name : this.nameControl.value,
                    email : this.emailControl.value,
                    password : this.passwordControl.value,
                    birth_date : this.dateControl.value,
                }});
        }
        else {
            await this.http.post<{success: boolean, user: RawUser }>(`user/modify`, {            
                userId : this.user.id, 
                rawUserData : {
                    name : this.nameControl.value,
                    email : this.emailControl.value,
                    birth_date : this.dateControl.value,
                }});
        }
        // reload data in controls
        this.inputChanged = false;
    }
    passwordChange(): void {
        this.changePassword = true;
    }
    async verifyPassword(): Promise<void> {
        const result = await this.http.post<{ 
            success: boolean, 
            token?: string, 
            userId?: number, 
            userRoles?: string 
        }> ('user/login', { 
            email: this.user.email, 
            password: this.passwordControl.value ? this.passwordControl.value : "" 
        });
        if (result.success) {
            this.passwordVerified = true;
        }
        else {
            this.snackBar.open("Password incorrect. ", "OK", { duration: 3000});
        }
    }
    async saveNewPassword(): Promise<void> {
        if(!this.newPasswordControl.errors &&!this.rePasswordControl.errors && this.newPasswordControl.value === this.rePasswordControl.value) {
            const result = await this.http.post<{success: boolean, user: RawUser }>(`user/modify`, {            
                userId : this.user.id, 
                rawUserData : {
                    password: this.newPasswordControl.value
            }});
            if( result.success ) {
                this.snackBar.open("Password changed", "OK", { duration: 3000});
                this.passwordVerified = false;
                this.changePassword = false;
            } 
            else {
                this.snackBar.open("Password change failed", "OK", { duration: 3000});
            }
        }else{
            this.snackBar.open("Passwords don't match", "OK", { duration: 3000});
        }
    }
}
