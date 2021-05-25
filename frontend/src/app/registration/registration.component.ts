import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { HttpService } from '../httpService';
import { RawUser } from '../types';
import { nameValidator } from '../utils';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
    emailLoginControl = new FormControl("", [Validators.required, Validators.email]);
    emailControl = new FormControl("", [Validators.required, Validators.email]);
    passwordLoginControl = new FormControl("", [Validators.required, Validators.minLength(6)]);
    rePasswordControl = new FormControl("", [Validators.required, Validators.minLength(6)]);
    passwordControl = new FormControl("", [Validators.required, Validators.minLength(6)]);
    nameControl = new FormControl("", [Validators.required, nameValidator()]);
    birthControl = new FormControl("", Validators.required);

    constructor(
        private http: HttpService,
        private authService: AuthService, 
        public dialogRef: MatDialogRef<RegistrationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }
    ngOnInit(): void {
    }
    async signIn() {
        if (!this.emailLoginControl.errors && !this.passwordLoginControl.errors) {
            const result = await this.http.post<{ success: boolean, token?: string, userId?: number, userRoles?: string }>
                ('user/login', { email: this.emailLoginControl.value, password: this.passwordLoginControl.value });
            if (result.success) {
                this.authService.setLoggedInUser(
                    result.userId ? result.userId : 0,
                    result.userRoles ? result.userRoles.split(" ") : [],
                    result.token ? result.token : "");
                this.dialogRef.close({ "succes": "true" });
            }
        }
    }
    async register() {
        if ( this.checkRegisterForm() ) {
            let existingUser = await this.http.get<{ success: boolean, user: RawUser }>(`user/getByEmail/${this.emailControl.value}`);
            if(existingUser.success && existingUser.user.name === this.nameControl.value) {
                let result = await this.http.post<{ success: boolean, user: RawUser }>('user/new', { 
                    name: this.nameControl.value, 
                    email: this.emailControl.value, 
                    birth_date: this.birthControl.value, 
                    password: this.passwordControl.value 
                });
                if (result.success) {
                    let loginResult = await this.http.post<{ success: boolean, token?: string, userId?: number, userRoles?: string }>('user/login', { 
                        email: this.emailControl.value, 
                        password: this.passwordControl.value })
                    console.log(result);
                    if (loginResult.success) {
                        this.authService.setLoggedInUser(
                            loginResult.userId ? loginResult.userId : 0,
                            loginResult.userRoles ? loginResult.userRoles.split(" ") : [],
                            loginResult.token ? loginResult.token : "");
                        this.dialogRef.close({ "succes": "true" });
                    }
                }
            }
            this.http.post<{}>('user/modify', {
                userId: existingUser.user.id,
                rawUserData: {
                    name: this.nameControl.value,
                    birth_date: this.birthControl.value, 
                    password: this.passwordControl.value
                }
            });
            let loginResult = await this.http.post<{ success: boolean, token?: string, userId?: number, userRoles?: string }>('user/login', { 
                email: this.emailControl.value, 
                password: this.passwordControl.value 
            })
                if (loginResult.success) {
                    this.authService.setLoggedInUser(
                        loginResult.userId ? loginResult.userId : 0,
                        loginResult.userRoles ? loginResult.userRoles.split(" ") : [],
                        loginResult.token ? loginResult.token : "");
                    this.dialogRef.close({ "succes": "true" });
                }
        }
    }
    checkRegisterForm(): boolean {
        const valid = !this.emailControl.errors 
            && !this.passwordControl.errors 
            && !this.nameControl.errors 
            && !this.birthControl.errors
            && this.passwordControl.value === this.rePasswordControl.value;
        return valid;
    }
}
