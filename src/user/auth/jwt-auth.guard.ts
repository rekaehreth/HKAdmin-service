import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class AdminAuthGuard extends AuthGuard( "jwt" ) {
    constructor( private jwtService: JwtService ){
        super();
    }
    canActivate( context: ExecutionContext ) {
        const request = context.switchToHttp().getRequest();
        const { headers } = request; // kiszedi a requestből a headers-t
        if(headers.authorization === undefined){
            return false;
        }
        const token = headers.authorization.split(" ")[1];
        const tokenData = this.jwtService.decode(token);
        if( tokenData["roles"].includes( "admin") ) {
            return super.canActivate( context );
        }
        return false;
    }
}
