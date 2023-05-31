import { MongoClient } from 'mongodb';
import {
    DatabaseRepository,
    DatabaseType,
} from '../../src/Database/DatabaseRepository';
import bcrypt from 'bcryptjs';

describe('Test DatabaseRepository', () => {
    let databaseRepository: DatabaseRepository;

    beforeEach(() => {
        databaseRepository = new DatabaseRepository(DatabaseType.MongoDB);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('existsCollection', () => {
        let mockMongoClient: jest.Mocked<MongoClient>;
        let mockToArray: jest.Mock<any, any, any>;

        beforeEach(() => {
            mockToArray = jest.fn();
            mockMongoClient = {
                db: jest.fn().mockReturnValue({
                    listCollections: jest.fn().mockReturnValue({
                        toArray: mockToArray
                    }),
                }),
                close: jest.fn().mockResolvedValue(undefined),
            } as unknown as jest.Mocked<MongoClient>;

            (MongoClient.connect as jest.Mock) = jest
                .fn()
                .mockResolvedValue(mockMongoClient);
        });

        test('should return true if collection exists', async () => {
            mockToArray.mockResolvedValue(['user']);

            const result = await databaseRepository.existsCollection('users');

            // Check the result
            expect(result).toBe(true);
            expect(MongoClient.connect).toHaveBeenCalled();
            expect(
                mockMongoClient.db().listCollections,
            ).toHaveBeenCalled();
            expect(
                mockMongoClient.db().listCollections().toArray,
            ).toHaveBeenCalled();
            expect(mockMongoClient.close).toHaveBeenCalled();
        });

        test('should return false if collection does not exist', async () => {
            mockToArray.mockResolvedValue([]);

            const result = await databaseRepository.existsCollection('users');

            // Check the result
            expect(result).toBe(false);
            expect(MongoClient.connect).toHaveBeenCalled();
            expect(
                mockMongoClient.db().listCollections,
            ).toHaveBeenCalled();
            expect(
                mockMongoClient.db().listCollections().toArray,
            ).toHaveBeenCalled();
            expect(mockMongoClient.close).toHaveBeenCalled();
        });
    });

    describe('createCollectionIfNotExists', () => {
        let mockMongoClient: jest.Mocked<MongoClient>;

        beforeEach(() => {
            mockMongoClient = {
                db: jest.fn().mockReturnValue({
                    createCollection: jest.fn().mockResolvedValue(undefined),
                }),
                close: jest.fn().mockResolvedValue(undefined),
            } as unknown as jest.Mocked<MongoClient>;

            (MongoClient.connect as jest.Mock) = jest
                .fn()
                .mockResolvedValue(mockMongoClient);
        });

        test('should return undefine if collection exists', async () => {
            jest.spyOn(
                databaseRepository,
                'existsCollection',
            ).mockResolvedValueOnce(true);

            const result = await databaseRepository.createCollectionIfNotExists(
                'users',
            );

            // Check the result
            expect(result).toBe(undefined);
            expect(databaseRepository.existsCollection).toHaveBeenCalledTimes(
                1,
            );
            expect(MongoClient.connect).not.toHaveBeenCalled();
            expect(
                mockMongoClient.db().createCollection,
            ).not.toHaveBeenCalled();
            expect(mockMongoClient.close).not.toHaveBeenCalled();
        });

        test('should create a new collection if it does not exist', async () => {
            jest.spyOn(
                databaseRepository,
                'existsCollection',
            ).mockResolvedValueOnce(false);

            const result = await databaseRepository.createCollectionIfNotExists(
                'users',
            );

            // Check the result
            expect(result).toBe(undefined);
            expect(databaseRepository.existsCollection).toHaveBeenCalledTimes(
                1,
            );
            expect(MongoClient.connect).toHaveBeenCalledTimes(1);
            expect(mockMongoClient.db().createCollection).toHaveBeenCalledTimes(
                1,
            );
            expect(mockMongoClient.close).toHaveBeenCalledTimes(1);
        });
    });

    describe('encryptPassword', () => {
        test('should return the encrypted password', async () => {
            jest.spyOn(bcrypt, 'genSaltSync').mockReturnValueOnce('no');
            jest.spyOn(bcrypt, 'hashSync').mockReturnValueOnce('encrypted');

            const result = databaseRepository.encryptPassword('password');

            // Check the result
            expect(result).toBe('encrypted');
            expect(bcrypt.genSaltSync).toHaveBeenCalledTimes(1);
            expect(bcrypt.hashSync).toHaveBeenCalledTimes(1);
        });
    });
});

describe('Test DatabaseRepository', () => {
    let databaseRepository: DatabaseRepository;

    beforeEach(() => {
        databaseRepository = new DatabaseRepository(DatabaseType.MySQL);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execSql', () => {
        test('should return the value', async () => {
            jest.spyOn(databaseRepository, 'dbOperation').mockResolvedValueOnce('value');
            
            const sql = 'SELECT * FROM users';
            const values = ['John'];
            const result = await databaseRepository.execSql(sql, values);

            // Check the result
            expect(result).toBe('value');
        });
    });

    describe('existsTable', () => {
        test('should return true if table exists', async () => {
            jest.spyOn(databaseRepository, 'execSql').mockResolvedValueOnce([{ exists: 1 }]);

            const result = await databaseRepository.existsTable('user');

            expect(result).toBe(true);
            expect(databaseRepository.execSql).toHaveBeenCalledTimes(1);
        });

        test('should return false if table exists', async () => {
            jest.spyOn(databaseRepository, 'execSql').mockResolvedValueOnce([]);

            const result = await databaseRepository.existsTable('user');

            expect(result).toBe(false);
            expect(databaseRepository.execSql).toHaveBeenCalledTimes(1);
        });
    });

    describe('createUserTableIfNotExists', () => {
        test('should return undefined if table exists', async () => {
            jest.spyOn(databaseRepository, 'existsTable').mockResolvedValueOnce(true);
            jest.spyOn(databaseRepository, 'execSql').mockResolvedValueOnce(undefined);

            const result = await databaseRepository.createUserTableIfNotExists();

            expect(result).toBe(undefined);
            expect(databaseRepository.existsTable).toHaveBeenCalledTimes(1);
            expect(databaseRepository.execSql).not.toHaveBeenCalled();
        });

        test('should create a table if it does not exist', async () => {
            jest.spyOn(databaseRepository, 'existsTable').mockResolvedValueOnce(false);
            jest.spyOn(databaseRepository, 'execSql').mockResolvedValueOnce(undefined);

            const result = await databaseRepository.createUserTableIfNotExists();

            expect(result).toBe(undefined);
            expect(databaseRepository.existsTable).toHaveBeenCalledTimes(1);
            expect(databaseRepository.execSql).toHaveBeenCalledTimes(1);
        });
    });

    describe('createImageTableIfNotExists', () => {
        test('should return undefined if table exists', async () => {
            jest.spyOn(databaseRepository, 'existsTable').mockResolvedValueOnce(true);
            jest.spyOn(databaseRepository, 'execSql').mockResolvedValueOnce(undefined);

            const result = await databaseRepository.createImageTableIfNotExists();

            expect(result).toBe(undefined);
            expect(databaseRepository.existsTable).toHaveBeenCalledTimes(1);
            expect(databaseRepository.execSql).not.toHaveBeenCalled();
        });

        test('should create a table if it does not exist', async () => {
            jest.spyOn(databaseRepository, 'existsTable').mockResolvedValueOnce(false);
            jest.spyOn(databaseRepository, 'execSql').mockResolvedValueOnce(undefined);

            const result = await databaseRepository.createImageTableIfNotExists();

            expect(result).toBe(undefined);
            expect(databaseRepository.existsTable).toHaveBeenCalledTimes(1);
            expect(databaseRepository.execSql).toHaveBeenCalledTimes(1);
        });
    });


});
