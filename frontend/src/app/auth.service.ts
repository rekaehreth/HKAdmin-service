import { Subject } from "rxjs";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Injectable } from "@angular/core";

@Injectable()
export class AuthService {
    constructor(
        public jwtHelper: JwtHelperService
    ) { }
    loginStatusChange = new Subject();
    logOutForced = new Subject();
    getLoggedInUserToken(): string {
        const token = localStorage.getItem("userToken");
        return (token === null) ? "" : token;
    }
    getLoggedInRoles(): string[] {
        if (this.isLoggedIn()) {
            return this.jwtHelper.decodeToken( this.getLoggedInUserToken() ).roles.split(" ");
        }
        else {
            return ["guest"];
        }
    }
    getLoggedInUserId() {
        return this.jwtHelper.decodeToken( this.getLoggedInUserToken() ).id;
    }
    setLoggedInUser(userId: number, userRoles: string[], token: string) {
        localStorage.setItem("userToken", token);
        this.loginStatusChange.next("login");
    }
    logOutUser() {
        localStorage.removeItem("userToken");
        this.loginStatusChange.next("logout");
    }
    triggerLoginStatusChange(): void {
        this.loginStatusChange.next("Meow =^_^= ");
    }
    isLoggedIn(): boolean {
        return localStorage.getItem("userToken") !== null;
    }

    isAuthenticated(): boolean {
        const token = this.getLoggedInUserToken();
        if( token === "" ) {
            return false;
        }
        const isAuthenticated = !this.jwtHelper.isTokenExpired(token);
        if( !isAuthenticated ){
            this.logOutUser();
                this.logOutForced.next("Token expired.");
        }
        return isAuthenticated;
    }
}