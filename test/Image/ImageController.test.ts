import { S3Client } from '@aws-sdk/client-s3';
import { AuthService } from '../../src/Auth/AuthService';
import { DatabaseType } from '../../src/Database/DatabaseRepository';
import { Image } from '../../src/Image/Image';
import { ImageController } from '../../src/Image/ImageController';
import { ImageService } from '../../src/Image/ImageService';

const insertedImage: Image = new Image(
    'imageId',
    'userId',
    'fileName',
    'url',
    new Date(Date.parse('2000-01-01')),
);

const mockReqFunc = (authorization: undefined | string, file: undefined | Express.Multer.File) => {
    return {
        body: {
            imageName: 'imageName',
        },
        headers: {
            authorization: authorization,
        },
        file: file,
    };
};

describe('ImageController', () => {
    let imageController: ImageController;
    let mockS3Client: jest.Mocked<S3Client>;
    let mockReq: any;
    let mockRes: any;

    describe('uploadImageToS3', () => {
        beforeEach(() => {
            imageController = new ImageController(
                DatabaseType.MongoDB,
                mockS3Client,
                'bucketName',
            );

            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('return 400 when there is no file or imageName', async () => {
            mockReq = mockReqFunc('authorization', undefined);

            const result = await imageController.uploadImageToS3(
                mockReq,
                mockRes,
            );

            expect(mockRes.status).toBeCalledTimes(1);
            expect(result.status).toBeCalledWith(400);
            expect(result.json).toBeCalledWith({ error: 'Image or image name are required' })
        });

        test('return 401 if it is unauthorized', async () => {
            mockReq = mockReqFunc(undefined, {} as unknown as Express.Multer.File);

            const result = await imageController.uploadImageToS3(
                mockReq,
                mockRes,
            );

            expect(mockRes.status).toBeCalledTimes(1);
            expect(result.status).toBeCalledWith(401);
            expect(result.json).toBeCalledWith({ error: 'Unauthorized' })
        });

        test('return 500 if it is no image was inserted', async () => {
            mockReq = mockReqFunc('authorization', {} as unknown as Express.Multer.File);

            jest.spyOn(AuthService.prototype, 'authenticateToken').mockReturnValue({ userId: 'userId' });
            jest.spyOn(ImageService.prototype, 'uploadImage').mockResolvedValue(undefined);

            const result = await imageController.uploadImageToS3(
                mockReq,
                mockRes,
            );

            expect(mockRes.status).toBeCalledTimes(1);
            expect(result.status).toBeCalledWith(500);
            expect(result.json).toBeCalledWith({ message: `No such bucket, please use terraform to create one.` })
        });

        test('return 201 if the image uploaded successfully', async () => {
            mockReq = mockReqFunc('authorization', {} as unknown as Express.Multer.File);

            jest.spyOn(AuthService.prototype, 'authenticateToken').mockReturnValue({ userId: 'userId' });
            jest.spyOn(ImageService.prototype, 'uploadImage').mockResolvedValue(insertedImage);

            const result = await imageController.uploadImageToS3(
                mockReq,
                mockRes,
            );

            expect(mockRes.status).toBeCalledTimes(1);
            expect(result.status).toBeCalledWith(201);
            expect(result.json).toBeCalledWith({ message: `Image imageName uploaded successfully` })
        });
    });

    describe('listImage', () => {
        beforeEach(() => {
            imageController = new ImageController(
                DatabaseType.MongoDB,
                mockS3Client,
                'bucketName',
            );

            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
                end: jest.fn().mockReturnThis()
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('return 401 if it is unauthorized', async () => {
            mockReq = mockReqFunc(undefined, undefined);

            const result = await imageController.listImages(
                mockReq,
                mockRes,
            );

            expect(mockRes.status).toBeCalledTimes(1);
            expect(result.status).toBeCalledWith(401);
            expect(result.json).toBeCalledWith({ error: 'Unauthorized' })
        });

        test('return 204 if no such image', async () => {
            mockReq = mockReqFunc('authorized', undefined);

            jest.spyOn(AuthService.prototype, 'authenticateToken').mockReturnValue({ userId: 'userId' });
            jest.spyOn(ImageService.prototype, 'listImages').mockResolvedValue(undefined);

            const result = await imageController.listImages(
                mockReq,
                mockRes,
            );

            expect(mockRes.status).toBeCalledTimes(1);
            expect(result.status).toBeCalledWith(204);
            expect(result.json).toBeCalledWith({ message: `No such images` });
            expect(result.end).toBeCalledTimes(1)
        });

        test('return 200 if got images', async () => {
            mockReq = mockReqFunc('authorized', undefined);

            jest.spyOn(AuthService.prototype, 'authenticateToken').mockReturnValue({ userId: 'userId' });
            jest.spyOn(ImageService.prototype, 'listImages').mockResolvedValue([insertedImage]);

            const result = await imageController.listImages(
                mockReq,
                mockRes,
            );

            expect(mockRes.status).toBeCalledTimes(1);
            expect(result.status).toBeCalledWith(200);
            expect(result.json).toMatchSnapshot();
            expect(result.end).toBeCalledTimes(1)
        });
    });
});
