import { Connection, createConnection, Repository } from 'typeorm';
import { Group } from '../../src/group/group.entity';
import { GroupService } from './group.service';
import { clearDatabase } from '../../test/unit/database_helper';
import { config } from 'dotenv';
config();

describe('GroupService', () => {
    let service: GroupService;
    let connection: Connection;
    let repository: Repository<Group>;

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
        service = new GroupService(connection);
        repository = connection.getRepository(Group);
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
});
