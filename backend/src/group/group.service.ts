import { Injectable } from '@nestjs/common';
import { DeleteResult, getRepository } from 'typeorm';
import { Group } from './group.entity';

@Injectable()
export class GroupService 
{
    public async getAll() : Promise<Group[]>
    {
        const groupRepository = getRepository( Group );
        return await groupRepository.find( { relations: ["members", "coaches", "trainings"] } );
    }
    public async getById( id : number ) : Promise<Group>
    {
        const groupRepository = getRepository( Group );
        return await groupRepository.findOne(id, { relations: ["members", "coaches", "trainings"] } );
    }
    public async create( rawGroupData : {
        name : string, 
    }) : Promise<Group>
    {
        const newGroup = new Group();
        Object.keys(rawGroupData).forEach( ( key ) => { newGroup[key] = rawGroupData[key] });
        const groupRepository = getRepository( Group );

        return await groupRepository.save( newGroup );
    }   
    public async delete ( id : number ) : Promise<DeleteResult>
    {
        const groupRepository = getRepository( Group );
        return await groupRepository.delete( id );
    }
    public async modify ( groupId : number, rawGroupData : {
        name : string, 
    }) : Promise<Group>
    {
        const groupRepository = getRepository( Group ); 
        const modifiedGroup = await groupRepository.findOne( groupId );
        Object.keys( rawGroupData ).forEach( (key) => { modifiedGroup[key] = rawGroupData[key] });
        return await groupRepository.save( modifiedGroup );
    }
}
