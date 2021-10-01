import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { Location } from './location.entity';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController 
{
    constructor (
        private readonly service: LocationService
    ){}

    @Get()
    async getAll(): Promise<Location[]> {
        return await this.service.getAll();
    }

    @Get('/:id')
    async getById( @Param('id') id: number ): Promise<Location> {
        return await this.service.getById(id);
    }

    @Post('/new')
    async create(
        @Body() 
        rawData: {
            name: string, 
            capacity: number, 
            min_attendees: number, 
            price: number,
            plus_code: string,
        }
    ): Promise<Location> {
        // console.log(JSON.stringify(rawData));
        return await this.service.create(rawData);
    }

    @Post('/modify')
    async modify(
        @Body() 
        rawData: {
            id: number, 
            name: string, 
            capacity: number, 
            min_attendees: number, 
            price: number,
            plus_code: string,
        }
    ): Promise<Location> {
        return await this.service.modify(rawData);
    }

    @Delete('/:id')
    async delete ( @Param('id') id: number ): Promise<DeleteResult> {
        return await this.service.delete(id);
    }
}
