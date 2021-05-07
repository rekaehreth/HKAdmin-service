import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

    userRoles: string[] = [];
    roleSpecificMenuItems: Array<{ title: string, routerLink: string, icon: string }> = [];
    constructor(
        private authService: AuthService, 
    ) { }
    currentlyActive = -1;
    menuItems = [
        {
            title: "Training",
            routerLink: '/training',
            roles: ["guest", "trainee", "coach", "admin"],
            icon: "ice_skating",
        },
        {
            title: "Users",
            routerLink: '/users',
            roles: ["admin"],
            icon: "manage_accounts",
        },
        {
            title: "Groups",
            routerLink: '/groups',
            roles: ["coach", "admin"],
            icon: "groups",
        },
        {
            title: "Finances",
            routerLink: '/finance',
            roles: ["trainee", "coach", "admin"],
            icon: "attach_money",
        },
        {
            title: "Profile",
            routerLink: '/profile',
            roles: ["trainee", "coach", "admin"],
            icon: "account_circle",
        },
        // {
        //     title: "Settings",
        //     routerLink: '/settings',
        //     roles: ["trainee", "coach", "admin"],
        //     icon: "settings",
        // },
    ];

    ngOnInit(): void {
        this.userRoles = this.authService.getLoggedInRoles();
        this.getRoleSpecificMenuItems();
        this.authService.loginStatusChange.asObservable().subscribe( _ => {
            this.userRoles = this.authService.getLoggedInRoles();
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
                if( item.roles.includes(role) )
                {
                    this.roleSpecificMenuItems.push( {title: item.title, routerLink: item.routerLink, icon: item.icon } );
                    break;
                }
            }
        }
    }
}
