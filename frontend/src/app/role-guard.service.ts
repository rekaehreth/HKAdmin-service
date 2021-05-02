import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { LandingpageComponent } from "./landingpage/landingpage.component";

@Injectable()
export class RoleGuardService implements CanActivate {
    constructor(
        private authService: AuthService, 
        public router: Router,
    ) {}
    canActivate( route: ActivatedRouteSnapshot ): boolean {
        const acceptedRoles = route.data.acceptedRoles;
        const roles = this.authService.getLoggedInRoles();
        let userAuthorized = false;
        for( const role of roles) {
            if( acceptedRoles.includes(role) ) {
                userAuthorized = true;
            }
        }
        if( !this.authService.isAuthenticated() || !userAuthorized ) {
            this.router.navigate(['']);
            return false;
        }
        return true;
    }
}