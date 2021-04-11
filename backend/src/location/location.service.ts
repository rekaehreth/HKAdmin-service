import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, getManager, getRepository, Repository } from 'typeorm';
import { Location } from './location.entity';

@Injectable()
export class LocationService
{
    constructor
    (
        // @InjectRepository(Location)
        // private readonly LocationRepo : Repository<Location>,
    ){}

    public async getAll() : Promise<Location[]>
    {
        // return await this.LocationRepo.find(); // SELECT * FROM trainig_site WHERE ( 1=1 // find param )
        const siteRepository = getRepository(Location);
        return await siteRepository.find( { relations: ["trainings"] } );
    }

    public async getById( id : number ) : Promise<Location>
    {
        const siteRepository = getRepository(Location);
        return await siteRepository.findOne(id, { relations: ["trainings"] });
    }

    public async create( rawSiteData : {
        name : string, 
        capacity : number, 
        min_attendees : number, 
        price : number,
    } ) : Promise<Location>
    {
        const newSite = new Location();
        Object.keys(rawSiteData).forEach( (key) => { newSite[key] = rawSiteData[key] });
        const siteRepository = getRepository(Location);
        return await siteRepository.save(newSite);
    }

    public async delete ( id : number ) : Promise<DeleteResult>
    {
        const siteRepository = getRepository(Location);
        return await siteRepository.delete(id);
    }

    public async modify ( rawSiteData : {
        id : number,
        name ?: string, 
        capacity ?: number, 
        min_attendees ?: number, 
        price ?: number,
    } ) : Promise<Location>
    {
        const siteRepository = getRepository(Location);
        const modifiedSite = await siteRepository.findOne( rawSiteData.id );
        Object.keys(rawSiteData).forEach( (key) => { modifiedSite[key] = rawSiteData[key] });
        return await siteRepository.save(modifiedSite); 
    }
}
