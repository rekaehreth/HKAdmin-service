export class AuthService {
    static getLoggedInUser() : { userId : number, roles: string[] } | undefined
    {
      const loggedInUser = localStorage.getItem("loggedInUser");
      if ( loggedInUser )
      {
        return JSON.parse(loggedInUser);
      }
      return undefined;
    } 
    static setLoggedInUser( userId: number, userRoles : string[], token: string ) 
    {
        window.localStorage.setItem("loggedInUser", JSON.stringify({ userId, userRoles }) );
        window.localStorage.setItem("userToken", token );
    }
    static logOutUser() 
    {
        window.localStorage.removeItem("loggedInUser");
        window.localStorage.removeItem("userToken");
    }
}