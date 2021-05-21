import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Training } from 'src/training/training.entity';
import { DeleteResult } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { omit } from 'lodash';
import { AdminAuthGuard, LoggedInAuthGuard } from './auth/jwt-auth.guard';
import { Coach } from 'src/coach/coach.entity';

@Controller('user')
export class UserController 
{
    constructor
    (
        private readonly service : UserService
    ){}
    
    @UseGuards( AdminAuthGuard )
    @Get()
    async getAll() : Promise<User[]> {
        const allUsers = await this.service.getAll();
        return allUsers.map( user => omit(user, "password"));
    }

    @Get('/:id')
    async getById( @Param('id') id : number ) : Promise<User> {
        const user = await this.service.getById(id);
        return omit(user, "password");
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
    async delete ( @Param('id') id : number ) : Promise<DeleteResult>
    {
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
    ) : Promise<{success: boolean, user: User }>
    {
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
    ) : Promise<{ success : boolean, token ?: string, userId?: number, userRoles?: string}>
    {
        return this.service.login( requestBody.email, requestBody.password );
    }

    @Post('/addCoachToGroup')
    async addCoachToGroup (
        @Body()
        requestBody : {
            userId : number, 
            groupId : number, 
        }
    ) : Promise<{success : boolean, error ?: any}>
    {
        return await this.service.addToGroup( requestBody.userId, requestBody.groupId );
    }

    @Post('/addTraineeToGroup')
    async addTraineeToGroup(
        @Body()
        requestBody : {
            userId : number, 
            groupId : number,
        }
    ) : Promise<{success : boolean, error ?: any}>
    {
        return await this.service.addToGroup( requestBody.userId, requestBody.groupId, true );
    }

    @Post('/removeCoachFromGroup')
    async removeCoachFromGroup(
        @Body()
        requestBody : {
            userId : number, 
            groupId : number, 
        }
    ) : Promise<{success : boolean, error ?: any}>
    {
        return await this.service.removeFromGroup( requestBody.userId, requestBody.groupId );
    }

    @Post('/removeTraineeFromGroup')
    async removeTraineeFromGroup(
        @Body()
        requestBody : {
            userId : number, 
            groupId : number,
        }
    ) : Promise<{success : boolean, error ?: any}>
    {
        return await this.service.removeFromGroup( requestBody.userId, requestBody.groupId, true );
    }

    @Post('/addCoachToTraining')
    async addCoachToTraining(
        @Body()
        requestBody : {
            userId : number, 
            trainingId : number, 
        }
    ) : Promise<{success : boolean, error ?: any}>
    {
        return await this.service.addToTraining( requestBody.userId, requestBody.trainingId );
    }

    @Post('/addTraineeToTraining')
    async addTraineeToTraining(
        @Body()
        requestBody : {
            userId : number, 
            trainingId : number,
        }
    ) : Promise<{success : boolean, error ?: any}>
    {
        return await this.service.addToTraining( requestBody.userId, requestBody.trainingId, true );
    }

    @Post('/removeCoachFromTraining')
    async removeCoachFromTraining(
        @Body()
        requestBody : {
            userId : number, 
            trainingId : number, 
        }
    ) : Promise<{success : boolean, error ?: any}>
    {
        return await this.service.removeFromTraining( requestBody.userId, requestBody.trainingId );
    }

    @Post('/removeTraineeFromTraining')
    async removeTraineeFromTraining(
        @Body()
        requestBody : {
            userId : number, 
            trainingId : number,
        }
    ) : Promise<{success : boolean, error ?: any}>
    {
        return await this.service.removeFromTraining( requestBody.userId, requestBody.trainingId, true );
    }

    @Get('listAvailableTrainings/:id')
    async listAvailableTrainings( @Param('id') id: number ) : Promise<[Training, boolean][]> {
        return await this.service.listAvailableTrainings( id );
    }

    @Get('getCoachId/:id')
    async getCoachIdLinkedToUser( @Param('id') id: number ) : Promise<number> {
        const coach = await this.service.getCoach( id );
        return coach.id;
    }
    @Get('getCoach/:id')
    async getCoachLinkedToUser( @Param('id') id: number ) : Promise<Coach> {
        return await this.service.getCoach( id );
    }
}
