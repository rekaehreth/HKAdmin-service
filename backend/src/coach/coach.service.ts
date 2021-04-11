import { Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { DeleteResult, getRepository } from 'typeorm';
import { Coach } from './coach.entity';

@Injectable()
export class CoachService 
{
    public async getAll() : Promise<Coach[]>
    {
        const coachRepository = getRepository( Coach );
        return await coachRepository.find();
    }
    public async getById( id : number ) : Promise<Coach> 
    {
        const coachRepository = getRepository( Coach );
        return await coachRepository.findOne( id );
    }
    public async create( userId : number, rawCoachData : {
        wage : number,
    }) : Promise <Coach> 
    {
        const newCoach = new Coach();
        Object.keys(rawCoachData).forEach( ( key ) => { newCoach[key] = rawCoachData[key] });
        const coachRepository = getRepository( Coach );

        const userRepository = getRepository( User );
        const user = userRepository.findOne( userId );
        (await user).roles += "coach, "; 

        return await coachRepository.save( newCoach );
    }
    public async delete ( id : number ) : Promise<DeleteResult>
    {
        const coachRepository = getRepository( Coach );

        const userRepository = getRepository( User );
        const user = userRepository.findOne( id );
        (await user).roles.replace('coach, ', '');

        return await coachRepository.delete( id );
    }
    public async modify ( userId : number, rawCoachData : {
        wage : number,
    }) : Promise<Coach>
    {
        const coachRepository = getRepository( Coach ); 
        const modifiedCoach = await coachRepository.findOne( userId );
        Object.keys( rawCoachData ).forEach( (key) => { modifiedCoach[key] = rawCoachData[key] });
        return await coachRepository.save( modifiedCoach );
    }
}
