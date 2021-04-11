import { Injectable } from '@nestjs/common';
import { Location } from 'src/location/location.entity';
import { DeleteResult, getRepository } from 'typeorm';
import { Training } from './training.entity';

@Injectable()
export class TrainingService 
{
    public async getAll() : Promise<Training[]>
    {
        const trainingRepository = getRepository(Training);
        return await trainingRepository.find( { relations: ["location", "attendees", "coaches"] } );
    }

    public async getById( id : number ) : Promise<Training>
    {
        const trainingRepository = getRepository(Training);
        return await trainingRepository.findOne( id, { relations: ["location", "attendees", "coaches"] } );
    }

    public async create(locationId : number, rawTrainingData : {
        startTime : Date,
        endTime : Date,
    } ) : Promise<Training>
    {
        const newTraining = new Training();
        Object.keys(rawTrainingData).forEach( (key) => { newTraining[key] = rawTrainingData[key] });
        const site = await getRepository(Location).findOne(locationId);
        newTraining.location = site;
        const trainingRepository = getRepository(Training);
        newTraining.status = "planned";
        return await trainingRepository.save(newTraining);
    }

    public async delete ( id : number ) : Promise<DeleteResult>
    {
        const trainingRepository = getRepository(Training);
        return await trainingRepository.delete(id);
    }

    public async modify (locationId : number, rawTrainingData : {
        id: number, 
        startTime : Date,
        endTime : Date,
    } ) : Promise<Training>
    {
        const trainingRepository = getRepository(Training);
        const modifiedTraining = await trainingRepository.findOne( rawTrainingData.id );
        Object.keys(rawTrainingData).forEach( (key) => { modifiedTraining[key] = rawTrainingData[key] });
        const site = await getRepository(Location).findOne(locationId);
        modifiedTraining.location = site;
        return await trainingRepository.save(modifiedTraining); 
    }
}