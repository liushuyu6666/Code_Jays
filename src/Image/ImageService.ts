import { DbOperation } from '../../db';
import { DatabaseType } from '../User/UserRepository';
import { ImageRepository, ImageRepositoryFactory } from './ImageRepository';
import { S3Repository } from '../S3/S3Repository';
import { v4 as uuidv4 } from 'uuid';
import { Image } from './Image';


export class ImageService {
    private imageRepository: ImageRepository;
    private s3Repository: S3Repository;

    constructor(databaseType: DatabaseType, dbOperation: DbOperation, s3Client: AWS.S3, bucketName: string) {
        this.imageRepository = ImageRepositoryFactory.createImageRepository(
            databaseType,
            dbOperation,
        );
        this.s3Repository = new S3Repository(s3Client, bucketName);
    }

    async uploadImage(imageName: string, imageContent: Buffer): Promise<Image> {
        // Generate id
        const imageId = uuidv4();

        const url = await this.s3Repository.uploadFile(imageId, imageContent, 'images');

        return await this.imageRepository.createImage(imageId, imageName, url, new Date());
    }
}
