import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { Connection, createConnection, Repository } from 'typeorm';
import { User } from './user.entity';
import { Group } from '../../src/group/group.entity';
import { Coach } from '../../src/coach/coach.entity';
import { createTestUser, createPartialTestUser } from '../../test/unit-helpers/user_helper';
import { createTestGroup } from '../../test/unit-helpers/group_helper';
import { createTestCoach } from '../../test/unit-helpers/coach_helper';
import * as bcrypt from 'bcrypt';

require('dotenv').config();


describe('UserService', () => {
    let service: UserService;
    let connection: Connection;
    let repository: Repository<User>;
    jest.setTimeout(100000);
    beforeAll(async () => {
        connection = await createConnection({
            "type": "mysql",
            "host": process.env.TEST_DB_HOST,
            "port": parseInt(process.env.TEST_DB_PORT),
            "username": process.env.TEST_DB_USER,
            "password": process.env.TEST_DB_PASSWORD,
            "database": process.env.TEST_DB_DATABASE,
            "entities": ["../**/*.entity.ts"],
            "synchronize": true
        });
        service = new UserService(connection, {} as JwtService);
        repository = connection.getRepository(User);
    });
    afterAll( async () => {
        await connection.close();
    })
    beforeEach( async () => {
        await repository.query('SET FOREIGN_KEY_CHECKS = 0;');
        await repository.clear();
        await repository.query('SET FOREIGN_KEY_CHECKS = 1;');
    });
    it('is defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        it('does not create a new user when there\'s already a user in the db with the given email', async () => {
            await repository.save(createTestUser({ email: 'testEmail@example.com' }));
            const result = await service.create( createPartialTestUser({email: 'testEmail@example.com'}));

            expect(result.success).toEqual(false);
            expect(result.user).toEqual(undefined);
        });
        it('creates a new user when there\'s no user in the db with the given email', async () => {
            const result = await service.create( createPartialTestUser({email: 'testEmail@example.com'}));

            expect(result.success).toEqual(true);
            expect(result.user.name).toEqual('test_name');
            expect(result.user.email).toEqual('testEmail@example.com');
        });
        it('appends trainee to roles if there were none given', async () => {
            const result = await service.create(createPartialTestUser());

            expect(result.success).toEqual(true);
            expect(result.user.roles).toEqual('trainee ');

        });
        it('does not append trainee to roles if there were none given', async () => {
            const result = await service.create(createPartialTestUser({ roles: "coach "}));

            expect(result.success).toEqual(true);
            expect(result.user.roles).toEqual('coach ');
        });
        it('encrypts the given password', async () => {
            const mockBcryptHashSynnc = jest.fn((pwd: string) => 'not' + pwd);
            (bcrypt.hashSync as jest.Mock) = mockBcryptHashSynnc;

            const result = await service.create(createPartialTestUser({ password: "testpassword"}));

            expect(result.success).toEqual(true);
            expect(mockBcryptHashSynnc).toBeCalledTimes(1);
            expect(result.user.password).toEqual('nottestpassword');
        });
    });
    describe('modify', () => {
        it('does not modify if the given userId is not in the db', async () => {
            const result = await service.modify(1, createPartialTestUser({ name: 'Test User'}));

            expect(result.success).toEqual(false);
            expect(result.user).toEqual(undefined);
        });
        it('modifies if the given userId is in the db', async () => {
            await repository.save(createTestUser({ name: 'Test User' }));

            const result = await service.modify(1, createPartialTestUser({ name: 'John Doe'}));

            expect(result.success).toEqual(true);
            expect(result.user.name).toEqual('John Doe');
        });
        it('does not modify if the given email is already the db', async () => {
            await repository.save(createTestUser({ name: 'Test User', email: 'testEmail@example.com' }));
            await repository.save(createTestUser({ name: 'Test User', email: 'test@example.com' }));

            const result = await service.modify(1, createPartialTestUser({ email: 'test@example.com'}));

            expect(result.success).toEqual(false);
            expect(result.user).toEqual(undefined);
        });
        it('encrypts the given password', async () => {
            await repository.save(createTestUser({ password: 'testpassword' }));
            const mockBcryptHashSynnc = jest.fn((pwd: string) => 'modified' + pwd);
            (bcrypt.hashSync as jest.Mock) = mockBcryptHashSynnc;

            const result = await service.modify(1, createPartialTestUser({ password: "originalpassword"}));

            expect(result.success).toEqual(true);
            expect(mockBcryptHashSynnc).toBeCalledTimes(1);
            expect(result.user.password).toEqual('modifiedoriginalpassword');
        });
    });
    describe('addToGroup', () => {
        let groupRepository;
        let coachRepository;
        beforeAll( () => {
            groupRepository = connection.getRepository(Group);
            coachRepository = connection.getRepository(Coach);
        });

        beforeEach( async () => {
            await groupRepository.query('SET FOREIGN_KEY_CHECKS = 0;');
            await groupRepository.query('TRUNCATE TABLE user_groups_group;');
            await groupRepository.query('TRUNCATE TABLE coach_groups_group;');
            await groupRepository.clear();
            await groupRepository.query('SET FOREIGN_KEY_CHECKS = 1;');

            await coachRepository.query('SET FOREIGN_KEY_CHECKS = 0;');
            await coachRepository.clear();
            await coachRepository.query('SET FOREIGN_KEY_CHECKS = 1;');
        });
        it('returns success: false for non-existent userId', async () => {
            await groupRepository.save(createTestGroup());

            const result = await service.addToGroup(1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no user in db with the given id');
        });
        it('returns success: false for non-existent groupId', async () => {
            await repository.save(createTestUser());

            const result = await service.addToGroup(1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no group in db with the given id');
        });
        it('adds the user to the group', async () => {
            await repository.save(createTestUser());
            await groupRepository.save(createTestGroup());

            const result = await service.addToGroup(1, 1, false);

            const user = await repository.find({ relations: ["groups"], where: {id: 1} });
            const group = await groupRepository.find({ relations: ["members"], where: {id: 1} });
            
            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(group.length).toEqual(1);
            expect(user[0].groups.length).toEqual(1);
            expect(user[0].groups[0].id).toEqual(1);
            expect(group[0].members.length).toEqual(1);
            expect(group[0].members[0].id).toEqual(1);
        });
        it('adds a user with coach role to the group as a coach', async () => {
            const createdUser = await repository.save(createTestUser({roles: 'coach '}));
            await groupRepository.save(createTestGroup());
            await coachRepository.save(createTestCoach({user: createdUser}));

            const result = await service.addToGroup(1, 1, false);

            const user = await repository.find({ relations: ["groups"], where: {id: 1} });
            const group = await groupRepository.find({ relations: ["members", "coaches"], where: {id: 1} });
            const coach = await coachRepository.find({ relations: ["groups"], where: {user: createdUser } });

            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(group.length).toEqual(1);
            expect(coach.length).toEqual(1);
            expect(user[0].groups.length).toEqual(0);
            expect(group[0].members.length).toEqual(0);
            expect(group[0].coaches.length).toEqual(1);
            expect(group[0].coaches[0].id).toEqual(1);
            expect(coach[0].groups.length).toEqual(1);
            expect(coach[0].groups[0].id).toEqual(1);
        });
        it('adds a user with coach role to the group as a member when forceTrainee is true', async () => {
            const createdUser = await repository.save(createTestUser({roles: 'coach '}));
            await groupRepository.save(createTestGroup());
            await coachRepository.save(createTestCoach({user: createdUser}))

            const result = await service.addToGroup(1, 1, true);

            const user = await repository.find({ relations: ["groups"], where: {id: 1} });
            const group = await groupRepository.find({ relations: ["members", "coaches"], where: {id: 1} });
            const coach = await coachRepository.find({ relations: ["groups"], where: {user: createdUser } });

            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(group.length).toEqual(1);
            expect(coach.length).toEqual(1);
            expect(user[0].groups.length).toEqual(1);
            expect(user[0].groups[0].id).toEqual(1);
            expect(group[0].coaches.length).toEqual(0);
            expect(group[0].members.length).toEqual(1);
            expect(group[0].members[0].id).toEqual(1);
            expect(coach[0].groups.length).toEqual(0);
        });
        it('returns success: false when trying to add a user with coach role, but there is no matching coach in the db', async () => {
            const createdUser = await repository.save(createTestUser({roles: 'coach '}));
            await groupRepository.save(createTestGroup());

            const result = await service.addToGroup(1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no coach in db with the given id');
        });

    });
    describe.skip('removeFromGroup', () => {
        it('', async () => {
        });
    });
    describe.skip('addToTraining', () => {
        it('', async () => {
        });
    });
    describe.skip('removeFromTraining', () => {
        it('', async () => {
        });
    });
    describe.skip('listAvailableTrainings', () => {
        it('', async () => {
        });
    });
    describe.skip('login', () => {
        it('', async () => {
        });
    });
    describe.skip('getCoach', () => {
        it('', async () => {
        });
    });
});
