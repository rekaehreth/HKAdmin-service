import { Body, Controller, Delete, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { Training } from '../training/training.entity';
import { DeleteResult } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { omit } from 'lodash';
import { AdminAuthGuard } from './auth/jwt-auth.guard';
import { Coach } from '../coach/coach.entity';

@Controller('user')
export class UserController {
    constructor (
        private readonly service : UserService
    ){}

    @UseGuards( AdminAuthGuard )
    @Get()
    async getAll() : Promise<User[]> {
        return (await this.service.getAll()).map( user => omit(user, "password"));
    }

    @Get('/:id')
    async getById( @Param('id') id : number ) : Promise<User> {
        return omit (await this.service.getById(id), "password");
    }
    @Get('/getByEmail/:email')
    async getByEmail( @Param('email') email: string ) : Promise<{success: boolean, user: User}> {
        const user = await this.service.getByEmail(email);
        console.log(user);
        if(user) {
            return {success: true, user: omit(user, "password")};
        }
        return {success: false, user: undefined};
    }
    @Get('/getByRole/:role')
    async getByRole( @Param('role') role: string): Promise<User[]> {
        return await (await this.service.getByRole(role)).map(user => omit(user, "password"));
    }
    @Post('/new')
    async create(
        @Body()
            rawUserData : {
            name : string,
            roles : string,
            email : string,
            password : string,
            birth_date : Date,
        }
    ) : Promise<{success: boolean, user: User }>
    {
        const newUser = await this.service.create(rawUserData);
        return { success: newUser.success, user: omit(newUser.user, "password")};
    }

    @Delete('/:id')
    async delete ( @Param('id') id : number ) : Promise<DeleteResult> {
        return await this.service.delete(id);
    }

    @Post('/modify')
    async modify(
        @Body()
            requestBody : {
            userId : number,
            rawUserData : {
                name : string,
                roles : string,
                email : string,
                password : string,
                birth_date : Date,
            }
        }
    ) : Promise<{success: boolean, user: User }> {
        const modUser = await this.service.modify(requestBody.userId, requestBody.rawUserData);
        return { success: modUser.success, user: omit(modUser.user, "password")};
    }

    @Post('/login')
    async login(
        @Body()
            requestBody : {
            email : string,
            password : string,
        }
    ) : Promise<{ success : boolean, token ?: string, userId?: number, userRoles?: string}> {
        return this.service.login( requestBody.email, requestBody.password );
    }

    @Post('/addCoachToGroup')
    async addCoachToGroup (
        @Body()
            requestBody : {
            userId : number,
            groupId : number,
        }
    ) : Promise<{success : boolean, error ?: any}> {
        return await this.service.addToGroup( requestBody.userId, requestBody.groupId );
    }

    @Post('/addTraineeToGroup')
    async addTraineeToGroup(
        @Body()
            requestBody : {
            userId : number,
            groupId : number,
        }
    ) : Promise<{success : boolean, error ?: any}> {
        return await this.service.addToGroup( requestBody.userId, requestBody.groupId, true );
    }

    @Post('/removeCoachFromGroup')
    async removeCoachFromGroup(
        @Body()
            requestBody : {
            userId : number,
            groupId : number,
        }
    ) : Promise<{success : boolean, error ?: any}> {
        return await this.service.removeFromGroup( requestBody.userId, requestBody.groupId );
    }

    @Post('/removeTraineeFromGroup')
    async removeTraineeFromGroup(
        @Body()
            requestBody : {
            userId : number,
            groupId : number,
        }
    ) : Promise<{success : boolean, error ?: any}> {
        return await this.service.removeFromGroup( requestBody.userId, requestBody.groupId, true );
    }

    @Post('/addCoachToTraining')
    async addCoachToTraining(
        @Body()
            requestBody : {
            userId : number,
            trainingId : number,
            groupId: number,
        }
    ) : Promise<{success : boolean, error ?: any}> {
        return await this.service.addToTraining( requestBody.userId, requestBody.trainingId, requestBody.groupId );
    }

    @Post('/addTraineeToTraining')
    async addTraineeToTraining(
        @Body()
            requestBody : {
            userId : number,
            trainingId : number,
            groupId: number,
        }
    ) : Promise<{success : boolean, error ?: any}> {
        return await this.service.addToTraining( requestBody.userId, requestBody.trainingId, requestBody.groupId, true );
    }

    @Post('/removeCoachFromTraining')
    async removeCoachFromTraining(
        @Body()
            requestBody : {
            userId : number,
            trainingId : number,
            groupId: number,
        }
    ) : Promise<{success : boolean, error ?: any}> {
        return await this.service.removeFromTraining( requestBody.userId, requestBody.trainingId, requestBody.groupId);
    }

    @Post('/removeTraineeFromTraining')
    async removeTraineeFromTraining(
        @Body()
            requestBody : {
            userId : number,
            trainingId : number,
            groupId: number,
        }
    ) : Promise<{success : boolean, error ?: any}> {
        return await this.service.removeFromTraining( requestBody.userId, requestBody.trainingId, requestBody.groupId, true );
    }

    @Get('listAvailableTrainings/:id')
    async listAvailableTrainings( @Param('id') id: number ) : Promise<{training: Training, subscribedForTraining: boolean}[]> {
        return await this.service.listAvailableTrainings( id );
    }

    @Get('getCoachId/:id')
    async getCoachIdLinkedToUser( @Param('id') id: number ) : Promise<number> {
        return (await this.service.getCoach(id)).id;
    }
    @Get('getCoach/:id')
    async getCoachLinkedToUser( @Param('id') id: number ) : Promise<Coach> {
        return await this.service.getCoach( id );
    }
}
