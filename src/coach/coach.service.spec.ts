import { CoachService } from './coach.service';
import { Connection, createConnection, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Group } from '../group/group.entity';
import { Coach } from './coach.entity';
import { Training } from '../training/training.entity';
import { clearDatabase } from '../../test/unit/database_helper';

import { config } from 'dotenv';
import { createTestUser } from '../../test/unit-helpers/user_helper';
import { createTestCoach } from '../../test/unit-helpers/coach_helper';
config();

describe('CoachService', () => {
    let service: CoachService;
    let connection: Connection;
    let repository: Repository<Coach>;
    let groupRepository;
    let userRepository;
    let trainingRepository;

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
        service = new CoachService(connection);
        repository = connection.getRepository(Coach);
        groupRepository = connection.getRepository(Group);
        userRepository = connection.getRepository(User);
        trainingRepository = connection.getRepository(Training);
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
        it('throws error when there is no user in the db with the given id', async () => {
            await expect(async () => { await service.create(1, { wage: 0}) })
                .rejects
                .toThrow('There is no user in the database with the given id');
        });
        it('adds coach to the roles of the linked user', async () => {
            await userRepository.save(createTestUser({roles: ''}));

            await service.create(1, { wage: 0});

            const user = await userRepository.find({where: { id: 1 }});
            expect(user.length).toEqual(1);
            expect(user[0].roles).toEqual('coach ');
        });
        it('save the new coach with ', async () => {
            await userRepository.save(createTestUser());

            const result = await service.create(1, { wage: 53});

            expect(result.id).toEqual(1);
            expect(result.wage).toEqual(53);
            expect(result.user.id).toEqual(1);
        });
    });
    describe('delete', () => {
        it('throws error when there is no coach in the db with the given id', async () => {
            await expect(async () => { await service.delete(1 ) })
                .rejects
                .toThrow('There is no coach in the database with the given id');
        });
        it('removes the coach with the given id from the database', async () => {
            const user = userRepository.save(createTestUser());
            await repository.save(createTestCoach({ user }));

            await service.delete(1);

            const coach = await repository.find();
            expect(coach.length).toEqual(0);
        });
        it('removes coach from the linked users roles', async () => {
            await repository.save(createTestCoach({ user: userRepository.save(createTestUser({roles: 'coach '})) }));

            await service.delete(1);

            const users = await userRepository.find();
            expect(users.length).toEqual(1);
            expect(users[0].id).toEqual(1);
            expect(users[0].roles).toEqual('');
        });
    });
    describe('modify', () => {
        it('throws error when there is no coach in the db with the given id', async () => {
            await expect(async () => { await service.modify(1, {wage: 56}) })
                .rejects
                .toThrow('There is no coach in the database with the given id');
        });
        it('modifies the given coach', async () => {
            const user = userRepository.save(createTestUser());
            await repository.save(createTestCoach({ user , wage: 36}));

            await service.modify(1, {wage: 42});

            const coach = await repository.find();
            expect(coach.length).toEqual(1);
            expect(coach[0].id).toEqual(1);
            expect(coach[0].wage).toEqual(42);
        });
    });
});
