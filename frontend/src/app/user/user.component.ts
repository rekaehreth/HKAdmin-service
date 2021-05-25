import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RawCoach, RawGroup, RawUser } from '../types';
import { MatDialog } from '@angular/material/dialog';
import { EditUserComponent } from './edit-user/edit-user.component';
import { HttpService } from '../httpService';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit {
    users: RawUser[] = [];
    dataSource = new MatTableDataSource<RawUser>();
    @ViewChild(MatSort) sort?: MatSort;
    displayedColumns: string[] = ['name', 'email', 'groups', 'roles', 'actions'];
    roleList: string[] = ['guest', 'trainee', 'coach', 'admin'];
    groupList: string[] = [];
    panelOpenState: boolean[] = [];
    groupFilterControl = new FormControl("");
    roleFilterControl = new FormControl("");
    groupFilter: string[] = [];
    roleFilter: string[] = [];
    constructor(
        private http: HttpService,
        public dialog: MatDialog,
    ) { }
    ngOnInit(): void {
        this.loadUsers();
        this.loadAvailableGroups();
        this.groupFilterControl.valueChanges.subscribe( value =>{
            this.groupFilter = value;
            this.updateDataSource();
        });
        this.roleFilterControl.valueChanges.subscribe( value =>{
            this.roleFilter = value;
            this.updateDataSource();
        });
    }
    ngAfterViewInit() {
        console.log(this.sort)
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
    async loadAvailableGroups(){
        this.groupList = (await this.http.get<RawGroup[]>('group')).map(group=> group.name);
    }
    
    updateDataSource(){
        const filteredUsers = this.users.filter(user => {
            let matchesGroupFilter = true;
            let matchesRoleFilter = true;
            if(this.groupFilter.length > 0){
                matchesGroupFilter = user.groups.map(group => group.name).filter(groupName => this.groupFilter.includes(groupName)).length > 0;
            }
            if(this.roleFilter.length > 0){
                matchesRoleFilter = user.roles.split(" ").filter(role=> this.roleFilter.includes(role)).length > 0;
            }
            return matchesGroupFilter && matchesRoleFilter;
        });
        this.dataSource = new MatTableDataSource(filteredUsers);
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
        dialogRef.afterClosed().subscribe(async result => {
            console.log(result);
            if (result.action === "save") {
                console.log( result.newRoles );
                if( user.roles.includes("coach") && !result.newRoles.includes("coach")) {
                    // delete coach
                    const coachId = (await this.http.get<RawCoach>(`coach/getByUserId/${user.id}`)).id;
                    await this.http.delete(`coach/${coachId}`);
                }
                if( !user.roles.includes("coach") && result.newRoles.includes("coach")) {
                    await this.http.post<RawCoach>('coach/new', {
                        userId : user.id,
                        rawCoachData : { 
                            wage : 4000
                        }
                    })
                }
                const rolesString = result.newRoles.join(" ");
                await this.http.post<{}>('user/modify', {
                    userId: user.id,
                    rawUserData: {
                        email: user.email,
                        roles: rolesString
                    }
                });
                this.loadUsers();
            }
        });
    }
    deleteUser(user: RawUser): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '50vw',
            data: "Do you really want to delete this user?",
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(async result => {
            console.log(result);
            if (result.result === "confirm") {
                await this.http.delete(`user/${user.id}`);
                this.loadUsers();
            }
        });
    }

}
