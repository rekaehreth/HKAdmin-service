import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-registration-role-dialog',
    templateUrl: './registration-role-dialog.component.html',
    styleUrls: ['./registration-role-dialog.component.scss']
})
export class RegistrationRoleDialogComponent implements OnInit {

    roles: string[] = [];
    selectedRole: string = "";

    constructor(
        public dialogRef: MatDialogRef<RegistrationRoleDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: string[]) { }
    ngOnInit(): void {
        if (this.data) {
            this.roles = this.data;
        }
    }
    close(action: string) {
        if (action === 'save') {
            this.dialogRef.close({ action: "save", role: this.selectedRole });
        }
        else {
            this.dialogRef.close({ action: "cancel" });
        }
    }
    updateSelectedRole(role: string) {
        this.selectedRole = role;
    }
}
