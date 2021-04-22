import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [UserService],
  controllers: [UserController], 
  imports: [
    JwtModule.register( { secret: "fcgjkrgkeigxkkkkkkkihul", signOptions: { expiresIn: "600s"} } )
  ]
})
export class UserModule {}
