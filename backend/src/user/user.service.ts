import { Injectable } from '@nestjs/common';
import { Coach } from 'src/coach/coach.entity';
import { Group } from 'src/group/group.entity';
import { Training } from 'src/training/training.entity';
import { Connection, DeleteResult, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService 
{
    userRepository: Repository<User>;
    groupRepository: Repository<Group>;
    coachRepository: Repository<Coach>;
    trainingRepository: Repository<Training>;

    constructor( connection:Connection ) {
        this.userRepository = connection.getRepository(User);
        this.groupRepository = connection.getRepository( Group );
        this.coachRepository = connection.getRepository( Coach );
        this.trainingRepository = connection.getRepository( Training );
    }
    public async getAll() : Promise<User[]>
    {
        return await this.userRepository.find( { relations: ["trainings", "groups"] } );
    }
    public async getById( id : number ) : Promise<User>
    {
        return await this.userRepository.findOne( id, { relations: ["trainings", "groups"] } );
    }
    public async create( rawUserData : {
        name : string,
        roles : string,
        email : string,
        username : string, 
        password : string,
        birth_date : Date,
    } ) : Promise<User>
    {
        const newUser = new User();
        Object.keys(rawUserData).forEach( ( key ) => { newUser[key] = ( key === "password" ) ? bcrypt.hashSync(rawUserData[key], 10) : rawUserData[key]; } );
        return await this.userRepository.save( newUser );
    }
    public async delete ( id : number ) : Promise<DeleteResult>
    {
        return await this.userRepository.delete( id );
    }
    public async modify ( userId: number, rawUserData : {
        name : string,
        roles : string,
        email : string,
        username : string, 
        password : string,
        birth_date : Date,
    } ) : Promise<User>
    {
        const modifiedUser = await this.userRepository.findOne( userId );
        Object.keys(rawUserData).forEach( ( key ) => { modifiedUser[key] = ( key === "password" ) ? bcrypt.hashSync(rawUserData[key], 10) : rawUserData[key]; } );
        return await this.userRepository.save(modifiedUser); 
    }
    public async addToGroup( userId : number, groupId : number, forceTrainee : boolean = false ) : Promise<{success : boolean, error ?: any}> 
    {
        try
        {
            const groupToAddTo = await this.groupRepository.findOne( groupId, { relations: ["trainings", "members", "coaches"] } );
            const userToBeAdded = await this.userRepository.findOne( userId, { relations: ["groups"] } );
            if( userToBeAdded.roles.match(/.*coach.*/) || !forceTrainee )
            {
                const coachToBeAdded = await this.coachRepository.findOne( userId )
                groupToAddTo.coaches.push( coachToBeAdded );
                coachToBeAdded.groups.push( groupToAddTo );
                await this.coachRepository.save( coachToBeAdded )
            }
            else
            {
                groupToAddTo.members.push( userToBeAdded );
                userToBeAdded.groups.push( groupToAddTo );
                await this.userRepository.save(userToBeAdded);
            }
            await this.groupRepository.save(groupToAddTo);
            return {success : true};
        }
        catch( error )
        {
            return {success: false, error: error.toString() };
        }
    }
    public async removeFromGroup( userId : number, groupId : number, forceTrainee : boolean = false ) : Promise<{success : boolean, error ?: any}> 
    {
        try
        {
            const groupToRemoveFrom = await this.groupRepository.findOne( groupId, { relations: ["trainings", "members", "coaches"] } );
            const userToRemove = await this.userRepository.findOne( userId, { relations: ["groups"] } );
            if( userToRemove.roles.match(/.*coach.*/) || !forceTrainee )
            {
                let coachToRemove = await this.coachRepository.findOne( userToRemove.id );
                let coachIndex = groupToRemoveFrom.coaches.indexOf( coachToRemove );
                groupToRemoveFrom.coaches.splice(coachIndex);
                let groupIndex = coachToRemove.groups.indexOf( groupToRemoveFrom );
                coachToRemove.groups.splice( groupIndex );
                await this.coachRepository.save( coachToRemove );
            }
            else 
            {
                let userIndex = groupToRemoveFrom.members.indexOf( userToRemove );
                groupToRemoveFrom.members.splice( userIndex );
                let groupIndex = userToRemove.groups.indexOf( groupToRemoveFrom );
                userToRemove.groups.splice( groupIndex );
                await this.userRepository.save( userToRemove );

            }
            await this.groupRepository.save( groupToRemoveFrom );
            return {success : true};
        }
        catch( error )
        {
            return {success: false, error: error.toString() };
        }
    }
    public async addToTraining( userId : number, trainingId : number, forceTrainee : boolean = false ) : Promise<{success : boolean, error ?: any}> 
    {
        try
        {
            const trainingToAddTo = await this.trainingRepository.findOne( trainingId, { relations: ["attendees", "coaches"] } );
            const userToBeAdded = await this.userRepository.findOne( userId, { relations: ["trainings"] } );
            if( userToBeAdded.roles.match(/.*coach.*/) || !forceTrainee )
            {
                const coachToBeAdded = await this.coachRepository.findOne( userToBeAdded.id );
                trainingToAddTo.coaches.push( coachToBeAdded );
                coachToBeAdded.trainings.push( trainingToAddTo );
                await this.coachRepository.save( coachToBeAdded );
            }
            else
            {
                trainingToAddTo.attendees.push( userToBeAdded );
                userToBeAdded.trainings.push( trainingToAddTo );
                this.userRepository.save( userToBeAdded );
            }
            await this.trainingRepository.save( trainingToAddTo );
            return {success : true};
        }
        catch( error )
        {
            return {success: false, error: error.toString() };
        }
    }
    public async removeFromTraining( userId : number, trainingId : number, forceTrainee : boolean = false ) : Promise<{success : boolean, error ?: any}>
    {
        try
        {
            const trainingToRemoveFrom = await this.groupRepository.findOne( trainingId );
            const userToRemove = await this.userRepository.findOne( userId ); // , { relations: ["groups"] }
            if( userToRemove.roles.match(/.*coach.*/) || !forceTrainee )
            {
                let coachToRemove = await this.coachRepository.findOne( userToRemove.id );
                let coachIndex = trainingToRemoveFrom.coaches.indexOf( coachToRemove );
                trainingToRemoveFrom.coaches.splice(coachIndex);
                let trainingIndex = coachToRemove.groups.indexOf( trainingToRemoveFrom );
                coachToRemove.groups.splice( trainingIndex );
                await this.coachRepository.save( coachToRemove );
                trainingToRemoveFrom.coaches.splice(coachIndex);
            }
            else 
            {
                let userIndex = trainingToRemoveFrom.members.indexOf( userToRemove );
                trainingToRemoveFrom.members.splice( userIndex );
                let trainingIndex = userToRemove.groups.indexOf( trainingToRemoveFrom );
                userToRemove.groups.splice( trainingIndex );
                await this.userRepository.save( userToRemove );
            }
            await this.trainingRepository.save( trainingToRemoveFrom );
            return {success : true};
        }
        catch( error )
        {
            return {success: false, error: error.toString() };
        }
    }
    public async listAvailableTrainings( userId : number ) : Promise<[Training, boolean][]>
    {
        let availableTrainings : [ Training, boolean ][]; // boolean is true if user has already signed up for that training
        let user = await this.userRepository.findOne( userId, { relations: ["groups"] } );
        user.groups.forEach( group => { 
            group.trainings.forEach( training => {
                if ( user.trainings.includes( training ) ) { availableTrainings.push( [ training, true ] ) }
                else { availableTrainings.push( [ training, false ] ) }
            });
        });
        return availableTrainings;
    }
    public async login( username : string, rawpassword : string ) : Promise<boolean> 
    {
        let user = await this.userRepository.findOne( { username } );
        if ( !user )
        {
            return false;
        }
        return bcrypt.compareSync( rawpassword, user.password);
    }
}