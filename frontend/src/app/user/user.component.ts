import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RawUser } from '../types';
import { MatDialog } from '@angular/material/dialog';
import { EditUserComponent } from './edit-user/edit-user.component';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
    users : RawUser[] = [];
    panelOpenState: boolean[] = [];
    constructor(
        private http: HttpClient,
        public dialog: MatDialog,
        ) { }
    ngOnInit(): void {
        this.loadUsers();
        for( let state of this.panelOpenState) {
            state = false;
        }
    }
    async loadUsers(): Promise<void> {
        this.users = await this.http.get<RawUser[]>(`http://api.hkadmin.icescream.net/user`).toPromise()
            // .catch( error => { 
            //   console.log(error); 
            //   return {error}; 
            // } )
            ;
        console.log(this.users);
    }
    openEditUserDialog( user : RawUser ) {
        const dialogRef = this.dialog.open(EditUserComponent, {
            width: '50vw',
            data: { user },
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log("Login dialog closed ", result);
        })
    }
}
