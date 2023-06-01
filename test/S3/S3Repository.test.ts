import { S3Client } from '@aws-sdk/client-s3';
import { S3Repository } from '../../src/S3/S3Repository';

jest.mock('@aws-sdk/client-s3', () => {
    return {
        HeadBucketCommand: jest.fn().mockReturnValue({}),
        PutObjectCommand: jest.fn().mockReturnValue({}),
        S3Client: jest.fn().mockImplementation(() => ({
            send: jest.fn(),
        })),
    };
});

describe('S3Repository', () => {
    let s3Client: S3Client;
    let s3Repository: S3Repository;

    beforeEach(() => {
        s3Client = new S3Client({});
        s3Repository = new S3Repository(s3Client, 'bucketName');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('existsBucket', () => {
        test('return true if bucket exists', async () => {
            s3Client.send = jest.fn().mockResolvedValue({});
            const result = await s3Repository.existsBucket('bucketName');

            expect(result).toBe(true);
            expect(s3Client.send).toBeCalledTimes(1);
        });

        test('return false if bucket does not exist', async () => {
            s3Client.send = jest.fn().mockRejectedValue({});
            const result = await s3Repository.existsBucket('bucketName');

            expect(result).toBe(false);
            expect(s3Client.send).toBeCalledTimes(1);
        });
    });

    describe('uploadFile', () => {
        test('return undefined if bucket does not exist', async () => {
            jest.spyOn(S3Repository.prototype, 'existsBucket').mockResolvedValue(false);
            
            const result = await s3Repository.uploadFile('fileId', {} as unknown as Express.Multer.File);

            expect(result).toBe(undefined);
            expect(S3Repository.prototype.existsBucket).toBeCalledTimes(1);
        });

        test('return key value if bucket exists', async () => {
            jest.spyOn(S3Repository.prototype, 'existsBucket').mockResolvedValue(true);
            
            const result = await s3Repository.uploadFile('fileId', {} as unknown as Express.Multer.File, 'prefix');

            expect(result).toBe('prefix/fileId');
            expect(S3Repository.prototype.existsBucket).toBeCalledTimes(1);
            expect(s3Client.send).toBeCalledTimes(1);
        });
    });
});
