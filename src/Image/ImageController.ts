import { S3Client } from '@aws-sdk/client-s3';
import { ImageService } from './ImageService';
import { Request, Response } from 'express';
import { DatabaseType } from '../Database/DatabaseRepository';

export class ImageController {
    private imageService: ImageService;

    constructor(
        databaseType: DatabaseType,
        s3Client: S3Client,
        bucketName: string,
    ) {
        this.imageService = new ImageService(
            databaseType,
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

        const insertedImage = await this.imageService.uploadImage(
            imageName,
            file,
        );

        if (!insertedImage) {
            return res.status(500).json({
                message: `No such bucket, please use terraform to create one.`,
            });
        }

        return res.status(201).json({
            message: `Image ${imageName} uploaded successfully`,
        });
    }

    async listImages(
        _: Request,
        res: Response,
    ): Promise<Response<any, Record<string, any>>> {
        const images = await this.imageService.listImages();

        if (!images) {
            return res
                .status(204)
                .json({
                    message: `No such images`,
                })
                .end();
        } else {
            return res.json({
                images,
            });
        }
    }
}
