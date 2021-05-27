import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpService } from 'src/app/httpService';
import { RawUser } from 'src/app/types';
import { nameValidator } from 'src/app/utils';

@Component({
    selector: 'app-register-guest-dialog',
    templateUrl: './register-guest-dialog.component.html',
    styleUrls: ['./register-guest-dialog.component.scss']
})
export class RegisterGuestDialogComponent implements OnInit {
    nameControl = new FormControl("", [Validators.required, nameValidator()]);
    emailControl = new FormControl("", [Validators.required, Validators.email]);
    constructor(
        private http: HttpService,
        public dialogRef: MatDialogRef<RegisterGuestDialogComponent>,
        ) { }

    ngOnInit(): void {
    }
    async register(): Promise<void> {
        if (!this.nameControl.errors && !this.emailControl.errors) {
            const result = await this.http.get<{ success: boolean, user: RawUser }>(`user/getByEmail/${this.emailControl.value}`);
            console.log(result);
            if( result.success ) {
                this.dialogRef.close({ action: "save", user: result.user });
            }
            else {
                // create new user
                const newUser = await this.http.post<RawUser>('user/new', {
                    name : this.nameControl.value,
                    roles : "guest ",
                    email : this.emailControl.value,
                } );
                this.dialogRef.close({ action: "save", user: newUser });
            }
        }
    }
    cancel(): void {
        this.dialogRef.close({ action: "cancel", user: undefined });
    }
}
