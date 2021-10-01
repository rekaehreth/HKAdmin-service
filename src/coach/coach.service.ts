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
        return await this.coachRepository.findOne( { relations: ["user"], where: { user: user } } );
    }
    public async create( userId: number, rawCoachData: {
        wage: number,
    }): Promise <Coach> {
        const newCoach = new Coach();
        Object.keys(rawCoachData).forEach( ( key ) => { newCoach[key] = rawCoachData[key] });
        const user = await this.userRepository.findOne( userId );
        user.roles += "coach "; 
        newCoach.user = user;
        return await this.coachRepository.save( newCoach );
    }
    public async delete ( id: number ): Promise<DeleteResult> {
        const coach = await this.coachRepository.findOne( id, {relations: ["user"] } );
        coach.user.roles.replace('coach ', '');
        return await this.coachRepository.delete( coach );
    }
    public async modify ( coachId: number, rawCoachData: {
        wage: number,
    }): Promise<Coach> {
        const modifiedCoach = await this.coachRepository.findOne( coachId, { relations: ["user"] } );
        Object.keys( rawCoachData ).forEach( (key) => { modifiedCoach[key] = rawCoachData[key] });
        return await this.coachRepository.save( modifiedCoach );
    }
}
