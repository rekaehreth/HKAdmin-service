import { Connection, createConnection, Repository } from 'typeorm';
import { Location } from '../../src/location/location.entity'
import { Training } from '../../src/training/training.entity';
import { TrainingService } from './training.service';
import { clearDatabase } from '../../test/unit/database_helper';
import { config } from 'dotenv';
import { createTestLocation } from '../../test/unit-helpers/location_helper';
import { createTestTraining } from '../../test/unit-helpers/training_helper';
import { createTestPayment } from '../../test/unit-helpers/payment_helper';
import { createTestUser } from '../../test/unit-helpers/user_helper';
import { createTestGroup } from '../../test/unit-helpers/group_helper';
import { Group } from '../group/group.entity';
config();

describe('GroupService', () => {
    let service: TrainingService;
    let connection: Connection;
    let repository: Repository<Training>;
    let locationRepository: Repository<Location>;
    let groupRepository: Repository<Group>;

    jest.setTimeout(parseInt(process.env.TEST_TIMEOUT));
    beforeAll(async () => {
        connection = await createConnection({
            type: 'mysql',
            host: process.env.TEST_DB_HOST,
            port: parseInt(process.env.TEST_DB_PORT),
            username: process.env.TEST_DB_USER,
            password: process.env.TEST_DB_PASSWORD,
            database: process.env.TEST_DB_DATABASE,
            entities: ['../**/*.entity.ts'],
            synchronize: true,
            multipleStatements: true
        });
        await connection.synchronize();
        service = new TrainingService(connection);
        repository = connection.getRepository(Training);
        locationRepository = connection.getRepository(Location);
        groupRepository = connection.getRepository(Group);
    });
    afterAll(async () => {
        await connection.close();
    });
    beforeEach(async () => {
        await clearDatabase(connection);
    });
    it('is defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        it('throws error for non-existent location', async () => {
            await expect(async() => await service.create(1, {
                startTime: new Date('2021.11.01 13:00'),
                endTime: new Date('2021.11.01 13:50'),
                status: '',
                type: 'off ice',
                isPublic: false
            }))
                .rejects
                .toThrow('There is no location in the database with the given id');
        });
        it('creates a new training', async () => {
            await locationRepository.save(createTestLocation());

            await service.create(1, {
                startTime: new Date('2021.11.01 13:00'),
                endTime: new Date('2021.11.01 13:50'),
                status: 'testStatus',
                type: 'testType',
                isPublic: false
            });

            const training = await repository.find();
            expect(training.length).toEqual(1);
            expect(training[0].id).toEqual(1);
            expect(training[0].status).toEqual('planned');
            expect(training[0].type).toEqual('testType');
            expect(training[0].applications).toEqual('');
        });
        it('adds the training to the location', async () => {
            await locationRepository.save(createTestLocation());

            await service.create(1, {
                startTime: new Date('2021.11.01 13:00'),
                endTime: new Date('2021.11.01 13:50'),
                status: 'testStatus',
                type: 'testType',
                isPublic: false
            });

            const location = await locationRepository.find({relations: ["trainings"]});
            expect(location.length).toEqual(1);
            expect(location[0].id).toEqual(1);
            expect(location[0].trainings.length).toEqual(1);
            expect(location[0].trainings[0].id).toEqual(1);
        });
    });
    describe('modify', () => {
        it('throws error for non-existent location', async () => {
            await expect(async() => await service.modify(1, 1,{
                startTime: new Date('2021.11.01 13:00'),
                endTime: new Date('2021.11.01 13:50'),
                status: '',
                type: 'off ice',
                isPublic: false
            }))
                .rejects
                .toThrow('There is no location in the database with the given id');
        });
        it('throws error for non-existent training', async () => {
            await locationRepository.save(createTestLocation());
            await expect(async() => await service.modify(1, 1,{
                startTime: new Date('2021.11.01 13:00'),
                endTime: new Date('2021.11.01 13:50'),
                status: '',
                type: 'off ice',
                isPublic: false
            }))
                .rejects
                .toThrow('There is no training in the database with the given id');
        });
        it('modifies the training', async () => {
            await locationRepository.save(createTestLocation());
            await repository.save(createTestTraining());

            await service.modify(1, 1,  {
                startTime: new Date('2021.11.01 13:00'),
                endTime: new Date('2021.11.01 13:50'),
                status: 'newTestStatus',
                type: 'newTestType',
                isPublic: false
            });

            const training = await repository.find();
            expect(training.length).toEqual(1);
            expect(training[0].id).toEqual(1);
            expect(training[0].status).toEqual('newTestStatus');
            expect(training[0].type).toEqual('newTestType');
            expect(training[0].applications).toEqual('');
        });
        it('modifies the training of the linked', async () => {
            const training = await repository.save(createTestTraining());
            await locationRepository.save(createTestLocation({trainings: [training]}));
            await locationRepository.save(createTestLocation());

            await service.modify(2, 1, {
                startTime: new Date('2021.11.01 13:00'),
                endTime: new Date('2021.11.01 13:50'),
                status: 'something',
                type: 'something else',
                isPublic: false
            });

            const locationWithoutTraining = await locationRepository.find({relations: ["trainings"], where: {id: 1}});
            expect(locationWithoutTraining.length).toEqual(1);
            expect(locationWithoutTraining[0].trainings.length).toEqual(0);
            const locationWithTraining = await locationRepository.find({relations: ["trainings"], where: {id: 2}});
            expect(locationWithTraining.length).toEqual(1);
            expect(locationWithTraining[0].trainings.length).toEqual(1);
            expect(locationWithTraining[0].trainings[0].id).toEqual(1);
        });
    });
    describe('addGroupToTraining', () => {
        it('throws error for non-existent training', async () => {
            await groupRepository.save(createTestGroup());
            await expect(async() => await service.addGroupToTraining(1, 1))
                .rejects
                .toThrow('There is no training in the database with the given id');
        });
        it('throws error for non-existent group', async () => {
            await repository.save(createTestTraining());
            await expect(async() => await service.addGroupToTraining(1, 1))
                .rejects
                .toThrow('There is no group in the database with the given id');
        });
        it('adds the group to the training', async () => {
            await repository.save(createTestTraining());
            await groupRepository.save(createTestGroup());

            const result = await service.addGroupToTraining(1, 1);

            expect(result.groups.length).toEqual(1);
            expect(result.groups[0].id).toEqual(1);
        });
    });
    describe('removeGroupFromTraining', () => {
        it('throws error for non-existent training', async () => {
            await groupRepository.save(createTestGroup());
            await expect(async() => await service.removeGroupFromTraining(1, 1))
                .rejects
                .toThrow('There is no training in the database with the given id');
        });
        it('throws error for non-existent group', async () => {
            await repository.save(createTestTraining());
            await expect(async() => await service.removeGroupFromTraining(1, 1))
                .rejects
                .toThrow('There is no group in the database with the given id');
        });
        it('removes the correct group from the training', async () => {
            await repository.save(createTestTraining());
            await groupRepository.save(createTestGroup({name: 'testGroup1'}));
            await groupRepository.save(createTestGroup({name: 'testGroup2'}));
            await service.addGroupToTraining(1, 1);
            await service.addGroupToTraining(2, 1);

            await service.removeGroupFromTraining(1, 1);

            const training = await repository.find({relations: ["groups"], where: {id: 1}});
            expect(training.length).toEqual(1);
            expect(training[0].groups.length).toEqual(1);
            expect(training[0].groups[0].id).toEqual(2);
        });
    });
});

