import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { Group } from './group.entity';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController
{
    constructor
    (
        private readonly service : GroupService
    ){}
    @Get()
    async getAll() : Promise<Group[]>
    {
        return await this.service.getAll();
    }
    @Get('/:id')
    async getById( @Param('id') id : number ) : Promise<Group>
    {
        return await this. service.getById(id);
    }
    @Get('/findByName/:name')
    async getByName( @Param('name') name : string ) : Promise<Group>
    {
        return await this. service.getByName(name);
    }
    @Post('/new')
    async create
    (
        @Body()
        rawGroupData : {
            name : string,
    }) : Promise<Group>
    {
        return await this.service.create(rawGroupData);
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
            groupId : number,
            rawGroupData : {
                name : string,
            }
        }
    ) : Promise<Group>
    {
        return await this.service.modify(requestBody.groupId, requestBody.rawGroupData)
    }
}
