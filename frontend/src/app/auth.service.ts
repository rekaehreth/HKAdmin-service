import { Subject } from "rxjs";

export class AuthService {
    static loginStatusChange = new Subject();
    static getLoggedInUser() : { userId : number, userRoles: string[] } | undefined
    {
      const loggedInUser = localStorage.getItem("loggedInUser");
      if ( loggedInUser )
      {
        return JSON.parse(loggedInUser);
      }
      return undefined;
    } 
    static getLoggedInRoles() : string[] 
    {
        const user = this.getLoggedInUser();
        if( user )
        {
            return user.userRoles;
        }
        else
        {
            return ["guest"];
        }
    }
    static setLoggedInUser( userId: number, userRoles : string[], token: string ) 
    {
        window.localStorage.setItem("loggedInUser", JSON.stringify({ userId, userRoles }) );
        window.localStorage.setItem("userToken", token );
        this.loginStatusChange.next("login");
    }
    static logOutUser() 
    {
        window.localStorage.removeItem("loggedInUser");
        window.localStorage.removeItem("userToken");
        this.loginStatusChange.next("logout");
    }
    static triggerLoginStatusChange() : void 
    {
        this.loginStatusChange.next("Meow =^_^= ");
    }
}