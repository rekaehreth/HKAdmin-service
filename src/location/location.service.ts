import { Injectable } from '@nestjs/common';
import { Connection, DeleteResult, EntityManager, getManager, getRepository, Repository } from 'typeorm';
import { Location } from './location.entity';

@Injectable()
export class LocationService
{
    locationRepository: Repository<Location>;

    constructor( connection:Connection ) {
        this.locationRepository = connection.getRepository( Location );
    }

    public async getAll(): Promise<Location[]>
    {
        return await this.locationRepository.find( { relations: ["trainings"] } );
    }

    public async getById( id: number ): Promise<Location>
    {
        return await this.locationRepository.findOne(id, { relations: ["trainings"] });
    }

    public async create( rawSiteData: {
        name: string,
        capacity: number,
        min_attendees: number,
        price: number,
        plus_code: string,
    } ): Promise<Location>
    {
        const newSite = new Location();
        Object.keys(rawSiteData).forEach( (key) => { newSite[key] = rawSiteData[key] });
        return await this.locationRepository.save(newSite);
    }

    public async delete ( id: number ): Promise<DeleteResult>
    {
        return await this.locationRepository.delete(id);
    }

    public async modify ( rawSiteData: {
        id: number,
        name: string,
        capacity: number,
        min_attendees: number,
        price: number,
        plus_code: string,
    } ): Promise<Location>
    {
        const modifiedSite = await this.locationRepository.findOne( rawSiteData.id );
        Object.keys(rawSiteData).forEach( (key) => { modifiedSite[key] = rawSiteData[key] });
        return await this.locationRepository.save(modifiedSite);
    }
}
