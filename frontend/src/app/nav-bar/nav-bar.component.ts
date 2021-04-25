import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

    userRoles: string[] = [];
    roleSpecificMenuItems: Array<{ title: string, routerLink: string }> = [];
    constructor() { }
    currentlyActive = -1;
    menuItems = [
        {
            title: "Training",
            routerLink: '/training',
            roles: ["guest", "trainee", "coach", "admin"],
        },
        {
            title: "Users",
            routerLink: '/users',
            roles: ["admin"],
        },
        {
            title: "Groups",
            routerLink: '/groups',
            roles: ["user", "coach", "admin"],
        },
        {
            title: "Finances",
            routerLink: '/finance',
            roles: ["trainee", "coach", "admin"],
        },
        {
            title: "Settings",
            routerLink: '/settings',
            roles: ["trainee", "coach", "admin"],
        },
        {
            title: "My Profile",
            routerLink: '/profile',
            roles: ["trainee", "coach", "admin"],
        },
    ];

    ngOnInit(): void {
        this.userRoles = AuthService.getLoggedInRoles();
        this.getRoleSpecificMenuItems();
        AuthService.loginStatusChange.subscribe( _ => {
            // debugger;
            this.userRoles = AuthService.getLoggedInRoles();
            this.getRoleSpecificMenuItems();
        });
    }

    getRoleSpecificMenuItems() : void
    {
        this.roleSpecificMenuItems = [];
        for( const item of this.menuItems )
        {
            for( const role of this.userRoles )
            {
                if( item.roles.includes(role))
                {
                    this.roleSpecificMenuItems.push( { title: item.title, routerLink: item.routerLink } );
                    break;
                }
            }
        }
    }
}
