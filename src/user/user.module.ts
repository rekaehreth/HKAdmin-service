import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
    providers: [
        UserService,
        JwtStrategy,
    ],
    controllers: [UserController],
    imports: [
        JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: "600s" } })
    ]
})
export class UserModule { }
