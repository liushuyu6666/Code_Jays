import { S3Client } from '@aws-sdk/client-s3';
import { DatabaseType } from '../../src/Database/DatabaseRepository';
import { ImageService } from '../../src/Image/ImageService';
import { Image } from '../../src/Image/Image';
import { S3Repository } from '../../src/S3/S3Repository';

const mockImage1 = new Image(
    'imageId',
    'userId',
    'image1',
    'url',
    new Date(Date.parse('2000-01-01')),
);

jest.mock('../../src/Image/ImageRepository', () => {
    return {
        ImageRepositoryFactory: {
            createImageRepository: jest.fn().mockImplementation(() => {
                return {
                    createImage: jest.fn().mockResolvedValue(mockImage1),
                    listImages: jest.fn().mockResolvedValue([mockImage1]),
                };
            }),
        },
    };
});

describe('Test ImageService', () => {
    let imageService: ImageService;
    let mockS3Client: jest.Mocked<S3Client>;
    let mockFile: Express.Multer.File;

    beforeEach(() => {
        mockFile = {} as unknown as Express.Multer.File;
        imageService = new ImageService(
            DatabaseType.MySQL,
            mockS3Client,
            'bucket-name',
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadImage', () => {
        it('should upload an image and create an entry in the repository', async () => {
            // Return value of the method can be modified upon different cases
            jest.spyOn(S3Repository.prototype, 'uploadFile').mockResolvedValue('url');

            const mockImage = await imageService.uploadImage(
                'fileName',
                mockFile,
                'userId',
            );

            expect(mockImage).toMatchSnapshot();
        });

        it('should return undefined if url is undefined', async () => {
            jest.spyOn(S3Repository.prototype, 'uploadFile').mockResolvedValue(undefined);

            const mockImage = await imageService.uploadImage(
                'fileName',
                mockFile,
                'userId',
            );

            expect(mockImage).toMatchSnapshot();
        });
    });

    describe('listImage', () => {
        it('should return image array', async () => {
            const mockImage = await imageService.listImages('userId');

            expect(mockImage).toMatchSnapshot();
        });
    });
});
