import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  emailControl = new FormControl("", [Validators.required, Validators.email]);
  passwordControl = new FormControl("", [Validators.required, Validators.minLength(6)]);
  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<RegistrationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  ngOnInit(): void {
  }
  signIn() {
    if( !this.emailControl.errors && !this.passwordControl.errors ){
      this.http.post<boolean>( `http://localhost:3000/user/login`, { email: this.emailControl.value, password: this.passwordControl.value} ).subscribe( result => {
        console.log(result);
        if (result) {
          window.localStorage.setItem("loggedInUser", this.emailControl.value);
          this.dialogRef.close({"succes":"true"});
        }
      });
    }
  }
}
