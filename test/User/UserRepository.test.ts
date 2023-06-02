import { MongodbUserRepository, MysqlUserRepository, UserRepositoryFactory } from '../../src/User/UserRepository';
import { DatabaseRepository, DatabaseType } from '../../src/Database/DatabaseRepository';
import { MongoClient } from 'mongodb';

jest.spyOn(DatabaseRepository.prototype, 'encryptPassword').mockReturnValue(
    'hashedPassword',
);

jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const mockMongoClient = {
    close: jest.fn().mockResolvedValue({}),
    db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
            insertOne: jest.fn().mockResolvedValue(undefined),
            findOne: jest.fn(), // Return value of the method can be modified upon different cases
        }),
    }),
} as any;

jest.spyOn(MongoClient.prototype, 'connect').mockImplementation(
    () => mockMongoClient,
);

describe('MongodbUserRepository', () => {
    let mongodbUserRepository: MongodbUserRepository;

    beforeEach(() => {
        mongodbUserRepository = new MongodbUserRepository();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addUser', () => {
        test('should return the User', async () => {
            jest.spyOn(mongodbUserRepository, 'createCollectionIfNotExists').mockResolvedValue(undefined);

            const result = await mongodbUserRepository.addUser(
                'username',
                'password',
                'email',
            );

            expect(result).toMatchSnapshot();
        });
    });

    describe('getUserByEmail', () => {
        test('should return undefined if no such collection', async () => {
            jest.spyOn(mongodbUserRepository, 'existsCollection').mockResolvedValue(false);

            const result = await mongodbUserRepository.getUserByEmail('email');

            expect(result).toBe(undefined);
        });

        test('should return undefined if no such user', async () => {
            jest.spyOn(mongodbUserRepository, 'existsCollection').mockResolvedValue(true);

            mockMongoClient.db().collection().findOne = jest.fn().mockResolvedValue(undefined)

            const result = await mongodbUserRepository.getUserByEmail('email');

            expect(result).toBe(undefined);
        });

        test('should return the user if it exists', async () => {
            jest.spyOn(mongodbUserRepository, 'existsCollection').mockResolvedValue(true);

            mockMongoClient.db().collection().findOne = jest.fn().mockResolvedValue({
                userId: 'userId2',
                username: 'username2',
                hashedPassword: 'hashedPassword2',
                email: 'email2',
            })

            const result = await mongodbUserRepository.getUserByEmail('email2');

            expect(result).toMatchSnapshot();
        })
    })
});

describe('MysqlUserRepository', () => {
    let mysqlUserRepository: MysqlUserRepository;

    beforeEach(() => {
        mysqlUserRepository = new MysqlUserRepository();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addUser', () => {
        test('should return the inserted user', async () => {
            jest.spyOn(mysqlUserRepository, 'createUserTableIfNotExists').mockResolvedValue(undefined);
            jest.spyOn(mysqlUserRepository, 'execSql').mockResolvedValue(undefined);

            const result = await mysqlUserRepository.addUser(
                'username_mysql',
                'password_mysql',
                'email@mysql',
            );

            expect(result).toMatchSnapshot();
        });
    });

    describe('getUserByEmail', () => {
        test('should return undefined if no such table', async () => {
            jest.spyOn(mysqlUserRepository, 'existsTable').mockResolvedValue(false);

            const result = await mysqlUserRepository.getUserByEmail('email');

            expect(result).toBe(undefined);
        });

        test('should return the user if it exists', async () => {
            jest.spyOn(mysqlUserRepository, 'existsTable').mockResolvedValue(true);
            jest.spyOn(mysqlUserRepository, 'execSql').mockResolvedValue([{
                userId: 'userId2_mysql',
                username: 'username2_mysql',
                hashedPassword: 'hashedPassword2_mysql',
                email: 'email2@mysql',
            }]);

            const result = await mysqlUserRepository.getUserByEmail('email2@mysql');

            expect(result).toMatchSnapshot();
        });

        test('should return undefined if the user does not exist', async () => {
            jest.spyOn(mysqlUserRepository, 'existsTable').mockResolvedValue(true);
            jest.spyOn(mysqlUserRepository, 'execSql').mockResolvedValue([]);

            const result = await mysqlUserRepository.getUserByEmail('email2@mysql');

            expect(result).toBe(undefined);
        });
    })
});

describe('Test UserRepositoryFactory', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return MongodbUserRepository if it is MongoDB', () => {
        const result = UserRepositoryFactory.createUserRepository(DatabaseType.MongoDB);
        expect(result).toBeInstanceOf(MongodbUserRepository);
    });

    test('should return MysqlImageRepository if it is Mysql', () => {
        const result = UserRepositoryFactory.createUserRepository(DatabaseType.MySQL);
        expect(result).toBeInstanceOf(MysqlUserRepository);
    });

    test('should throw an error for an invalid database type', () => {
        expect(() => {
            UserRepositoryFactory.createUserRepository('InvalidDatabaseType' as unknown as  DatabaseType);
          }).toThrowError('Invalid database type');
    });
})
