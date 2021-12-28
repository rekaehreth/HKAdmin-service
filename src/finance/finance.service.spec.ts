import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { Connection, createConnection, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Training } from '../training/training.entity';
import { Payment } from './payment.entity';
import { clearDatabase } from '../../test/unit/database_helper';
import { config } from 'dotenv';
import { createTestUser } from '../../test/unit-helpers/user_helper';
import { createTestPayment } from '../../test/unit-helpers/payment_helper';
import { createTestTraining } from '../../test/unit-helpers/training_helper';

config();

describe('FinanceService', () => {
    let service: FinanceService;
    let connection: Connection;
    let repository: Repository<Payment>;
    let userRepository;
    let trainingRepository;

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
        service = new FinanceService(connection);
        repository = connection.getRepository(Payment);
        userRepository = connection.getRepository(User);
        trainingRepository = connection.getRepository(Training);
    });
    afterAll(async () => {
        await connection.close();
    });
    beforeEach(async () => {
        await clearDatabase(connection);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getByUser', () => {
        it('throws error for non-existent user id', async () => {
            await expect(async() => await service.getByUser(1))
                .rejects
                .toThrow('There is no user in the database with the given id');
        });
        it('returns empty array when the user has no payments registered', async () => {
            const user = await userRepository.save(createTestUser({payments: []}));

            const result = await service.getByUser(1);
            expect(result).toEqual([]);
        });
        it('returns the payments when there are payments registered to the user', async () => {
            const user = createTestUser();
            const payment = await repository.save(createTestPayment({ user }));
            user.payments.push(payment);
            await userRepository.save(user);

            const result = await service.getByUser(1);
            expect(result.length).toEqual(1);
            expect(result[0].user.id).toEqual(1);
        });
    });
    describe('create', () => {
        it('throws error for non-existent user id', async () => {
            await expect(async() =>
                await service.create(1, 1, {
                    amount : 0,
                    time : new Date('2021.11.01'),
                    status : 'testStatus',
                    description : 'testDescription',
                    notes : ''
                }))
                .rejects
                .toThrow('There is no user in the database with the given id');
        });
        it('throws error for non-existent training id', async () => {
            await userRepository.save(createTestUser());
            await expect(async() =>
                await service.create(1, 1, {
                    amount : 0,
                    time : new Date('2021.11.01'),
                    status : 'testStatus',
                    description : 'testDescription',
                    notes : ''
                }))
                .rejects
                .toThrow('There is no training in the database with the given id');
        });
        it('creates new payment in db ', async () => {
            await userRepository.save(createTestUser());
            await trainingRepository.save(createTestTraining());

            await service.create(1, 1, {
                amount : 0,
                time : new Date('2021.11.01'),
                status : 'testStatus',
                description : 'testDescription',
                notes : 'testNotes'
            });

            const result = await repository.find();
            expect(result.length).toEqual(1);
            expect(result[0].id).toEqual(1);
            expect(result[0].amount).toEqual(0);
            expect(result[0].status).toEqual('testStatus');
            expect(result[0].description).toEqual('testDescription');
            expect(result[0].notes).toEqual('testNotes');
        });
        it('adds the payment to the users payments', async () => {
            await userRepository.save(createTestUser());
            await trainingRepository.save(createTestTraining());

            await service.create(1, 1, {
                amount : 0,
                time : new Date('2021.11.01'),
                status : 'testStatus',
                description : 'testDescription',
                notes : 'testNotes'
            });

            const users = await userRepository.find({relations: ["payments"]});
            expect(users.length).toEqual(1);
            expect(users[0].id).toEqual(1);
            expect(users[0].payments.length).toEqual(1);
            expect(users[0].payments[0].id).toEqual(1);
        });
        it('adds the payment to the trainings payments', async () => {
            await userRepository.save(createTestUser());
            await trainingRepository.save(createTestTraining());

            await service.create(1, 1, {
                amount : 0,
                time : new Date('2021.11.01'),
                status : 'testStatus',
                description : 'testDescription',
                notes : 'testNotes'
            });

            const trainigns = await trainingRepository.find({relations: ["payments"]});
            expect(trainigns.length).toEqual(1);
            expect(trainigns[0].id).toEqual(1);
            expect(trainigns[0].payments.length).toEqual(1);
            expect(trainigns[0].payments[0].id).toEqual(1);
        });
    });
    describe('modify', () => {
        it('throws error for non-existent user id', async () => {
            await repository.save(createTestPayment());
            await trainingRepository.save(createTestTraining());
            await expect(async() =>
                await service.modify(1, 1, 1, {
                    amount : -4000,
                    time : new Date('2021.11.01'),
                    status : 'testStatus',
                    description : 'testDescription',
                    notes : ''
                }))
                .rejects
                .toThrow('There is no user in the database with the given id');
        });
        it('throws error for non-existent training id', async () => {
            await repository.save(createTestPayment());
            await userRepository.save(createTestUser());
            await expect(async() =>
                await service.modify(1, 1, 1, {
                    amount : -4000,
                    time : new Date('2021.11.01'),
                    status : 'testStatus',
                    description : 'testDescription',
                    notes : ''
                }))
                .rejects
                .toThrow('There is no training in the database with the given id');
        });
        it('throws error for non-existent payment id', async () => {
            await userRepository.save(createTestUser());
            await trainingRepository.save(createTestTraining());
            await expect(async() =>
                await service.modify(1, 1, 1, {
                    amount : -4000,
                    time : new Date('2021.11.01'),
                    status : 'testStatus',
                    description : 'testDescription',
                    notes : ''
                }))
                .rejects
                .toThrow('There is no payment in the database with the given id');
        });
        it('modifies the payment in db ', async () => {
            await repository.save(createTestPayment());
            await userRepository.save(createTestUser());
            await trainingRepository.save(createTestTraining());

            await service.modify(1, 1, 1, {
                amount : -4000,
                time : new Date('2021.11.01'),
                status : 'newTestStatus',
                description : 'newTestDescription',
                notes : 'newTestNotes'
            });

            const result = await repository.find();
            expect(result.length).toEqual(1);
            expect(result[0].id).toEqual(1);
            expect(result[0].amount).toEqual(-4000);
            expect(result[0].status).toEqual('newTestStatus');
            expect(result[0].description).toEqual('newTestDescription');
            expect(result[0].notes).toEqual('newTestNotes');
        });
        it('changes the payment in the linked users payments', async () => {
            const payment = await repository.save(createTestPayment({amount: 3000}));
            await userRepository.save(createTestUser({payments: [payment]}));
            await userRepository.save(createTestUser({payments: []}));
            await trainingRepository.save(createTestTraining());

            await service.modify(2, 1, 1, {
                amount : 3000,
                time : new Date('2021.11.01'),
                status : 'testStatus',
                description : 'testDescription',
                notes : 'testNotes'
            });

            const userWithoutPayment = await userRepository.find({relations: ["payments"], where: {id: 1}});
            expect(userWithoutPayment.length).toEqual(1);
            expect(userWithoutPayment[0].payments.length).toEqual(0);
            const userWithPayment = await userRepository.find({relations: ["payments"], where: {id: 2}});
            expect(userWithPayment.length).toEqual(1);
            expect(userWithPayment[0].payments.length).toEqual(1);
            expect(userWithPayment[0].payments[0].id).toEqual(1);
            expect(userWithPayment[0].payments[0].amount).toEqual(3000);
        });
        it('changes the payment in the linked trainings payments', async () => {
            const payment = await repository.save(createTestPayment({amount: 3000}));
            await userRepository.save(createTestUser());
            await trainingRepository.save(createTestTraining({payments: [payment]}));
            await trainingRepository.save(createTestTraining({payments: []}));

            await service.modify(1, 1, 2, {
                amount : 3000,
                time : new Date('2021.11.01'),
                status : 'testStatus',
                description : 'testDescription',
                notes : 'testNotes'
            });

            const trainingWithoutPayment = await trainingRepository.find({relations: ["payments"], where: {id: 1}});
            expect(trainingWithoutPayment.length).toEqual(1);
            expect(trainingWithoutPayment[0].payments.length).toEqual(0);
            const trainingWithPayment = await trainingRepository.find({relations: ["payments"], where: {id: 2}});
            expect(trainingWithPayment.length).toEqual(1);
            expect(trainingWithPayment[0].payments.length).toEqual(1);
            expect(trainingWithPayment[0].payments[0].id).toEqual(1);
            expect(trainingWithPayment[0].payments[0].amount).toEqual(3000);
        });
    });
});
