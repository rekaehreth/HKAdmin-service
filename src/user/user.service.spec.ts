import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { Connection, createConnection, Repository } from 'typeorm';
import { User } from './user.entity';
import { createTestUser, createPartialTestUser } from '../../test/unit-helpers/user_helper';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
    let service: UserService;
    let connection: Connection;
    let repository: Repository<User>;
    jest.setTimeout(100000);

    beforeAll(async () => {
        connection = await createConnection({
            "name": "test",
            "type": "mysql",
            "host": "localhost",
            "port": 3306,
            "username": "test",
            "password": "test",
            "database": "hkadmin-test", 
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
    describe.skip('addToGroup', () => {
        it('', async () => {
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
