import { MongoClient } from "mongodb";
import { ImageRepositoryFactory, MongodbImageRepository, MysqlImageRepository } from "../../src/Image/ImageRepository";
import { DatabaseType } from "../../src/Database/DatabaseRepository";

describe('Test MongodbImageRepository', () => {
    let mongodbImageRepository: MongodbImageRepository;
    let mockMongoClient: jest.Mocked<MongoClient>;
    let date: Date;

    beforeEach(() => {
        date = new Date(Date.parse('01 Jan 2000 00:00:00 GMT'));
        mongodbImageRepository = new MongodbImageRepository();
        mockMongoClient = {
            db: jest.fn().mockReturnValue({
                collection: jest.fn().mockReturnValue({
                    insertOne: jest.fn().mockResolvedValueOnce(undefined),
                    find: jest.fn().mockReturnValueOnce({
                        toArray: jest.fn().mockResolvedValueOnce([
                            {
                                imageId: '1',
                                fileName: 'image1',
                                url: 'https://undefined.s3.undefined.amazonaws.com/key1',
                                uploadDate: date
                            },
                            {
                                imageId: '2',
                                fileName: 'image2',
                                url: 'https://undefined.s3.undefined.amazonaws.com/key2',
                                uploadDate: date
                            }
                        ])
                    })
                }),
            }),
            close: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<MongoClient>;

        (MongoClient.connect as jest.Mock) = jest
            .fn()
            .mockResolvedValue(mockMongoClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createImage', () => {
        test('should return the image', async () => {
            jest.spyOn(mongodbImageRepository, 'createCollectionIfNotExists').mockResolvedValue(undefined);

            const insertedImage = await mongodbImageRepository.createImage('1', 'user1', 'image', 'key', date);

            expect(mongodbImageRepository.createCollectionIfNotExists).toHaveBeenCalledTimes(1);
            expect(MongoClient.connect).toHaveBeenCalledTimes(1);
            expect(mockMongoClient.db().collection).toHaveBeenCalledTimes(1);
            expect(mockMongoClient.db().collection('Image').insertOne).toHaveBeenCalledTimes(1);
            expect(mockMongoClient.close).toHaveBeenCalledTimes(1);
            expect(insertedImage).toMatchSnapshot()
        })
    });

    describe('listImage', () => {
        test('should return all images if exists', async () => {
            jest.spyOn(mongodbImageRepository, 'existsCollection').mockResolvedValue(true);

            const images = await mongodbImageRepository.listImages('user1');

            expect(mongodbImageRepository.existsCollection).toHaveBeenCalledTimes(1);
            expect(MongoClient.connect).toHaveBeenCalledTimes(1);
            expect(mockMongoClient.db().collection).toHaveBeenCalledTimes(1);
            expect(mockMongoClient.db().collection('Image').find).toHaveBeenCalledTimes(1);
            expect(mockMongoClient.close).toHaveBeenCalledTimes(1);
            expect(images).toMatchSnapshot()
        });

        test('should return undefined if the collection does not exist', async () => {
            jest.spyOn(mongodbImageRepository, 'existsCollection').mockResolvedValue(false);

            const result = await mongodbImageRepository.listImages('user1');

            expect(mongodbImageRepository.existsCollection).toHaveBeenCalledTimes(1);
            expect(MongoClient.connect).not.toHaveBeenCalled();
            expect(mockMongoClient.db().collection).not.toHaveBeenCalled();
            expect(mockMongoClient.db().collection('Image').find).not.toHaveBeenCalled();
            expect(mockMongoClient.close).not.toHaveBeenCalled();
            expect(result).toBe(undefined);
        })
    });
});

describe('Test MysqlImageRepository', () => {
    let mysqlImageRepository: MysqlImageRepository;
    let date: Date;

    beforeEach(() => {
        date = new Date(Date.parse('01 Jan 2000 00:00:00 GMT'))
        mysqlImageRepository = new MysqlImageRepository();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createImage', () => {
        test('should return the image', async () => {
            jest.spyOn(mysqlImageRepository, 'createImageTableIfNotExists').mockResolvedValue(undefined);
            jest.spyOn(mysqlImageRepository, 'execSql').mockResolvedValue(undefined);

            const insertedImage = await mysqlImageRepository.createImage('1', 'user1', 'image', 'key', date);

            expect(mysqlImageRepository.createImageTableIfNotExists).toHaveBeenCalledTimes(1);
            expect(mysqlImageRepository.execSql).toHaveBeenCalledTimes(1);
            expect(insertedImage).toMatchSnapshot()
        })
    });

    describe('listImage', () => {
        test('should return all images if the table exists', async () => {
            jest.spyOn(mysqlImageRepository, 'existsTable').mockResolvedValue(true);
            jest.spyOn(mysqlImageRepository, 'execSql').mockResolvedValue([
                {
                    imageId: '1',
                    fileName: 'image1',
                    url: 'https://undefined.s3.undefined.amazonaws.com/key1',
                    uploadDate: date
                },
                {
                    imageId: '2',
                    fileName: 'image2',
                    url: 'https://undefined.s3.undefined.amazonaws.com/key2',
                    uploadDate: date
                }
            ]);

            const images = await mysqlImageRepository.listImages('user1');

            expect(mysqlImageRepository.existsTable).toHaveBeenCalledTimes(1);
            expect(mysqlImageRepository.execSql).toHaveBeenCalledTimes(1);
            expect(images).toMatchSnapshot()
        });

        test('should return undefined if the table does not exist', async () => {
            jest.spyOn(mysqlImageRepository, 'existsTable').mockResolvedValue(false);
            jest.spyOn(mysqlImageRepository, 'execSql').mockResolvedValue(undefined);

            const result = await mysqlImageRepository.listImages('user1');

            expect(mysqlImageRepository.existsTable).toHaveBeenCalledTimes(1);
            expect(mysqlImageRepository.execSql).not.toHaveBeenCalled();
            expect(result).toBe(undefined);
        })
    });
})

describe('Test ImageRepositoryFactory', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return MongodbImageRepository if it is MongoDB', () => {
        const result = ImageRepositoryFactory.createImageRepository(DatabaseType.MongoDB);
        expect(result).toBeInstanceOf(MongodbImageRepository);
    });

    test('should return MysqlImageRepository if it is Mysql', () => {
        const result = ImageRepositoryFactory.createImageRepository(DatabaseType.MySQL);
        expect(result).toBeInstanceOf(MysqlImageRepository);
    });

    test('should throw an error for an invalid database type', () => {
        expect(() => {
            ImageRepositoryFactory.createImageRepository('InvalidDatabaseType' as unknown as  DatabaseType);
          }).toThrowError('Invalid database type');
    });
})