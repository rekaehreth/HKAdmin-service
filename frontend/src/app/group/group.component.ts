import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpService } from '../httpService';
import { RawGroup, RawCoach } from '../types';

@Component({
    selector: 'app-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
    groups: RawGroup[] = [];
    roles: string[] = [];


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
            const user = this.authService.getLoggedInUser();
            const coach = await this.http.get<RawCoach>(`user/getCoach/${user.id}`);
            this.groups = coach.groups;
        }
    }
}
