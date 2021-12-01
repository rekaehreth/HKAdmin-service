import { Connection, createConnection, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './user.service';

import { User } from './user.entity';
import { Group } from '../../src/group/group.entity';
import { Coach } from '../../src/coach/coach.entity';
import { Training } from '../../src/training/training.entity';

import { createTestUser, createPartialTestUser } from '../../test/unit-helpers/user_helper';
import { createTestGroup } from '../../test/unit-helpers/group_helper';
import { createTestCoach } from '../../test/unit-helpers/coach_helper';
import { createTestTraining } from '../../test/unit-helpers/training_helper';
import { clearDatabase } from '../../test/unit/database_helper';

import { config } from 'dotenv';
config();

describe('UserService', () => {
    let service: UserService;
    let connection: Connection;
    let repository: Repository<User>;
    let groupRepository;
    let coachRepository;
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
        service = new UserService(connection, {} as JwtService);
        repository = connection.getRepository(User);
        groupRepository = connection.getRepository(Group);
        coachRepository = connection.getRepository(Coach);
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
        it("does not create a new user when there's already a user in the db with the given email", async () => {
            await repository.save(createTestUser({ email: 'testEmail@example.com' }));

            const result = await service.create(createPartialTestUser({ email: 'testEmail@example.com' }));

            expect(result.success).toEqual(false);
            expect(result.user).toEqual(undefined);
        });
        it("creates a new user when there's no user in the db with the given email", async () => {
            const result = await service.create(createPartialTestUser({ email: 'testEmail@example.com' }));

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
            const result = await service.create(createPartialTestUser({ roles: 'coach ' }));

            expect(result.success).toEqual(true);
            expect(result.user.roles).toEqual('coach ');
        });
        it('encrypts the given password', async () => {
            const mockBcryptHashSynnc = jest.fn((pwd: string) => 'not' + pwd);
            (bcrypt.hashSync as jest.Mock) = mockBcryptHashSynnc;

            const result = await service.create(createPartialTestUser({ password: 'testpassword' }));

            expect(result.success).toEqual(true);
            expect(mockBcryptHashSynnc).toBeCalledTimes(1);
            expect(result.user.password).toEqual('nottestpassword');
        });
    });
    describe('modify', () => {
        it('does not modify if the given userId is not in the db', async () => {
            const result = await service.modify(1, createPartialTestUser({ name: 'Test User' }));

            expect(result.success).toEqual(false);
            expect(result.user).toEqual(undefined);
        });
        it('modifies if the given userId is in the db', async () => {
            await repository.save(createTestUser({ name: 'Test User' }));

            const result = await service.modify(1, createPartialTestUser({ name: 'John Doe' }));

            expect(result.success).toEqual(true);
            expect(result.user.name).toEqual('John Doe');
        });
        it('does not modify if the given email is already the db', async () => {
            await repository.save(createTestUser({
                name: 'Test User',
                email: 'testEmail@example.com',
            }));
            await repository.save(createTestUser({
                name: 'Test User',
                email: 'test@example.com',
            }));

            const result = await service.modify(1, createPartialTestUser({ email: 'test@example.com' }));

            expect(result.success).toEqual(false);
            expect(result.user).toEqual(undefined);
        });
        it('encrypts the given password', async () => {
            await repository.save(createTestUser({ password: 'testpassword' }));
            const mockBcryptHashSynnc = jest.fn((pwd: string) => 'modified' + pwd);
            (bcrypt.hashSync as jest.Mock) = mockBcryptHashSynnc;

            const result = await service.modify(1, createPartialTestUser({ password: 'originalpassword' }));

            expect(result.success).toEqual(true);
            expect(mockBcryptHashSynnc).toBeCalledTimes(1);
            expect(result.user.password).toEqual('modifiedoriginalpassword');
        });
    });
    describe('addToGroup', () => {
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

            const user = await repository.find({relations: ['groups'], where: { id: 1 }});
            const group = await groupRepository.find({ relations: ['members'], where: { id: 1 }});
            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(group.length).toEqual(1);
            expect(user[0].groups.length).toEqual(1);
            expect(user[0].groups[0].id).toEqual(1);
            expect(group[0].members.length).toEqual(1);
            expect(group[0].members[0].id).toEqual(1);
        });
        it('adds a user with coach role to the group as a coach', async () => {
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());
            await coachRepository.save(createTestCoach({ user: createdUser }));

            const result = await service.addToGroup(1, 1, false);

            const user = await repository.find({relations: ['groups'], where: { id: 1 }});
            const group = await groupRepository.find({relations: ['members', 'coaches'], where: { id: 1 }});
            const coach = await coachRepository.find({relations: ['groups'], where: { user: createdUser }});
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
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());
            await coachRepository.save(createTestCoach({ user: createdUser }));

            const result = await service.addToGroup(1, 1, true);

            const user = await repository.find({relations: ['groups'], where: { id: 1 }});
            const group = await groupRepository.find({relations: ['members', 'coaches'], where: { id: 1 }});
            const coach = await coachRepository.find({relations: ['groups'], where: { user: createdUser }});
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
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());

            const result = await service.addToGroup(1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no coach in db with the given id');
        });
    });
    describe('removeFromGroup', () => {
        it('returns success: false for non-existent userId', async () => {
            await groupRepository.save(createTestGroup());

            const result = await service.removeFromGroup(1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no user in db with the given id');
        });
        it('returns success: false for non-existent groupId', async () => {
            await repository.save(createTestUser());

            const result = await service.removeFromGroup(1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no group in db with the given id');
        });
        it('removes the user from the group', async () => {
            await repository.save(createTestUser());
            await groupRepository.save(createTestGroup());
            await service.addToGroup(1, 1, false);

            const result = await service.removeFromGroup(1, 1, false);

            const user = await repository.find({relations: ['groups'], where: { id: 1 }});
            const group = await groupRepository.find({relations: ['members'], where: { id: 1 }});
            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(group.length).toEqual(1);
            expect(user[0].groups.length).toEqual(0);
            expect(group[0].members.length).toEqual(0);
        });
        it('removes a user with coach role from the group as a coach, but not as a member', async () => {
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());
            await coachRepository.save(createTestCoach({ user: createdUser }));
            await service.addToGroup(1, 1, false);
            await service.addToGroup(1, 1, true);

            const result = await service.removeFromGroup(1, 1, false);

            const user = await repository.find({relations: ['groups'], where: { id: 1 }});
            const group = await groupRepository.find({relations: ['members', 'coaches'], where: { id: 1 }});
            const coach = await coachRepository.find({relations: ['groups'], where: { user: createdUser }});
            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(group.length).toEqual(1);
            expect(coach.length).toEqual(1);
            expect(user[0].groups.length).toEqual(1);
            expect(user[0].groups[0].id).toEqual(1);
            expect(group[0].members.length).toEqual(1);
            expect(group[0].members[0].id).toEqual(1);
            expect(group[0].coaches.length).toEqual(0);
            expect(coach[0].groups.length).toEqual(0);
        });
        it('removes a user with coach role from the group as a member, but not as a coach when forceTrainee is true', async () => {
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());
            await coachRepository.save(createTestCoach({ user: createdUser }));
            await service.addToGroup(1, 1, false);
            await service.addToGroup(1, 1, true);

            const result = await service.removeFromGroup(1, 1, true);

            const user = await repository.find({relations: ['groups'], where: { id: 1 }});
            const group = await groupRepository.find({relations: ['members', 'coaches'], where: { id: 1 }});
            const coach = await coachRepository.find({relations: ['groups'], where: { user: createdUser }});
            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(group.length).toEqual(1);
            expect(coach.length).toEqual(1);
            expect(coach[0].groups.length).toEqual(1);
            expect(coach[0].groups[0].id).toEqual(1);
            expect(group[0].coaches.length).toEqual(1);
            expect(group[0].coaches[0].id).toEqual(1);
            expect(group[0].members.length).toEqual(0);
            expect(user[0].groups.length).toEqual(0);
        });
        it('returns success: false when trying to remove a user with coach role, but there is no matching coach in the db', async () => {
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());
            await coachRepository.save(createTestCoach({ user: createdUser }));
            await service.addToGroup(1, 1, false);
            await coachRepository.delete(1);

            const result = await service.removeFromGroup(1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no coach in db with the given id');
        });
    });
    describe('addToTraining', () => {
        it('returns success: false for non-existent userId', async () => {
            await trainingRepository.save(createTestTraining());
            await groupRepository.save(createTestGroup());

            const result = await service.addToTraining(1, 1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no user in db with the given id');
        });
        it('returns success: false for non-existent trainingId', async () => {
            await repository.save(createTestUser());
            await groupRepository.save(createTestGroup());

            const result = await service.addToTraining(1, 1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no training in db with the given id');
        });
        it('returns success: false for non-existent groupId', async () => {
            await trainingRepository.save(createTestTraining());
            await repository.save(createTestUser());

            const result = await service.addToTraining(1, 1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no group in db with the given id');
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

            const user = await repository.find({relations: ['groups'],  where: { id: 1 }});
            const group = await groupRepository.find({relations: ['members'], where: { id: 1 }});
            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(group.length).toEqual(1);
            expect(user[0].groups.length).toEqual(1);
            expect(user[0].groups[0].id).toEqual(1);
            expect(group[0].members.length).toEqual(1);
            expect(group[0].members[0].id).toEqual(1);
        });
        it('adds a user with coach role to the group as a coach', async () => {
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());
            await coachRepository.save(createTestCoach({ user: createdUser }));

            const result = await service.addToGroup(1, 1, false);

            const user = await repository.find({relations: ['groups'], where: { id: 1 }});
            const group = await groupRepository.find({relations: ['members', 'coaches'], where: { id: 1 }});
            const coach = await coachRepository.find({relations: ['groups'], where: { user: createdUser }});
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
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());
            await coachRepository.save(createTestCoach({ user: createdUser }));

            const result = await service.addToGroup(1, 1, true);

            const user = await repository.find({relations: ['groups'], where: { id: 1 }});
            const group = await groupRepository.find({relations: ['members', 'coaches'], where: { id: 1 }});
            const coach = await coachRepository.find({relations: ['groups'], where: { user: createdUser }});
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
            await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());

            const result = await service.addToGroup(1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no coach in db with the given id');
        });
    });
    describe('removeFromTraining', () => {
        it('returns success: false for non-existent userId', async () => {
            await trainingRepository.save(createTestTraining());
            await groupRepository.save(createTestGroup());

            const result = await service.removeFromTraining(1, 1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no user in db with the given id');
        });
        it('returns success: false for non-existent groupId', async () => {
            await trainingRepository.save(createTestTraining());
            await repository.save(createTestUser());

            const result = await service.removeFromTraining(1, 1, 1,false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no group in db with the given id');
        });
        it('returns success: false for non-existent trainingId', async () => {
            await groupRepository.save(createTestGroup());
            await repository.save(createTestUser());

            const result = await service.removeFromTraining(1, 1, 1,false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no training in db with the given id');
        });
        it('removes the user from the training', async () => {
            await repository.save(createTestUser());
            await groupRepository.save(createTestGroup());
            await trainingRepository.save(createTestTraining());
            await service.addToTraining(1, 1, 1, false);

            const result = await service.removeFromTraining(1, 1, 1, false);

            const user = await repository.find({relations: ['trainings'], where: { id: 1 }});
            const training = await trainingRepository.find({relations: ['attendees'], where: { id: 1 }});
            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(user[0].trainings.length).toEqual(0);
            expect(training.length).toEqual(1);
            expect(training[0].attendees.length).toEqual(0)
        });
        it('removes a user with coach role from the training as a coach, but not as an attendee', async () => {
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());
            await trainingRepository.save(createTestTraining());
            await coachRepository.save(createTestCoach({ user: createdUser }));
            await service.addToTraining(1, 1, 1, false);
            await service.addToTraining(1, 1, 1, true);

            const result = await service.removeFromTraining(1, 1, 1, false);

            const user = await repository.find({relations: ['trainings'], where: { id: 1 }});
            const training = await trainingRepository.find({relations: ['attendees', 'coaches'], where: { id: 1 }});
            const coach = await coachRepository.find({relations: ['trainings'], where: { user: createdUser }});
            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(user[0].trainings.length).toEqual(1);
            expect(user[0].trainings[0].id).toEqual(1);
            expect(training.length).toEqual(1);
            expect(training[0].attendees.length).toEqual(1);
            expect(training[0].attendees[0].id).toEqual(1);
            expect(training[0].coaches.length).toEqual(0);
            expect(coach.length).toEqual(1);
            expect(coach[0].trainings.length).toEqual(0);
        });
        it('removes a user with coach role from the training as an attendee, but not as a coach when forceTrainee is true', async () => {
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());
            await trainingRepository.save(createTestTraining());
            await coachRepository.save(createTestCoach({ user: createdUser }));
            await service.addToTraining(1, 1, 1, false);
            await service.addToTraining(1, 1, 1, true);

            const result = await service.removeFromTraining(1, 1, 1, true);

            const user = await repository.find({relations: ['trainings'], where: { id: 1 }});
            const training = await trainingRepository.find({relations: ['attendees', 'coaches'], where: { id: 1 }});
            const coach = await coachRepository.find({relations: ['trainings'], where: { user: createdUser }});

            expect(result.success).toEqual(true);
            expect(user.length).toEqual(1);
            expect(training.length).toEqual(1);
            expect(coach.length).toEqual(1);
            expect(coach[0].trainings.length).toEqual(1);
            expect(coach[0].trainings[0].id).toEqual(1);
            expect(training[0].coaches.length).toEqual(1);
            expect(training[0].coaches[0].id).toEqual(1);
            expect(training[0].attendees.length).toEqual(0);
            expect(user[0].trainings.length).toEqual(0);
        });
        it('returns success: false when trying to remove a user with coach role, but there is no matching coach in the db', async () => {
            const createdUser = await repository.save(createTestUser({ roles: 'coach ' }));
            await groupRepository.save(createTestGroup());
            await coachRepository.save(createTestCoach({ user: createdUser }));
            await service.addToGroup(1, 1, false);
            await coachRepository.delete(1);

            const result = await service.removeFromGroup(1, 1, false);

            expect(result.success).toEqual(false);
            expect(result.error).toEqual('There is no coach in db with the given id');
        });
    });
    describe('listAvailableTrainings', () => {
        it('returns empty array when there is no training with the given id in the database', async () => {
            await repository.save(createTestUser());
            await groupRepository.save(createTestGroup());
            await service.addToGroup(1, 1);

            const availableTrainings = await service.listAvailableTrainings(1);

            expect(availableTrainings).toEqual([]);
        });
        it('returns empty array when the user has no group', async () => {
            await repository.save(createTestUser());
            await groupRepository.save(createTestGroup());

            const availableTrainings = await service.listAvailableTrainings(1);

            expect(availableTrainings).toEqual([]);
        });
        it('returns empty array when the users group is not linked to any trainings', async () => {
            await repository.save(createTestUser());
            await trainingRepository.save(createTestTraining());
            await service.addToGroup(1, 1);

            const availableTrainings = await service.listAvailableTrainings(1);

            expect(availableTrainings).toEqual([]);
        });
        it('throws error when there is no user in the database with the given id', async () => {
            await expect(async () => { await service.listAvailableTrainings(1) })
                .rejects
                .toThrow('There is no user with the given id')
        });
        it('returns the training and false for a training the user is not subscribed for', async () => {
            await repository.save(createTestUser());
            const group = await groupRepository.save(createTestGroup());
            await trainingRepository.save(createTestTraining({groups: [group]}));
            await service.addToGroup(1, 1);

            const availableTrainings = await service.listAvailableTrainings(1);

            expect(availableTrainings.length).toEqual(1);
            expect(availableTrainings[0].training.id).toEqual(1);
            expect(availableTrainings[0].subscribedForTraining).toEqual(false);
        });
        it('returns the training and true for a training the user is subscribed for', async () => {
            const user = createTestUser();
            const group = createTestGroup();
            const training = createTestTraining();
            training.attendees.push(user);
            await trainingRepository.save(training);
            await repository.save(user);
            group.members.push(user);
            group.trainings.push(training);
            await groupRepository.save(group);

            const availableTrainings = await service.listAvailableTrainings(1);

            expect(availableTrainings.length).toEqual(1);
            expect(availableTrainings[0].training.id).toEqual(1);
            expect(availableTrainings[0].subscribedForTraining).toEqual(true);
        });
    });
    describe('login', () => {
        it('returns success false when there is no user with the given email in the database', async () => {
            const user = createTestUser({email: 'testemail@test.com'});
            await repository.save(user);

            const result = await service.login('test@test.com', '');

            expect(result.success).toEqual(false);
        });
        it('returns success false when the given password does not match the one in the database', async () => {
            await repository.save(createTestUser({email: 'testemail@test.com'}));

            const result = await service.login('testemail@test.com', 'notGoodPassword');

            expect(result.success).toEqual(false);
        });
        it('returns success true when the given password matches the one in the database', async () => {
            const mockBcryptHashSynnc = jest.fn((pwd: string) => 'not' + pwd);
            const mockCompareSync = jest.fn((rawPassword, savedPassword) => true );
            const mockJwtSign = jest.fn( ({ id, roles }) => 'signedToken'+id+roles );
            (bcrypt.hashSync as jest.Mock) = mockBcryptHashSynnc;
            (bcrypt.compareSync as jest.Mock) = mockCompareSync;

            const jwtServiceMock = new JwtService({});
            jwtServiceMock.sign = mockJwtSign;
            service = new UserService(connection, jwtServiceMock);
            await service.create(createTestUser({email: 'testemail@test.com', password: 'goodPassword', roles: 'testRole'}));

            const result = await service.login('testemail@test.com', 'goodPassword');

            expect(result.success).toEqual(true);
            expect(result.userId).toEqual(1);
            expect(result.userRoles).toEqual('testRole');
            expect(result.token).toEqual('signedToken1testRole');
        });
    });
    describe('getCoach', () => {
        it('throws error when there is no user in the db with the given id', async () => {
            await expect(async () => { await service.getCoach(1) })
                .rejects
                .toThrow('There is no user in the database with the given id')
        });
        it('returns undefined when there is no coach in the db that is linked to the given user', async () => {
            await repository.save(createTestUser());

            const result = await service.getCoach(1);

            expect(result).toEqual(undefined);
        });
        it('returns coach object when there is a coach in the db linked to the given user', async () => {
            const user = await repository.save(createTestUser());
            await coachRepository.save(createTestCoach({ user }));

            const result = await service.getCoach(1);

            expect(result.id).toEqual(1);
            expect(result.user.id).toEqual(1);
            expect(result.groups).toEqual([]);
            expect(result.trainings).toEqual([]);
            expect(result.wage).toEqual(0);
        });
    });
});
