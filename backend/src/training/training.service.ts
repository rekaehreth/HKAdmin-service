import { Injectable } from '@nestjs/common';
import { Group } from 'src/group/group.entity';
import { Location } from 'src/location/location.entity';
import { Connection, DeleteResult, Repository } from 'typeorm';
import { Training } from './training.entity';
import { parse, stringify } from 'flatted';

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
        return await this.trainingRepository.find({ relations: ["location", "attendees", "coaches", "groups"] });
    }

    public async getById(id: number): Promise<Training> {
        return await this.trainingRepository.findOne(id, { relations: ["location", "attendees", "coaches"] });
    }

    public async create(locationId: number, rawTrainingData: {
        startTime: Date,
        endTime: Date,
        status: string, // Planned | Fixed | Past
        type: string, // Száraz || Jeges | Balett
    }): Promise<Training> {
        const newTraining = new Training();
        Object.keys(rawTrainingData).forEach((key) => { newTraining[key] = rawTrainingData[key] });
        if (locationId != 0) {
            const site = await this.locationRepository.findOne(locationId);
            newTraining.location = site;
        }
        newTraining.status = "planned";
        return await this.trainingRepository.save(newTraining);
    }

    public async delete(id: number): Promise<DeleteResult> {
        return await this.trainingRepository.delete(id);
    }

    public async modify(locationId: number, rawTrainingData: {
        id: number,
        startTime: Date,
        endTime: Date,
        status: string, // Planned | Fixed | Past
        type: string, // Száraz || Jeges | Balett
    }): Promise<Training> {
        const modifiedTraining = await this.trainingRepository.findOne(rawTrainingData.id);
        Object.keys(rawTrainingData).forEach((key) => { modifiedTraining[key] = rawTrainingData[key] });
        if (locationId != 0) {
            const site = await this.locationRepository.findOne(locationId);
            modifiedTraining.location = site;
        }
        return await this.trainingRepository.save(modifiedTraining);
    }
    public async addGroupToTraining(groupId, trainingId): Promise<Training> {
        const groupToAdd = await this.groupRepository.findOne(groupId);
        const trainingToAddTo = await this.trainingRepository.findOne(trainingId, { relations: ["attendees", "coaches", "groups"] });
        trainingToAddTo.groups.push(groupToAdd);
        this.trainingRepository.save(trainingToAddTo);
        return trainingToAddTo;
    }
    public async removeGroupFromTraining(groupId, trainingId): Promise<Training> {
        const groupToRemove = await this.groupRepository.findOne(groupId);
        const trainingToRemoveFrom = await this.trainingRepository.findOne(trainingId, { relations: ["attendees", "coaches", "groups"] });
        const groupIndex = trainingToRemoveFrom.groups.indexOf(groupToRemove);
        trainingToRemoveFrom.groups.splice(groupIndex);
        this.trainingRepository.save(trainingToRemoveFrom);
        return trainingToRemoveFrom;
    }
}