import { S3Client } from '@aws-sdk/client-s3';
import { ImageService } from './ImageService';
import { Request, Response } from 'express';
import { DatabaseType } from '../Database/DatabaseRepository';
import { AuthService } from '../Auth/AuthService';
import { JwtPayload } from 'jsonwebtoken';

export class ImageController {
    private imageService: ImageService;
    private authService: AuthService;

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
        this.authService = new AuthService();
    }

    async uploadImageToS3(
        req: Request,
        res: Response,
    ): Promise<Response<any, Record<string, any>>> {
        const { imageName } = req.body;
        const { authorization } = req.headers;
        const file = req.file; // Multer will load the image to req.file.

        if (!file || !imageName) {
            return res
                .status(400)
                .json({ error: 'Image or image name are required' });
        }

        if (!authorization) {
            return res.status(401).json({
                error: 'Unauthorized',
            });
        }

        const { userId } = this.authService.authenticateToken(authorization) as JwtPayload;

        const insertedImage = await this.imageService.uploadImage(
            imageName,
            file,
            userId as unknown as string
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
        req: Request,
        res: Response,
    ): Promise<Response<any, Record<string, any>>> {
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({
                error: 'Unauthorized',
            });
        }

        const { userId } = this.authService.authenticateToken(authorization) as JwtPayload;

        const images = await this.imageService.listImages(userId as unknown as string);

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
