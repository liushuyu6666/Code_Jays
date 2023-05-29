import { S3Client } from '@aws-sdk/client-s3';
import { DbOperation } from '../../db';
import { DatabaseType } from '../User/UserRepository';
import { ImageService } from './ImageService';
import { Request, Response } from 'express';

export class ImageController {
    private imageService: ImageService;

    constructor(
        databaseType: DatabaseType,
        dbOperation: DbOperation,
        s3Client: S3Client,
        bucketName: string,
    ) {
        this.imageService = new ImageService(
            databaseType,
            dbOperation,
            s3Client,
            bucketName,
        );
    }

    async uploadImageToS3(
        req: Request,
        res: Response,
    ): Promise<Response<any, Record<string, any>>> {
        const { imageName } = req.body;
        const file = req.file; // Multer will load the image to req.file.

        if (!file || !imageName) {
            return res
                .status(400)
                .json({ error: 'Image or image name are required' });
        }

        await this.imageService.uploadImage(imageName, file);

        return res
            .status(201)
            .json({ message: `Image ${imageName} uploaded successfully` });
    }
}
