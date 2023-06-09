import { ImageRepository, ImageRepositoryFactory } from './ImageRepository';
import { S3Repository } from '../S3/S3Repository';
import { v4 as uuidv4 } from 'uuid';
import { Image } from './Image';
import { S3Client } from '@aws-sdk/client-s3';
import { DatabaseType } from '../Database/DatabaseRepository';

export class ImageService {
    private imageRepository: ImageRepository;
    private s3Repository: S3Repository;

    constructor(
        databaseType: DatabaseType,
        s3Client: S3Client,
        bucketName: string,
    ) {
        this.s3Repository = new S3Repository(s3Client, bucketName);
        this.imageRepository =
            ImageRepositoryFactory.createImageRepository(databaseType);
        
    }

    async uploadImage(
        imageName: string,
        imageContent: Express.Multer.File,
        userId: string
    ): Promise<Image | undefined> {
        // Generate id
        const imageId = uuidv4();

        const url = await this.s3Repository.uploadFile(
            imageId,
            imageContent,
            'images',
        );
        if (!url) {
            return undefined;
        }

        return await this.imageRepository.createImage(
            imageId,
            userId,
            imageName,
            url,
            new Date(),
        );
    }

    async listImages(userId: string): Promise<Image[] | undefined> {
        return await this.imageRepository.listImages(userId);
    }
}
