import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpService } from '../httpService';
import { RawGroup, RawCoach, RawUser } from '../types';

@Component({
    selector: 'app-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
    groups: RawGroup[] = [];
    roles: string[] = [];
    usersNotInGroup: RawUser[] = [];
    coachesNotInGroup: RawUser[] = [];
    selectedUser!: RawUser;
    selectedCoach!: RawUser;

    constructor(
        private http: HttpService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.roles = this.authService.getLoggedInRoles();
        this.getGroups();
        console.log( this.groups );
    }
    async getGroups() {
        if( this.roles.includes("admin") ) {
            this.groups = await this.http.get<RawGroup[]>('group');
        } 
        else if ( this.roles.includes("coach") ) {
            const user = this.authService.getLoggedInUserId();
            const coach = await this.http.get<RawCoach>(`user/getCoach/${user.id}`);
            this.groups = coach.groups;
        }
    }
    async refreshTrainees(groupId: number): Promise<void> {
        let group = await this.http.get<RawGroup>(`group/${groupId}`);
        this.usersNotInGroup = [];
        let users = await this.http.get<RawUser[]>(`user/getByRole/trainee`);
        for(let user of users ) {
            if( !group.members.map( trainee => trainee.id ).includes(user.id)) {
                this.usersNotInGroup.push(user);
            }
        }
        console.log("Users not in group: ", this.usersNotInGroup);
        console.log("Group members:", group.members)
        // debugger;
    }
    async refreshCoaches(groupId: number): Promise<void> {
        let group = await this.http.get<RawGroup>(`group/${groupId}`);
        this.coachesNotInGroup = [];
        let coaches = await this.http.get<RawCoach[]>(`coach`);
        for(let coach of coaches ) {
            if( !group.coaches.map( coach => coach.id ).includes(coach.id)) {
                this.coachesNotInGroup.push(coach.user);
            }
        }
        console.log("Coaches not in group: ", this.coachesNotInGroup);
        console.log("Group coaches: ", group.coaches);
    }
    async addTrainee(userId: number, groupId: number): Promise<void> {
        await this.http.post<{}>('user/addTraineeToGroup', {
            userId : userId, 
            groupId : groupId,
        });
        this.getGroups();
    }
    async addCoach(userId: number, groupId: number): Promise<void> {
        await this.http.post<{}>('user/addCoachToGroup', {
            userId : userId, 
            groupId : groupId,
        });
        this.getGroups();
    }
    async removeTrainee(userId: number, groupId: number): Promise<void> {
        await this.http.post<{}>('user/removeTraineeFromGroup', {
            userId : userId, 
            groupId : groupId,
        });
        this.getGroups();
    }
    async removeCoach(userId: number, groupId: number): Promise<void> {
        await this.http.post<{}>('user/removeCoachFromGroup', {
            userId : userId, 
            groupId : groupId,
        });
        this.getGroups();
    }
}
