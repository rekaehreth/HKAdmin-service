import { Get, Param, Controller, Post, Body, Delete, Logger } from '@nestjs/common';
import { Application, parseTrainingApplications } from '../utils';
import { DeleteResult } from 'typeorm';
import { Training } from './training.entity';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {

    private logger = new Logger('Training controller');
    constructor (
        private readonly service : TrainingService
    ){}

    @Get()
    async getAll() : Promise<Training[]> {
        return await this.service.getAll();
    }

    @Get('/listPublic')
    async listPublic() : Promise<Training[]> {
        return await this.service.listPublicTrainings();
    }

    @Get('/:id')
    async getById( @Param('id') id : number ) : Promise<Training> {
        return await this.service.getById(id);
    }

    @Get('/getApplications/:id')
    async getApplications( @Param('id') id:number ): Promise<Application[]> {
        const training = await this.service.getById(id);
        const applications = parseTrainingApplications(training.applications);
        return applications;
    }

    @Post('/new')
    async create(
        @Body()
            requestBody : {
            locationId : number,
            rawTrainingData : {
                startTime : Date,
                endTime : Date,
                status : string, // Planned | Fixed | Past
                type: string, // Száraz || Jeges | Balett
                isPublic: boolean,
            }
        }
    ) : Promise<Training>
    {
        return await this.service.create(requestBody.locationId, requestBody.rawTrainingData);
    }

    @Delete('/:id')
    async delete ( @Param('id') id : number ) : Promise<DeleteResult>
    {
        return await this.service.delete(id);
    }

    @Post('/modify')
    async modify(
        @Body()
            requestBody : {
            locationId : number,
            rawTrainingData : {
                id: number,
                startTime : Date,
                endTime : Date,
                status : string, // Planned | Fixed | Past
                type: string, // Száraz || Jeges | Balett
                isPublic: boolean,
            }
        }
    ) : Promise<Training>
    {
        return await this.service.modify(requestBody.locationId, requestBody.rawTrainingData.id, requestBody.rawTrainingData);
    }

    @Post('/addGroup')
    async addGroupToTraining(
        @Body()
            requestBody : {
            groupId : number,
            trainingId : number,
        }
    ) : Promise<Training>
    {
        return await this.service.addGroupToTraining(requestBody.groupId, requestBody.trainingId);
    }

    @Post('/removeGroup')
    async removeGroupFromTraining(
        @Body()
            requestBody : {
            groupId : number,
            trainingId : number,
        }
    ) : Promise<Training>
    {
        return await this.service.removeGroupFromTraining(requestBody.groupId, requestBody.trainingId);
    }
}
