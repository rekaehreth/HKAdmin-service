import { Injectable } from '@nestjs/common';
import { Group } from '../group/group.entity';
import { Location } from '../location/location.entity';
import { Connection, DeleteResult, Repository } from 'typeorm';
import { Training } from './training.entity';

@Injectable()
export class TrainingService {
    trainingRepository: Repository<Training>;
    locationRepository: Repository<Location>;
    groupRepository: Repository<Group>;

    constructor(connection: Connection) {
        this.trainingRepository = connection.getRepository(Training);
        this.locationRepository = connection.getRepository(Location);
        this.groupRepository = connection.getRepository(Group);
    }

    public async getAll(): Promise<Training[]> {
        return await this.trainingRepository.find({ relations: ["location", "attendees", "coaches", "groups", "payments"] });
    }

    public async getById(id: number): Promise<Training> {
        return await this.trainingRepository.findOne(id, { relations: ["location", "attendees", "coaches", "groups", "payments"] });
    }

    public async create(locationId: number, rawTrainingData: {
        startTime: Date,
        endTime: Date,
        status: string, // Planned | Fixed | Past
        type: string, // Száraz | Jeges | Balett
    }): Promise<Training> {
        const newTraining = new Training();
        const site = await this.locationRepository.findOne(locationId, {relations: ["trainings"]});
        if( site === undefined ) {
            throw new Error('There is no location in the database with the given id');
        }
        Object.keys(rawTrainingData).forEach((key) => { newTraining[key] = rawTrainingData[key] });
        newTraining.location = site;
        newTraining.status = "planned";
        newTraining.applications = "";
        return await this.trainingRepository.save(newTraining);
    }

    public async delete(id: number): Promise<DeleteResult> {
        return await this.trainingRepository.delete(id);
    }

    public async modify(locationId: number, trainingId: number, rawTrainingData: {
        startTime: Date,
        endTime: Date,
        status: string, // Planned | Fixed | Past
        type: string, // Száraz || Jeges | Balett
    }): Promise<Training> {
        const site = await this.locationRepository.findOne(locationId);
        if( site === undefined ) {
            throw new Error('There is no location in the database with the given id');
        }
        const modifiedTraining = await this.trainingRepository.findOne(trainingId);
        if( modifiedTraining === undefined ) {
            throw new Error('There is no training in the database with the given id');
        }
        Object.keys(rawTrainingData).forEach((key) => { modifiedTraining[key] = rawTrainingData[key] });
        modifiedTraining.location = site;
        return await this.trainingRepository.save(modifiedTraining);
    }

    public async addGroupToTraining(groupId, trainingId): Promise<Training> {
        const trainingToAddTo = await this.trainingRepository.findOne(trainingId, { relations: ["groups"] });
        if( trainingToAddTo === undefined ) {
            throw new Error('There is no training in the database with the given id');
        }
        const groupToAdd = await this.groupRepository.findOne(groupId);
        if( groupToAdd === undefined ) {
            throw new Error('There is no group in the database with the given id');
        }
        trainingToAddTo.groups.push(groupToAdd);
        return await this.trainingRepository.save(trainingToAddTo);
    }

    public async removeGroupFromTraining(groupId, trainingId): Promise<Training> {
        const groupToRemove = await this.groupRepository.findOne(groupId);
        if(groupToRemove === undefined) {
            throw new Error('There is no group in the database with the given id');
        }
        const trainingToRemoveFrom = await this.trainingRepository.findOne(trainingId, { relations: ["groups"] });
        if(trainingToRemoveFrom === undefined) {
            throw new Error('There is no training in the database with the given id');
        }

        const groupIndex = trainingToRemoveFrom.groups.map((group) => group.id).indexOf(groupId);
        trainingToRemoveFrom.groups.splice(groupIndex, 1);
        return await this.trainingRepository.save(trainingToRemoveFrom);
    }
}
