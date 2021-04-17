import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Training } from 'src/training/training.entity';
import { DeleteResult } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { omit } from 'lodash';

@Controller('user')
export class UserController 
{
    constructor
    (
        private readonly service : UserService
    ){}
    
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
            username : string, 
            password : string,
            birth_date : Date,
        } 
    ) : Promise<User>
    {
        const newUser = await this.service.create(rawUserData);
        return omit(newUser, "password");
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
                username : string, 
                password : string,
                birth_date : Date,
            }
        }
    ) : Promise<User>
    {
        const modUser = await this.service.modify(requestBody.userId, requestBody.rawUserData);
        return omit(modUser, "password");
    }

    @Post('/login')
    async login( 
        @Body()
        requestBody : {
            username : string, 
            password : string,
        }
    ) : Promise<boolean>
    {
        return this.service.login( requestBody.username, requestBody.password );
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
    async listAvailableTrainings( @Param('id') id : number ) : Promise<[Training, boolean][]> {
        return await this.service.listAvailableTrainings( id );
    }
}
