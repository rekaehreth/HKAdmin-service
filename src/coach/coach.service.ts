import { Injectable } from '@nestjs/common';
import { Connection, DeleteResult, getRepository, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Coach } from './coach.entity';
import { Location } from '../location/location.entity';

@Injectable()
export class CoachService
{
    userRepository: Repository<User>;
    coachRepository: Repository<Coach>;
    locationRepository: Repository<Location>;

    constructor( connection:Connection ) {
        this.userRepository = connection.getRepository(User);
        this.coachRepository = connection.getRepository( Coach );
        this.locationRepository = connection.getRepository( Location );
    }
    public async getAll(): Promise<Coach[]> {
        return await this.coachRepository.find( { relations: ["user", "trainings"]} );
    }
    public async getById( id: number ): Promise<Coach> {
        return await this.coachRepository.findOne( id, { relations: ["user"] } );
    }
    public async getByUserId( userId: number): Promise<Coach> {
        const user = await this.userRepository.findOne(userId);
        return await this.coachRepository.findOne( { relations: ["user", "groups"], where: { user: user } } );
    }
    public async create( userId: number, rawCoachData: {
        wage: number,
    }): Promise <Coach> {
        const user = await this.userRepository.findOne( userId );
        if(user === undefined) {
            throw new Error ('There is no user in the database with the given id');
        }
        const newCoach = new Coach();
        Object.keys(rawCoachData).forEach( ( key ) => { newCoach[key] = rawCoachData[key] });
        user.roles += "coach ";
        await this.userRepository.save(user);
        newCoach.user = user;
        return await this.coachRepository.save( newCoach );
    }
    public async delete ( id: number ): Promise<DeleteResult> {
        const coach = await this.coachRepository.findOne( id, {relations: ["user"] } );
        if( coach === undefined ) {
            throw new Error('There is no coach in the database with the given id');
        }
        const user = await this.userRepository.findOne(coach.user);
        user.roles = user.roles.replace('coach ', '');
        await this.userRepository.save(user);
        return await this.coachRepository.delete( coach );
    }
    public async modify ( coachId: number, rawCoachData: {
        wage: number,
    }): Promise<Coach> {
        const modifiedCoach = await this.coachRepository.findOne( coachId, { relations: ["user"] } );
        if(modifiedCoach === undefined) {
            throw new Error('There is no coach in the database with the given id')
        }
        Object.keys( rawCoachData ).forEach( (key) => { modifiedCoach[key] = rawCoachData[key] });
        return await this.coachRepository.save( modifiedCoach );
    }
}
