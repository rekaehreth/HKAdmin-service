import { Injectable } from '@nestjs/common';
import { Location } from 'src/location/location.entity';
import { Connection, DeleteResult, getRepository, Repository } from 'typeorm';
import { Training } from './training.entity';

@Injectable()
export class TrainingService 
{
    trainingRepository: Repository<Training>;
    locationRepository: Repository<Location>;

    constructor( connection:Connection ) {
        this.trainingRepository = connection.getRepository( Training );
        this.locationRepository = connection.getRepository( Location );
    }
    public async getAll() : Promise<Training[]>
    {
        return await this.trainingRepository.find( { relations: ["location", "attendees", "coaches"] } );
    }

    public async getById( id : number ) : Promise<Training>
    {
        return await this.trainingRepository.findOne( id, { relations: ["location", "attendees", "coaches"] } );
    }

    public async create(locationId : number, rawTrainingData : {
        startTime : Date,
        endTime : Date,
    } ) : Promise<Training>
    {
        const newTraining = new Training();
        Object.keys(rawTrainingData).forEach( (key) => { newTraining[key] = rawTrainingData[key] });
        const site = await this.locationRepository.findOne(locationId);
        newTraining.location = site;
        newTraining.status = "planned";
        return await this.trainingRepository.save(newTraining);
    }

    public async delete ( id : number ) : Promise<DeleteResult>
    {
        return await this.trainingRepository.delete(id);
    }

    public async modify (locationId : number, rawTrainingData : {
        id: number, 
        startTime : Date,
        endTime : Date,
    } ) : Promise<Training>
    {
        const modifiedTraining = await this.trainingRepository.findOne( rawTrainingData.id );
        Object.keys(rawTrainingData).forEach( (key) => { modifiedTraining[key] = rawTrainingData[key] });
        const site = await this.locationRepository.findOne(locationId);
        modifiedTraining.location = site;
        return await this.trainingRepository.save(modifiedTraining); 
    }
}