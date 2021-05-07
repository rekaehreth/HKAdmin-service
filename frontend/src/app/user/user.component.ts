import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RawUser } from '../types';
import { MatDialog } from '@angular/material/dialog';
import { EditUserComponent } from './edit-user/edit-user.component';
import { HttpService } from '../httpService';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit {
    users: RawUser[] = [];
    dataSource = new MatTableDataSource<RawUser>();
    @ViewChild(MatSort) sort?: MatSort;
    displayedColumns: string[] = ['name', 'groups', 'roles', 'actions'];
    panelOpenState: boolean[] = [];
    constructor(
        private http: HttpService,
        public dialog: MatDialog,
    ) { }
    ngOnInit(): void {
        this.loadUsers();
    }
    ngAfterViewInit() {
        console.log( this.sort )
        if (this.sort) {
            this.dataSource.sort = this.sort;
        }
    }
    async loadUsers(): Promise<void> {
        this.users = await this.http.get<RawUser[]>('user');
        this.dataSource = new MatTableDataSource(this.users);
        if (this.sort) {
            this.dataSource.sort = this.sort;
        }
    }
    manageUserRoles(user: RawUser) {
        const dialogRef = this.dialog.open(EditUserComponent, {
            width: '50vw',
            data: { user },
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log("Edit user roles dialog closed ", result);
        })
    }
    deleteUser(user: RawUser): void {
        // **TODO** verify dialog + subscribe to ok 
    }
    filterByRole(target: any) {

    }
}
