import { Injectable } from '@nestjs/common';
import { Connection, DeleteResult, Repository } from 'typeorm';
import { Training } from 'src/training/training.entity';
import { Group } from './group.entity';
import { Location } from 'src/location/location.entity';

@Injectable()
export class GroupService 
{
    groupRepository: Repository<Group>;
    locationRepository: Repository<Location>;
    trainingRepository: Repository<Training>;

    constructor( connection:Connection ) {
        this.groupRepository = connection.getRepository( Group );
        this.locationRepository = connection.getRepository( Location );
        this.trainingRepository = connection.getRepository( Training );
    }
    public async getAll() : Promise<Group[]>
    {
        return await this.groupRepository.find( { relations: ["members", "coaches", "trainings"] } );
    }
    public async getById( id : number ) : Promise<Group>
    {
        return await this.groupRepository.findOne(id, { relations: ["members", "coaches", "trainings"] } );
    }
    public async create( rawGroupData : {
        name : string, 
    }) : Promise<Group>
    {
        const newGroup = new Group();
        Object.keys(rawGroupData).forEach( ( key ) => { newGroup[key] = rawGroupData[key] });
        return await this.groupRepository.save( newGroup );
    }   
    public async delete ( id : number ) : Promise<DeleteResult>
    {
        return await this.groupRepository.delete( id );
    }
    public async modify ( groupId : number, rawGroupData : {
        name : string, 
    }) : Promise<Group>
    {
        const modifiedGroup = await this.groupRepository.findOne( groupId );
        Object.keys( rawGroupData ).forEach( (key) => { modifiedGroup[key] = rawGroupData[key] });
        return await this.groupRepository.save( modifiedGroup );
    }
}
