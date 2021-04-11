import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { Coach } from './coach.entity';
import { CoachService } from './coach.service';

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
        return await this.service.getAll();
    }
    @Get('/:id')
    async getById( @Param('id') id : number ) : Promise<Coach> 
    {
        return await this. service.getById(id);
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
    @Delete('/id')
    async delete ( @Param('id') id : number ) : Promise<DeleteResult>
    {
        return await this.service.delete(id);
    }
    @Post('/modify')
    async modify(
        @Body()
        requestBody : {
            userId : number,
            rawCoachData : { 
                wage : number
            }
        }
    ) : Promise<Coach>
    {
        return await this.service.modify(requestBody.userId, requestBody.rawCoachData)
    }
}
