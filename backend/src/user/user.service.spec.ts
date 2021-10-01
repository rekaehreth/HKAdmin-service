import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockType } from '../../test/unit-helpers/mock-repository';
import { repositoryMockFactory } from '../../test/unit-helpers/mock-repository';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

describe.only('UserService', () => {
    let service: UserService;
    let repositoryMock: MockType<Repository<User>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: getRepositoryToken(User), useFactory: repositoryMockFactory },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        repositoryMock = module.get(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAll', () => {
        it('returns empty array when there are no users', () => {
            const expectedResult = [];
            repositoryMock.find.mockReturnValue( [] );

            expect(service.getAll()).toEqual(expectedResult);
        });
    })
});
