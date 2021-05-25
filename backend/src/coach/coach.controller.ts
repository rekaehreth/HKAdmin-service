import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { Coach } from './coach.entity';
import { CoachService } from './coach.service';
import { omit } from 'lodash';

@Controller('coach')
export class CoachController 
{
    constructor 
    (
        private readonly service : CoachService
    ){}
    @Get()
    async getAll() : Promise<Coach[]>
    {
        return await (await this.service.getAll()).map(coach => ({...coach, user: omit(coach.user, "password")}));
    }
    @Get('/:id')
    async getById( @Param('id') id : number ) : Promise<Coach> 
    {
        const coach = await this.service.getById(id);
        return ({...coach, user: omit(coach.user, "password")});
    }
    @Post('/new')
    async create
    ( 
        @Body() 
        requestBody : {
            userId : number,
            rawCoachData : { 
                wage : number
            }
        }
    ) : Promise<Coach> 
    {
        return await this.service.create(requestBody.userId, requestBody.rawCoachData);
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
            coachId : number,
            rawCoachData : { 
                wage : number
            }
        }
    ) : Promise<Coach>
    {
        const coach = await this.service.modify(requestBody.coachId, requestBody.rawCoachData);
        return ({...coach, user: omit(coach.user, "password")});
    }
}
