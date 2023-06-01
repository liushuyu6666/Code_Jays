import { S3Client } from '@aws-sdk/client-s3';
import { DatabaseType } from '../../src/Database/DatabaseRepository';
import { ImageService } from '../../src/Image/ImageService';
import { Image } from '../../src/Image/Image';

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

// TODO: 1, use variable
// TODO: 2, another way to mock S3Repositoryj
jest.mock('../../src/S3/S3Repository', () => {
    return {
        S3Repository: jest.fn().mockImplementation(() => {
            return {
                uploadFile: jest
                    .fn()
                    .mockResolvedValueOnce('url')
                    .mockResolvedValueOnce(undefined),
            };
        }),
    };
});

describe('Test ImageService', () => {
    let imageService: ImageService;
    let mockS3Client: jest.Mocked<S3Client>;

    beforeAll(() => {
        imageService = new ImageService(
            DatabaseType.MySQL,
            mockS3Client,
            'bucket-name',
        );
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    describe('uploadImage', () => {
        it('should upload an image and create an entry in the repository', async () => {
            const mockFile: Express.Multer.File =
                {} as unknown as Express.Multer.File;

            const mockImage = await imageService.uploadImage(
                'fileName',
                mockFile,
                'userId',
            );

            expect(mockImage).toMatchSnapshot();
        });

        it('should return undefined if url is undefined', async () => {
            const mockFile: Express.Multer.File =
                {} as unknown as Express.Multer.File;

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
