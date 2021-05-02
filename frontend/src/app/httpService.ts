import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

@Injectable( { providedIn: 'root' })
export class HttpService {
    hostUrl = 'https://hkadmin-api.icescream.net/';
    httpHeaders: { headers: HttpHeaders } = { headers: new HttpHeaders({"Content-Type": "application/json"})};
    constructor( 
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.updateToken();
        this.authService.loginStatusChange.subscribe( _ => { this.updateToken() });
    }
    async get<Type>( endpoint: string): Promise<Type> {
        const result = await this.http.get<Type>(this.hostUrl + endpoint, this.httpHeaders).toPromise();
        return result;
    }
    async delete( endpoint: string ): Promise<any> {
        const result = await this.http.delete<any>(this.hostUrl + endpoint, this.httpHeaders).toPromise();
        return result;
    }
    async post<Type>( endpoint: string, payload: Object ): Promise<Type> {
        const result = await this.http.post<Type>(this.hostUrl + endpoint, payload, this.httpHeaders).toPromise();
        return result;
    }

    updateToken(){
        const token = this.authService.getLoggedInUserToken();
        this.httpHeaders = { headers: new HttpHeaders({ 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ token }`
        })};
    }
}